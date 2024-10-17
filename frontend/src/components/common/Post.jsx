// 导入React图标库中的评论图标
import { FaRegComment } from "react-icons/fa";
// 导入Bi图标库中的转发图标
import { BiRepost } from "react-icons/bi";
// 导入React图标库中的心形图标
import { FaRegHeart } from "react-icons/fa";
// 导入React图标库中的书签图标
import { FaRegBookmark } from "react-icons/fa6";
// 导入React图标库中的删除图标
import { FaTrash } from "react-icons/fa";
// 导入React的useState钩子，用于管理组件状态
import { useState } from "react";
// 导入React Router的Link组件，用于创建链接
import { Link } from "react-router-dom";
// 导入TanStack Query的useMutation、useQuery和useQueryClient钩子，用于数据获取和管理
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// 导入React Hot Toast库的toast组件，用于显示通知吐司
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";

const Post = ({ post }) => {
	// 初始化评论状态，用于存储当前输入的评论内容
	const [comment, setComment] = useState("");

	// 使用useQuery钩子获取当前认证用户的信息，queryKey用于唯一标识这个查询
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	// 获取queryClient实例，用于操作查询缓存
	const queryClient = useQueryClient();

	// 提取帖子的所有者信息
	const postOwner = post.user;

	// 判断当前认证用户是否点赞了帖子
	const isLiked = post.likes.includes(authUser._id);

	// 判断当前帖子是否为认证用户自己发布的
	const isMyPost = authUser._id === post.user._id;

	// 格式化帖子创建时间，以便在界面上更友好地显示日期
	const formattedDate = formatPostDate(post.createdAt);
	// 使用useMutation钩子来管理和执行删除帖子的 mutation
	// 这个钩子提供了deletePost函数来触发删除操作，并提供isDeleting状态指示是否正在删除
	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		// 定义mutation函数，用于实际执行删除操作
		// 该函数是异步的，以便在等待服务器响应时不会阻塞UI
		mutationFn: async () => {
			try {
				// 发起DELETE请求到服务器，以删除指定的帖子
				// 使用post._id来标识哪个帖子将被删除
				const res = await fetch(`/api/posts/${post._id}`, {
					method: "DELETE",
				});
				// 等待服务器返回的JSON数据
				const data = await res.json();

				// 如果HTTP响应状态码表示错误（例如，非2xx），则抛出一个错误
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				// 如果一切正常，返回服务器返回的数据
				return data;
			} catch (error) {
				// 捕获并抛出错误，以便上层可以处理
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			// 无效化并重新查询帖子数据
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

// 使用useMutation钩子来管理和执行帖子点赞操作
const { mutate: likePost, isPending: isLiking } = useMutation({
	// 定义 mutation 函数，用于点赞操作
	mutationFn: async () => {
		try {
			// 发起点赞请求
			const res = await fetch(`/api/posts/like/${post._id}`, {
				method: "POST",
			});
			// 解析响应数据
			const data = await res.json();
			// 检查响应状态，如果请求失败则抛出错误
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			// 返回数据，包括更新后的点赞信息
			return data;
		} catch (error) {
			// 捕获并抛出错误
			throw new Error(error);
		}
	},
	// 点赞成功后的回调函数
	onSuccess: (updatedLikes) => {
		// 重新获取所有帖子数据，但这种方式不够优化，因为会影响到所有帖子的数据
		// queryClient.invalidateQueries({ queryKey: ["posts"] });

		// 优化方式：直接更新缓存中指定帖子的点赞信息
		queryClient.setQueryData(["posts"], (oldData) => {
			return oldData.map((p) => {
				// 如果是当前操作的帖子，则更新其点赞信息
				if (p._id === post._id) {
					return { ...p, likes: updatedLikes };
				}
				// 其他帖子保持不变
				return p;
			});
		});
	},
	// 点赞失败后的回调函数
	onError: (error) => {
		// 显示错误提示
		toast.error(error.message);
	},
});

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/comment/${post._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Comment posted successfully");
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleDeletePost = () => {
		deletePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return;
		commentPost();
	};

	const handleLikePost = () => {
		if (isLiking) return;
		likePost();
	};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && (
									<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
								)}

								{isDeleting && <LoadingSpinner size='sm' />}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.user.profileImg || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? <LoadingSpinner size='md' /> : "Post"}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size='sm' />}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
								)}

								<span
									className={`text-sm  group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
										}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;
