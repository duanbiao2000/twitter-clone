import jwt from "jsonwebtoken";

/**
 * 生成令牌并设置Cookie
 * 
 * 此函数负责生成JWT令牌，并将其作为Cookie发送回响应对象它在用户身份验证成功后被调用，
 * 以便在后续请求中跟踪用户而不泄露敏感信息
 * 
 * @param {string} userId - 用户ID，用于生成令牌
 * @param {Object} res - 响应对象，用于设置包含令牌的Cookie
 */
export const generateTokenAndSetCookie = (userId, res) => {
    // 使用jsonwebtoken库和环境变量中的秘密密钥签名令牌，设置有效期为15天
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });

    // 设置jwt Cookie，包含生成的令牌设置Cookie的生存期、安全属性等
    // maxAge: 15 * 24 * 60 * 60 * 1000 指定Cookie的生存期为15天
    // httpOnly: true 防止通过JavaScript访问Cookie，减少XSS攻击的风险
    // sameSite: "strict" 确保Cookie只在站点内请求时发送，防止CSRF攻击
    // secure: process.env.NODE_ENV !== "development" 确保在生产环境中，Cookie仅通过HTTPS发送
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
    });
};
