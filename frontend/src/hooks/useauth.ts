import { useAuthStore } from "../store/authstore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export function useVerifyToken() {
    const { token, user, logout, setAuth } = useAuthStore()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const verify = async () => {
            // Tidak ada token sama sekali → langsung selesai
            if (!token || !user) {
                setChecking(false)
                return
            }

            try {
                // Kirim token ke backend untuk diverifikasi
                // GET /auth/verify dengan header Authorization: Bearer <token>
                const res = await api.get('/auth/verify')

                if (res.data.success) {
                    // Token valid → update data user dari backend
                    // (jaga-jaga kalau ada perubahan data user)
                    setAuth(token, res.data.data.user)
                } else {
                    // Token tidak valid → paksa logout
                    logout()
                }
            } catch (err: any) {
                // Error 401 / token expired / invalid → paksa logout
                if (err.response?.status === 401) {
                    logout()
                }
                // Error lain (misal backend mati) → biarkan tetap login
                // supaya tidak paksa logout saat offline
            } finally {
                setChecking(false)
            }
        }

        verify()
    }, [])   // ← hanya run sekali saat app pertama buka

    return { checking }
}
export const useAuth = () => {
    const { token, user, setAuth, logout: storeLogout } = useAuthStore()
    const navigate = useNavigate();

    const isLoggedIn = !!token && !!user;
    const isAdmin = user?.role === 'ADMIN'
    const isUser = user?.role === 'USER'

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data.data;

        setAuth(token, user);

        if (user.role === 'ADMIN') {
            navigate('/admin');
        }
        else {
            navigate('/home');
        }
    }
    const register = async (name: string, email: string, password: string) => {
        await api.post('/auth/register', { name, email, password });
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