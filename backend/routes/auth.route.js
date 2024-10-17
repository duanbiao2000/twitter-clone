import express from "express";
import { getMe, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// 定义一个路由处理函数，用于获取当前用户的信息
router.get("/me", protectRoute, getMe);

// 定义一个路由处理函数，用于处理用户注册的请求
router.post("/signup", signup);

// 定义一个路由处理函数，用于处理用户登录的请求
router.post("/login", login);

// 定义一个路由处理函数，用于处理用户注销的请求
router.post("/logout", logout);

export default router;
