import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authstore";

interface Props {
    children: React.ReactNode
}
export default function ProtectedRoute({ children} : Props) {
    const { token, user} = useAuthStore();

    // paksa ke halaman login jika belum login
    if (!token || !user) {
        return <Navigate to="/login" replace />
    }
    //paksa ke register jika belum punya akun
    if (user && !user.name) {
        return <Navigate to="/register" replace />
    }
    return <>{children}</>
}