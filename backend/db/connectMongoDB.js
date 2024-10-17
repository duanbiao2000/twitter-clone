import mongoose from "mongoose";

/**
 * 异步连接到MongoDB数据库
 * 
 * 本函数尝试异步连接到MongoDB数据库，使用环境变量中提供的MongoDB连接URI
 * 成功连接后，它将在控制台打印出连接的主机信息
 * 如果连接失败，则在控制台打印出错误信息，并退出进程
 * 
 * @returns {Promise<void>} 无返回值
 */
const connectMongoDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error connection to mongoDB: ${error.message}`);
		// 退出进程，状态码为1，表示异常退出
		process.exit(1);
	}
};

export default connectMongoDB;
