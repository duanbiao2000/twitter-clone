// 导入React Router的关键组件，用于导航和路由控制
import { Navigate, Route, Routes } from "react-router-dom";

// 导入主页组件
import HomePage from "./pages/home/HomePage";
// 导入登录页面组件
import LoginPage from "./pages/auth/login/LoginPage";
// 导入注册页面组件
import SignUpPage from "./pages/auth/signup/SignUpPage";
// 导入通知页面组件
import NotificationPage from "./pages/notification/NotificationPage";
// 导入个人资料页面组件
import ProfilePage from "./pages/profile/ProfilePage";

// 导入通用的侧边栏组件
import Sidebar from "./components/common/Sidebar";
// 导入通用的右侧面板组件
import RightPanel from "./components/common/RightPanel";

// 导入Toaster组件，用于显示顶部提示信息
import { Toaster } from "react-hot-toast";
// 导入React Query的钩子，用于数据获取
import { useQuery } from "@tanstack/react-query";
// 导入加载旋转器组件，用于显示加载动画
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
    // 使用useQuery钩子获取当前登录用户的信息
    const { data: authUser, isLoading } = useQuery({
        // 使用queryKey给查询命名，以便后续引用
        queryKey: ["authUser"],
        // 查询函数，异步获取用户信息
        queryFn: async () => {
            try {
                // 发起HTTP请求获取用户信息
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                // 如果有错误信息，返回null
                if (data.error) return null;
                // 如果HTTP状态码非200，抛出错误
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                // 打印用户信息
                console.log("authUser is here:", data);
                // 返回用户信息
                return data;
            } catch (error) {
                // 如果发生异常，抛出错误
                throw new Error(error);
            }
        },
        // 禁用重试机制
        retry: false,
    });

    // 如果数据加载中，显示加载动画
    if (isLoading) {
        return (
            <div className='h-screen flex justify-center items-center'>
                <LoadingSpinner size='lg' />
            </div>
        );
    }

    // 渲染应用界面
    return (
        <div className='flex max-w-6xl mx-auto'>
            {/* Common component, bc it's not wrapped with Routes */}
            {authUser && <Sidebar />}
            <Routes>
                {/* 根据用户是否登录，显示相应的页面 */}
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
                <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
                <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
            </Routes>
            {authUser && <RightPanel />}
            <Toaster />
        </div>
    );
}

export default App;
