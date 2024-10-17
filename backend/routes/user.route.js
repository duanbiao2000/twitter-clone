import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

// 定义一个处理GET请求的路由，用于获取指定用户的个人资料页面
// 路由参数：username，用于指定需要访问个人资料的用户
// 中间件：protectRoute，用于保护该路由只能由已登录的用户访问
// 中间件：getUserProfile，用于处理获取用户个人资料的逻辑
router.get("/profile/:username", protectRoute, getUserProfile);

// 定义一个处理GET请求的路由，用于获取推荐的用户列表
// 无路由参数
// 中间件：protectRoute，用于保护该路由只能由已登录的用户访问
// 中间件：getSuggestedUsers，用于处理获取推荐用户列表的逻辑
router.get("/suggested", protectRoute, getSuggestedUsers);

// 定义一个处理POST请求的路由，用于关注或取消关注指定的用户
// 路由参数：id，用于指定需要关注或取消关注的用户的ID
// 中间件：protectRoute，用于保护该路由只能由已登录的用户访问
// 中间件：followUnfollowUser，用于处理关注或取消关注用户的逻辑
router.post("/follow/:id", protectRoute, followUnfollowUser);

// 定义一个处理POST请求的路由，用于更新当前用户的个人资料
// 无路由参数
// 中间件：protectRoute，用于保护该路由只能由已登录的用户访问
// 中间件：updateUser，用于处理更新用户个人资料的逻辑
router.post("/update", protectRoute, updateUser);

export default router;
