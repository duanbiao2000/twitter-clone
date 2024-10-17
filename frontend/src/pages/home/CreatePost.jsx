import { CiImageOn } from "react-icons/ci"; // 导入图片图标
import { BsEmojiSmileFill } from "react-icons/bs"; // 导入笑脸图标
import { useRef, useState } from "react"; // 导入React的useState和useRef钩子
import { IoCloseSharp } from "react-icons/io5"; // 导入关闭图标
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // 导入react-query的useMutation、useQuery和useQueryClient钩子
import { toast } from "react-hot-toast"; // 导入react-hot-toast的toast函数

const CreatePost = () => {
	const [text, setText] = useState(""); // 创建一个名为text的状态变量，用于存储文章内容
	const [img, setImg] = useState(null); // 创建一个名为img的状态变量，用于存储文章图片
	const imgRef = useRef(null); // 创建一个名为imgRef的引用变量，用于存储图片文件

	const { data: authUser } = useQuery({ queryKey: ["authUser"] }); // 使用useQuery钩子获取当前用户信息
	const queryClient = useQueryClient(); // 使用useQueryClient钩子获取查询客户端

	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img }) => {
			try {
				const res = await fetch("/api/posts/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					// 将text和img转换为JSON字符串
					body: JSON.stringify({ text, img }),
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

		// 当创建文章操作成功时调用的回调函数
		onSuccess: () => {
			// 清空文章标题和内容输入框
			setText("");
			// 重置文章图片为初始状态
			setImg(null);
			// 显示成功创建文章的提示信息
			toast.success("Post created successfully");
			// 触发对文章列表的重新查询，以更新文章数据
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	// 提交表单
	const handleSubmit = (e) => {
		// 阻止表单默认提交行为
		e.preventDefault();
		// 调用创建帖子函数，传入文本和图片
		createPost({ text, img });
	};

	// 处理图片改变事件
	const handleImgChange = (e) => {
		// 获取文件对象
		const file = e.target.files[0];
		// 如果文件存在
		if (file) {
			// 创建一个FileReader对象
			const reader = new FileReader();
			// 当文件读取完成时
			reader.onload = () => {
				// 设置图片
				setImg(reader.result);
			};
			// 读取文件
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
					placeholder='What is happening?!'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{img && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img src={img} className='w-full mx-auto h-72 object-contain rounded' />
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} />
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};
export default CreatePost;
