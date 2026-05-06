import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authstore'

interface Props {
    role: 'USER' | 'ADMIN'
    children: React.ReactNode
}

export default function RoleRoute({ role, children }: Props) {
    const user = useAuthStore((state) => state.user)

    // Kalau belum login
    if (!user) return <Navigate to="/login" replace />

    // Kalau role tidak cocok
    if (user.role !== role) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/home'} replace />
    }

    return <>{children}</>
}