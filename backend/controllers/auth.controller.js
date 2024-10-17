// 导入生成令牌并设置Cookie的工具函数
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
// 导入User模型
import User from "../models/user.model.js";
// 导入bcryptjs库用于密码哈希
import bcrypt from "bcryptjs";

/**
 * 处理用户注册请求
 * @param {Object} req - 请求对象，包含用户注册信息
 * @param {Object} res - 响应对象，用于发送响应
 */
export const signup = async (req, res) => {
    try {
        // 从请求体中提取用户信息
        const { fullName, username, email, password } = req.body;

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        // 检查邮箱是否已存在
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        // 验证密码长度
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // 生成密码盐并哈希密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 创建新用户
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
        });

        // 如果新用户创建成功，则生成令牌并设置Cookie
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            // 返回用户信息（不包括密码）
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * 处理用户登录请求
 * @param {Object} req - 请求对象，包含用户登录信息
 * @param {Object} res - 响应对象，用于发送响应
 */
export const login = async (req, res) => {
    try {
        // 从请求体中提取用户信息
        const { username, password } = req.body;
        // 根据用户名查找用户
        const user = await User.findOne({ username });
        // 检查用户名和密码是否匹配
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        // 如果用户不存在或密码不正确，则返回错误
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // 生成令牌并设置Cookie
        generateTokenAndSetCookie(user._id, res);

        // 返回用户信息（不包括密码）
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * 处理用户登出请求的异步函数
 * @param {Object} req - 请求对象，包含用户请求的详细信息
 * @param {Object} res - 响应对象，用于向用户发送响应
 */
export const logout = async (req, res) => {
    try {
        // 清除Cookie中的JWT令牌，确保用户登出后，不能再通过令牌访问受保护的资源
        res.cookie("jwt", "", { maxAge: 0 });
        // 登出成功，向客户端发送确认消息
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        // 错误处理：打印错误信息到控制台，并向客户端发送500错误响应
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * 获取当前用户信息
 * 
 * 此函数用于处理获取当前用户信息的请求它根据用户ID查找用户，
 * 并返回用户信息（不包括密码）如果查找过程中出现错误，它将返回一个内部服务器错误
 * @param {Object} req - 请求对象，包含用户ID
 * @param {Object} res - 响应对象，用于返回用户信息或错误
 */
export const getMe = async (req, res) => {
    try {
        // 根据请求中的用户ID查找用户，并排除密码字段
        const user = await User.findById(req.user._id).select("-password");
        // 返回用户信息
        res.status(200).json(user);
    } catch (error) {
        // 输出错误日志
        console.log("Error in getMe controller", error.message);
        // 返回内部服务器错误
        res.status(500).json({ error: "Internal Server Error" });
    }
};
