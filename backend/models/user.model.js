// 导入mongoose库，用于连接MongoDB数据库并定义数据模型
import mongoose from "mongoose";

// 定义用户数据模型的Schema，描述数据的结构和属性
const userSchema = new mongoose.Schema(
	{
		// 用户名，字符串类型，必填，唯一
		username: {
			type: String,
			required: true,
			unique: true,
		},
		// 真实姓名，字符串类型，必填
		fullName: {
			type: String,
			required: true,
		},
		// 密码，字符串类型，必填，最小长度为6
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		// 邮箱，字符串类型，必填，唯一
		email: {
			type: String,
			required: true,
			unique: true,
		},
		// 粉丝列表，引用User模型的ObjectId数组类型，默认为空数组
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		// 关注列表，引用User模型的ObjectId数组类型，默认为空数组
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		// 头像URL，字符串类型，默认为空字符串
		profileImg: {
			type: String,
			default: "",
		},
		// 封面图片URL，字符串类型，默认为空字符串
		coverImg: {
			type: String,
			default: "",
		},
		// 个人简介，字符串类型，默认为空字符串
		bio: {
			type: String,
			default: "",
		},

		// 个人网站链接，字符串类型，默认为空字符串
		link: {
			type: String,
			default: "",
		},
		// 点赞的帖子列表，引用Post模型的ObjectId数组类型，默认为空数组
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
	},
	// 启用时间戳，自动记录创建和更新的时间
	{ timestamps: true }
);

// 根据userSchema创建User模型，映射到MongoDB的User集合
const User = mongoose.model("User", userSchema);

// 导出User模型，供其他文件使用
export default User;