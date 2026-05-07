import { useState, } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, BookHeart, Users, LogOut, LayoutDashboard, User, Icon } from "lucide-react";
import { useAuthStore } from "../../store/authstore";
import "./adminLayout.css"

const NavItem = [
    { to: '/admin', icon: LayoutDashboard, label: 'Home' },
    { to: '/admin/Users', icon: Users, label: 'control users' },
    { to: '/admin/Search', icon: Search, label: 'search' },
    { to: '/admin/Profile', icon: User, label: 'profile' }
]

export default function Adminlayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const hendleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="admin-root">
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">
                    <BookHeart size={22} />
                    <span>Elysia<em>Admin</em></span>
                </div>
                <nav className="admin-nav">
                    {NavItem.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `admin-nav-Item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <button className="admin-logout-btn" onClick={hendleLogout}>
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>

                {sidebarOpen && (
                    <div
                        className="admin-overlay"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </aside>
            {sidebarOpen && (
                <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
            )}
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

