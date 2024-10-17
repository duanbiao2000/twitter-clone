import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

/**
 * 获取用户个人资料
 * 此函数负责处理来自用户的请求，以检索该用户的个人资料信息
 * 它通过用户名查找用户，并返回用户的信息，但不包括密码
 * 如果用户不存在，则返回404状态码和错误信息
 * 如果出现错误，则记录错误信息，并返回500状态码和错误信息
 *
 * @param {Object} req - 请求对象，包含路径参数、查询参数、请求体等信息
 * @param {Object} res - 响应对象，用于向客户端发送响应
 */
export const getUserProfile = async (req, res) => {
	// 从请求参数中解构出用户名
	const { username } = req.params;

	try {
		// 尝试在数据库中查找用户名对应的学生，但不包括密码信息
		const user = await User.findOne({ username }).select("-password");
		// 如果找不到用户，返回404状态码和错误信息
		if (!user) return res.status(404).json({ message: "User not found" });

		// 如果找到用户，返回200状态码和用户信息（不包括密码）
		res.status(200).json(user);
	} catch (error) {
		// 如果发生错误，记录错误信息，并返回500状态码和错误信息
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

/**
 * Handles following and unfollowing a user.
 * This function checks if the current user is trying to follow/unfollow themselves, validates the user existence,
 * checks the follow status between the users, and updates the follow status accordingly.
 * If the user is already following, it unfollows; if not, it follows the user.
 * Additionally, when following, a notification is sent to the user being followed.
 * 
 * @param {Object} req - The request object, containing the user ID of the user to follow/unfollow and the current user's information.
 * @param {Object} res - The response object, used to send responses back to the client.
 */
export const followUnfollowUser = async (req, res) => {
	try {
		// Extract the user ID to modify from the request parameters
		const { id } = req.params;
		// Find the user to follow/unfollow
		const userToModify = await User.findById(id);
		// Find the current user
		const currentUser = await User.findById(req.user._id);

		// Check if the current user is trying to follow/unfollow themselves
		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		// Validate that both the user to modify and the current user exist
		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		// Check if the current user is already following the user to modify
		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			// 从用户的followers数组中移除当前登录用户_id
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			// 从当前登录用户的following数组中移除用户_id
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			// 创建一个新的通知对象，用于表示关注行为
			// 此处的Notification构造函数接受一个对象作为参数，其中包含通知的类型以及涉及的用户信息
			// 参数说明：
			// - type: 通知类型，此处为"follow"，表示关注
			// - from: 发起关注的用户ID，来自当前请求的用户（req.user._id）
			// - to: 接收关注的用户ID，即需要修改的用户ID（userToModify._id）
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		// Log the error and send an error response
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

/**
 * 获取建议用户列表
 * 此函数旨在为用户推荐他们可能感兴趣的关注者
 * 它过滤掉用户已关注的人，并随机选取部分用户进行推荐
 * 
 * @param {Object} req - 请求对象，包含用户ID
 * @param {Object} res - 响应对象，用于返回建议用户列表
 */
export const getSuggestedUsers = async (req, res) => {
	try {
		// 获取当前用户的ID
		const userId = req.user._id;

		// 加载当前用户关注的用户ID
		const usersFollowedByMe = await User.findById(userId).select("following");

		// 查询不是当前用户且随机选取的10个用户
		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		// 过滤掉当前用户已关注的用户
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		// 从过滤后的用户中取前四个作为建议关注用户
		const suggestedUsers = filteredUsers.slice(0, 4);

		// 移除建议关注用户的密码字段
		suggestedUsers.forEach((user) => (user.password = null));

		// 成功返回建议关注用户列表
		res.status(200).json(suggestedUsers);
	} catch (error) {
		// 错误处理：打印错误信息并返回错误响应
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

// 更新用户信息的异步函数
// 该函数处理传入的用户信息更新请求，包括全名、邮箱、用户名、当前密码、新密码、个人简介和链接
// 同时处理头像和封面图片的更新
export const updateUser = async (req, res) => {
	// 从请求体中提取用户信息
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	// 初始化头像和封面图片变量
	let { profileImg, coverImg } = req.body;

	// 获取当前用户的ID
	const userId = req.user._id;

	try {
		// 查找用户
		let user = await User.findById(userId);
		// 如果用户不存在，返回错误信息
		if (!user) return res.status(404).json({ message: "User not found" });

		// 检查密码字段是否完整
		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		// 如果提供了当前密码和新密码，验证当前密码的正确性
		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			// 如果当前密码不正确，返回错误信息
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			// 检查新密码长度
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			// 加密新密码
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		// 处理头像更新
		if (profileImg) {
			// 如果用户已存在头像，删除旧的头像
			if (user.profileImg) {
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			// 上传新的头像
			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		// 处理封面图片更新
		if (coverImg) {
			// 如果用户已存在封面图片，删除旧的封面图片
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			// 上传新的封面图片
			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		// 更新用户信息
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		// 保存更新后的用户信息
		user = await user.save();

		// 清除响应中的密码字段
		user.password = null;

		// 返回更新后的用户信息
		return res.status(200).json(user);
	} catch (error) {
		// 记录错误信息
		console.log("Error in updateUser: ", error.message);
		// 返回错误信息
		res.status(500).json({ error: error.message });
	}
};
