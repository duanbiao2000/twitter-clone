// Import necessary modules and libraries
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

// Import route files
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

// Import MongoDB connection function
import connectMongoDB from "./db/connectMongoDB.js";

// Load environment variables
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Express application
const app = express();
// Set the port for the server to listen on
const PORT = process.env.PORT || 5000;
// Get the absolute path to the directory where the project is located
const __dirname = path.resolve();

// Parse JSON format request bodies, set the maximum size of the request body to 5mb
app.use(express.json({ limit: "5mb" })); 
// Parse URL-encoded request bodies, enable extended parsing mode
app.use(express.urlencoded({ extended: true })); 

// Use the cookie-parser middleware to parse cookies
app.use(cookieParser());

// Set up routing for different APIs
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// If the environment is production, set up serving static files and handling all requests by returning the index.html file
// 判断当前环境是否为生产环境
if (process.env.NODE_ENV === "production") {
    // 配置 Express 以使用前端构建输出的静态文件
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    // 处理所有未明确匹配的路由，重定向至前端的主入口文件
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Start the server and connect to MongoDB
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB();
});