import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

// 定义一个处理GET请求的路由，用于获取通知信息
// 使用protectRoute中间件保护路由，确保请求者已认证
// 使用getNotifications中间件来处理请求，返回通知信息
router.get("/", protectRoute, getNotifications);

// 定义一个处理DELETE请求的路由，用于删除所有通知
// 同样使用protectRoute中间件保护路由，确保只有认证用户可以执行删除操作
// 使用deleteNotifications中间件来处理请求，删除所有通知信息
router.delete("/", protectRoute, deleteNotifications);

export default router;
