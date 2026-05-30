import { useState, useEffect } from "react"
import {
    LayoutDashboard, Users, Bell,
    User, LogOut, Menu, X, BookOpen,
    BookMarked
} from 'lucide-react'
import './AdminLayout.css'
import { NavLink, useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { useSidebarState } from '../../hooks/useSidebarState'


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation()
    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: t('nav.dashboard') },
        { to: '/admin/users', icon: Users, label: t('nav.users') },
        { to: '/admin/books', icon: BookOpen, label: t('admin.manage book') },
        { to: '/admin/chapters', icon: BookMarked, label: t('admin.manage chapter') },
        { to: '/admin/notification', icon: Bell, label: t('nav.sendNotification') },
        { to: '/admin/profile', icon: User, label: t('nav.profile') },
    ]
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { sidebarCollapsed, sidebarClass, toggleSidebar } = useSidebarState()

    // Add home-wallpaper-active class to body for glassmorphism styling
    useEffect(() => {
        document.body.classList.add('home-wallpaper-active')
        return () => {
            document.body.classList.remove('home-wallpaper-active')
        }
    }, [])

    // Sync body class for admin page container styling
    useEffect(() => {
        if (sidebarCollapsed) {
            document.body.classList.add('sidebar-collapsed')
        } else {
            document.body.classList.remove('sidebar-collapsed')
        }
    }, [sidebarCollapsed])

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
            {/* Floating Sidebar Toggle Button for Desktop (visible when collapsed) */}
            {sidebarCollapsed && (
                <button className="desktop-sidebar-toggle admin-desktop-toggle" onClick={toggleSidebar} title="Buka Menu">
                    <Menu size={24} />
                </button>
            )}

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>

                {/* Logo */}
                <div className="admin-logo">
                    <div className="logo-dot" />
                    <span>Elysia</span>
                    {/* Close button inside expanded navbar */}
                    <button className="sidebar-close-btn admin-close-btn" onClick={toggleSidebar} title="Tutup Menu">
                        <X size={20} />
                    </button>
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
                    <span>{t('nav.logout')}</span>
                </button>

            </aside>

            {sidebarOpen && (
                <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="admin-main" style={{ position: 'relative' }}>
                {/* Animated Background Blobs & Floating Particles */}
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="crystal-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`crystal-shard shard-${i + 1}`} />
                    ))}
                </div>

                <header className="admin-topbar">
                    <button className="admin-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <span className="admin-topbar-title">ElysiaApp Admin</span>
                </header>
                <main className="admin-content" style={{ position: 'relative', zIndex: 10 }}>{children}</main>
            </div>
        </div>
    )
}