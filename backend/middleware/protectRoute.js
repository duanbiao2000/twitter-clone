import User from "../models/user.model.js"; // 导入用户模型
import jwt from "jsonwebtoken"; // 导入JWT库用于验证令牌

/**
 * 保护路由中间件
 * 验证用户请求的JWT令牌，并根据验证结果允许继续处理请求或返回错误响应
 * 
 * @param {Object} req - 请求对象，包含请求信息
 * @param {Object} res - 响应对象，用于发送响应
 * @param {Function} next - 中间件函数，用于将控制权传递给下一个中间件
 */
export const protectRoute = async (req, res, next) => {
    try {
        // 从请求cookies中获取JWT令牌
        const token = req.cookies.jwt;
        // 如果没有提供令牌，则返回401状态码和错误信息
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No Token Provided" });
        }

        // 验证JWT令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 如果解码失败，则返回401状态码和错误信息
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }

        // 根据解码的用户ID查找用户，不包含密码信息
        const user = await User.findById(decoded.userId).select("-password");
        // 如果找不到用户，则返回404状态码和错误信息
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 将用户信息附加到请求对象，并调用next函数将控制权传递给下一个中间件
        req.user = user;
        next();
    } catch (err) {
        // 记录错误信息，并返回500状态码和错误信息
        console.log("Error in protectRoute middleware", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
