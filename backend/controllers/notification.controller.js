import Notification from "../models/notification.model.js";

/**
 * 获取用户通知
 * 此函数负责检索并更新用户的通知状态
 * 它会查询特定用户的所有通知，将这些通知标记为已读，并返回这些通知的列表
 * 
 * @param {Object} req - 请求对象，包含用户信息
 * @param {Object} res - 响应对象，用于发送响应
 */
export const getNotifications = async (req, res) => {
	try {
		// 提取用户ID
		const userId = req.user._id;

		// 查询用户的所有通知，并包含发送者的用户名和头像信息
		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		// 将所有查询到的通知标记为已读
		await Notification.updateMany({ to: userId }, { read: true });

		// 返回通知列表
		res.status(200).json(notifications);
	} catch (error) {
		// 错误处理：打印错误信息并返回500错误
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

/**
 * 删除用户通知
 * 此函数负责删除特定用户的所有通知
 * 它会从数据库中移除这些通知，并返回一个表示操作成功的消息
 * 
 * @param {Object} req - 请求对象，包含用户信息
 * @param {Object} res - 响应对象，用于发送响应
 */
export const deleteNotifications = async (req, res) => {
	try {
		// 提取用户ID
		const userId = req.user._id;

		// 删除用户的所有通知
		await Notification.deleteMany({ to: userId });

		// 返回操作成功的消息
		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		// 错误处理：打印错误信息并返回500错误
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
