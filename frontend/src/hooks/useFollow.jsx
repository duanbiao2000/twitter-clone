import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * 使用关注功能的钩子
 * 该钩子提供了处理关注功能的逻辑，包括执行关注操作、处理成功和失败情况
 * 
 * @returns {object} 包含了关注功能的相关属性和方法
 */
const useFollow = () => {
	// 获取查询客户端，用于在关注操作后失效缓存
	const queryClient = useQueryClient();

	// 使用useMutation钩子来管理关注操作的逻辑
	const { mutate: follow, isPending } = useMutation({
		// 定义关注操作的函数
		mutationFn: async (userId) => {
			try {
				// 发送POST请求到服务器以关注指定的用户
				const res = await fetch(`/api/users/follow/${userId}`, {
					method: "POST",
				});

				// 解析响应数据
				const data = await res.json();
				// 如果响应状态码表示错误，则抛出异常
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				// 操作成功，无返回值
				return;
			} catch (error) {
				// 捕获并抛出异常
				throw new Error(error.message);
			}
		},
		// 关注操作成功后的回调函数
		onSuccess: () => {
			// 失效与推荐用户和认证用户相关的查询缓存
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
		},
		// 关注操作失败后的回调函数
		onError: (error) => {
			// 显示错误通知
			toast.error(error.message);
		},
	});

	// 返回关注功能的相关属性和方法
	return { follow, isPending };
};

export default useFollow;
