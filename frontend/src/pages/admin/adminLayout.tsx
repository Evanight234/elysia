import { useState } from "react"
import {
    LayoutDashboard, Users, Bell,
    User, LogOut, BookHeart, Menu, X
} from 'lucide-react'
import './AdminLayout.css'
import { NavLink, useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useTranslation } from 'react-i18next'


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation()
    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: t('nav.dashboard') },
        { to: '/admin/users', icon: Users, label: t('nav.users') },
        { to: '/admin/notification', icon: Bell, label: t('nav.sendNotification') },
        { to: '/admin/profile', icon: User, label: t('nav.profile') },
    ]
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        const keepKeys: { key: string; value: string }[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('avatar_') || key === 'elysiaapp_lang')) {
                keepKeys.push({ key, value: localStorage.getItem(key) || '' })
            }
        }
        localStorage.clear()
        keepKeys.forEach(({ key, value }) => localStorage.setItem(key, value))
        navigate('/login')
    }

    return (
        <div className="admin-root">
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>

                {/* Logo */}
                <div className="admin-logo">
                    <div className="logo-dot" />
                    <span>Elysia</span>
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
                            <Icon size={24} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* ── Language Switcher ── */}
                <div className="admin-lang-wrapper">
                    <div className="admin-divider" />
                    <div className="admin-lang-section">
                        <LanguageSwitcher />
                    </div>
                    <div className="admin-divider" />
                </div>

                {/* Logout */}
                <button className="admin-logout-btn" onClick={handleLogout}>
                    <LogOut size={24} />
                    <span>Log Out</span>
                </button>

            </aside>

            {sidebarOpen && (
                <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="admin-main">
                <header className="admin-topbar">
                    <button className="admin-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <span className="admin-topbar-title">ElysiaApp Admin</span>
                </header>
                <main className="admin-content">{children}</main>
            </div>
        </div>
    )
}