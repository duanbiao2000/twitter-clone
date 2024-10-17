import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	commentOnPost,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// 定义一个GET请求的路由，用于获取所有帖子的信息
// 使用protectRoute中间件保护路由，确保只有经过身份验证的用户才能访问
router.get("/all", protectRoute, getAllPosts);

// 定义一个GET请求的路由，用于获取用户关注的帖子信息
router.get("/following", protectRoute, getFollowingPosts);

// 定义一个GET请求的路由，用于获取特定帖子的点赞信息
// 路由参数:id，表示特定的帖子ID
router.get("/likes/:id", protectRoute, getLikedPosts);

// 定义一个GET请求的路由，用于获取特定用户的帖子信息
// 路由参数:username，表示特定的用户用户名
router.get("/user/:username", protectRoute, getUserPosts);

// 定义一个POST请求的路由，用于创建新的帖子
router.post("/create", protectRoute, createPost);

// 定义一个POST请求的路由，用于处理帖子的点赞或取消点赞操作
// 路由参数:id，表示特定的帖子ID
router.post("/like/:id", protectRoute, likeUnlikePost);

// 定义一个POST请求的路由，用于在特定帖子上发表评论
// 路由参数:id，表示特定的帖子ID
router.post("/comment/:id", protectRoute, commentOnPost);

// 定义一个DELETE请求的路由，用于删除特定的帖子
// 路由参数:id，表示特定的帖子ID
router.delete("/:id", protectRoute, deletePost);

export default router;
