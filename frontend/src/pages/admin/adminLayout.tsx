import { useState } from "react";
import { useAuthStore } from "../../store/authstore";
import {
    LayoutDashboard, Users, Search,
    User, LogOut, BookHeart, Menu, X
} from 'lucide-react'
import './adminLayout.css'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Home' },
    { to: '/admin/users', icon: Users, label: 'Kontrol User' },
    { to: '/admin/search', icon: Search, label: 'Search' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate()
    const { logout } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <div className="admin-root">

            {/* ── Sidebar ── */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="admin-logo">
                    <BookHeart size={22} />
                    <span>Elysia <em>Admin</em></span>
                </div>

                {/* Nav */}
                <nav className="admin-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/admin'}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={19} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <button className="admin-logout-btn" onClick={handleLogout}>
                    {sidebarOpen ? <span>Log Out</span> : <LogOut size={30} />}
                </button>
            </aside>

            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Konten Utama ── */}
            <div className="admin-main">
                {/* Topbar mobile */}
                <header className="admin-topbar">
                    <button
                        className="admin-menu-btn"
                        onClick={() => setSidebarOpen(v => !v)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <span className="admin-topbar-title">ElysiaApp Admin</span>
                </header>

                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    )
}