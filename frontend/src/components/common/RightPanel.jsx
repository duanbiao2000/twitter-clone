import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";

/**
 * RightPanel 组件用于展示右侧面板内容，特别是推荐用户的信息
 * 该组件使用了 useQuery 钩子来执行异步查询，获取推荐用户的列表
 */
const RightPanel = () => {
	// 使用 useQuery 钩子进行数据查询
	// 参数包括一个查询键和一个查询函数
	// 查询键 ["suggestedUsers"] 用于唯一标识这个查询
	// 查询函数用于实际执行异步数据请求
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				// 发起网络请求获取推荐用户数据
				const res = await fetch("/api/users/suggested");
				// 解析响应的 JSON 数据
				const data = await res.json();
				// 检查 HTTP 响应状态，如果请求失败则抛出错误
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				// 返回成功获取到的数据
				return data;
			} catch (error) {
				// 捕获并抛出错误，以便于上层组件处理
				throw new Error(error.message);
			}
		},
	});


	const { follow, isPending } = useFollow();

	if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
									>
										{isPending ? <LoadingSpinner size='sm' /> : "Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;
