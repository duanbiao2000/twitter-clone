import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
	/**
	 * 根据feedType选择合适的API端点
	 * 此函数实现了对不同类型的feed的API端点的映射，根据feedType的不同返回不同的API路径
	 * @param {string} feedType - 帖子类型，决定了要返回哪种API端点
	 * @param {string} [username] - 用户名，当feedType为"posts"时需要此参数来构建API端点
	 * @param {string} [userId] - 用户ID，当feedType为"likes"时需要此参数来构建API端点
	 * @returns {string} API端点的字符串
	 */
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				// 返回适合所有用户的推荐帖子API端点
				return "/api/posts/all";
			case "following":
				// 返回当前用户关注的用户的帖子API端点
				return "/api/posts/following";
			case "posts":
				// 返回特定用户的帖子API端点，通过用户名构建路径
				return `/api/posts/user/${username}`;
			case "likes":
				// 返回特定用户喜欢的帖子API端点，通过用户ID构建路径
				return `/api/posts/likes/${userId}`;
			default:
				// 当feedType不匹配任何已知类型时，默认返回推荐帖子API端点
				return "/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
