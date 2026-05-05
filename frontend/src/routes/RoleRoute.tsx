import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authstore";

interface Props {
    role: 'ADMIN' | 'USER'
    children: React.ReactNode
}

export default function RoleRoute ({ role, children} : Props) {
    const { user } = useAuthStore();

    if (!user) return <Navigate to="/login" replace />

    if (user.role !== role) {
        return <Navigate to ={user.role === 'ADMIN' ? '../pages/admin/dasboard.tsx' : '../pages/users/home.tsx' } replace />
    }
    return <>{children}</>
}