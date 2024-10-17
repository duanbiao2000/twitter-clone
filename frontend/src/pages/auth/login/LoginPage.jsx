import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const queryClient = useQueryClient();

	// 使用useMutation钩子来管理登录操作相关的状态
	const {
		// 登录操作的mutation函数
		mutate: loginMutation,
		// 表示mutation操作是否正在进行
		isPending,
		// 表示mutation操作是否发生错误
		isError,
		// 如果mutation操作发生错误，则包含错误信息
		error,
	} = useMutation({
		// 定义mutation函数，接收username和password参数，用于执行登录操作
		mutationFn: async ({ username, password }) => {
			try {
				// 发送POST请求到后端登录接口
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, password }),
				});

				// 解析后端返回的JSON数据
				const data = await res.json();

				// 如果HTTP状态码表示错误，则抛出异常
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				// 如果发生网络错误或其他错误，抛出异常
				throw new Error(error);
			}
		},
		// 当mutation操作成功时，触发该回调函数
		onSuccess: () => {
			// refetch the authUser
			// 登录成功后，触发authUser查询，以获取最新的用户认证信息
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	/**
	 * 处理表单提交事件
	 * 
	 * @param {Object} e - 表单提交事件对象
	 * 阻止表单的默认提交行为，以防止页面刷新
	 * 调用loginMutation函数，执行登录操作
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
	};

	/**
	 * 处理输入字段变化的回调函数
	 * 
	 * 当表单中的输入字段发生改变时，此函数会更新表单数据对象
	 * 它通过获取事件目标（e.target）的名称和值，来更新formData中对应的属性
	 * 这种更新方式确保了表单数据与用户输入保持一致性
	 * 
	 * @param {ChangeEvent} e - 输入事件对象，包含事件的目标（e.target）信息，如名称和值
	 */
	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading..." : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;
