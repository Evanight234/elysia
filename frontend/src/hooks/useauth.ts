import { useAuthStore } from "../store/authstore";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const useAuth = () => {
    const { token, user, setAuth, logout: storeLogout } = useAuthStore()
    const navigate = useNavigate();

    const isLoggedIn = !!token && !!user;
  const isAdmin    = user?.role === 'ADMIN'
  const isUser     = user?.role === 'USER'

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user} = res.data.data;

        setAuth(token, user);

        if (user.role === 'ADMIN') {
            navigate('/frontend/src/pages/admin/dasboard.tsx');
        }
        else {
            navigate('/frontend/src/pages/users/home.tsx');
        }
    }
    const register = async (name: string, email: string, password: string) => {
        await api.post('../pages/auth/register.tsx', { name, email, password });
        navigate('/login');
    }
    const logout = () => {
            storeLogout()
            navigate('/login')
    }
    return {
        isLoggedIn, isAdmin, isUser, user, login, register, logout
    }
}