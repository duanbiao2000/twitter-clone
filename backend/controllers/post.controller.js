import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		// 根据用户ID查找用户
		const user = await User.findById(userId);
		// 如果用户不存在，返回404错误
		if (!user) return res.status(404).json({ message: "User not found" });

		// 验证帖子内容，如果没有文本和图片，返回400错误
		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		// 如果有图片，上传到云存储并获取URL
		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		// 创建新帖子
		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		// 保存帖子到数据库并返回201创建状态
		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		// 处理内部服务器错误
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

// 删除帖子
export const deletePost = async (req, res) => {
	try {
		// 根据ID查找帖子
		const post = await Post.findById(req.params.id);
		// 如果帖子不存在，返回404错误
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// 验证用户权限，如果当前用户不是帖子的拥有者，返回401错误
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		// 如果帖子有图片，从云存储删除图片
		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		// 删除帖子并返回200成功状态
		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 对帖子进行评论
export const commentOnPost = async (req, res) => {
	try {
		// 从请求体中提取评论文本
		const { text } = req.body;
		// 获取帖子ID和当前用户ID
		const postId = req.params.id;
		const userId = req.user._id;

		// 验证评论内容，如果没有文本，返回400错误
		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		// 查找帖子
		const post = await Post.findById(postId);
		// 如果帖子不存在，返回404错误
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// 创建评论并添加到帖子中
		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		// 返回更新后的帖子
		res.status(200).json(post);
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 点赞或取消点赞帖子
export const likeUnlikePost = async (req, res) => {
	try {
		// 获取当前用户ID和帖子ID
		const userId = req.user._id;
		const { id: postId } = req.params;

		// 查找帖子
		const post = await Post.findById(postId);
		// 如果帖子不存在，返回404错误
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// 检查用户是否已点赞帖子
		const userLikedPost = post.likes.includes(userId);

		// 如果用户已点赞帖子，则执行取消点赞操作
		if (userLikedPost) {
			// 取消对帖子的点赞
			// 从帖子的likes数组中移除用户的_id
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			// 从用户的likedPosts数组中移除帖子的_id
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			// 过滤帖子的likes数组，移除用户的_id
			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			// 返回200状态码和更新后的likes数组
			res.status(200).json(updatedLikes);
		} else {
			// 如果未点赞，则点赞帖子
			post.likes.push(userId);
			// 使用User模型的updateOne方法，更新likedPosts字段，添加postId
			// 这里解释了代码的主要功能，即更新用户喜欢的帖子列表
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			// 创建通知并保存到数据库
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			// 设置HTTP响应状态码为200，并以JSON格式返回更新后的点赞数据
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 获取所有帖子
export const getAllPosts = async (req, res) => {
	try {
		// 查找所有帖子并按创建时间排序，同时populate用户和评论的关联数据
		// 查询所有帖子，并按照创建时间从新到旧排序
		const posts = await Post.find()
			.sort({ createdAt: -1 }) // 按创建时间降序排序
			.populate({ // 关联查询发帖用户信息，但不包括密码字段
				path: "user",
				select: "-password",
			})
			.populate({ // 关联查询评论中的用户信息，同样不包括密码字段
				path: "comments.user",
				select: "-password",
			});

		// 如果没有帖子，返回空数组
		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		// 返回所有帖子
		res.status(200).json(posts);
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 获取用户点赞的帖子
export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		// 查找用户
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		// 查找用户点赞的所有帖子并populate关联数据
		// 查询用户喜欢的帖子
		// 此处使用了MongoDB的查询语法，{ _id: { $in: user.likedPosts } }表示查询_id在user.likedPosts数组中的所有帖子
		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		// 返回用户点赞的帖子
		res.status(200).json(likedPosts);
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 获取用户关注的帖子
export const getFollowingPosts = async (req, res) => {
	try {
		// 获取当前用户ID并查找用户
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		// 获取用户关注的列表
		const following = user.following;

		// 查找关注用户的帖子并按创建时间排序，同时populate关联数据
		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		// 返回关注用户的帖子
		res.status(200).json(feedPosts);
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 获取特定用户的帖子
export const getUserPosts = async (req, res) => {
	try {
		// 根据用户名查找用户
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		// 查找该用户的所有帖子并按创建时间排序，同时populate关联数据
		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		// 返回用户的帖子
		res.status(200).json(posts);
	} catch (error) {
		// 处理内部服务器错误
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
