import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './UserLayout.css';
import {
  Home,
  Search,
  Library,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next'

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation()

  const handleLogout = () => {
    const keepKeys = ['elysiaapp_lang']
    const savedValues: { key: string; value: string }[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('avatar_') || keepKeys.includes(key))) {
        savedValues.push({ key, value: localStorage.getItem(key) || '' })
      }
    }

    localStorage.clear()

    savedValues.forEach(({ key, value }) => {
      localStorage.setItem(key, value)
    })

    navigate('/login')
  }

  const bottomNavItems = [
    { to: '/home', icon: Home, label: t("nav.home") },
    { to: '/search', icon: Search, label: t("nav.search") },
    { to: '/library', icon: Library, label: t("nav.library") },
    { to: '/notifications', icon: Bell, label: t("nav.notifications") },
    { to: '/profile', icon: User, label: t("nav.profile") },
  ]

  return (
    <div className="user-layout">
      {/* ── Sidebar Desktop ── */}
      <nav className="side-nav">
        <div className="nav-logo">
          <div className="logo-icon-small">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8 C20 8 12 18 12 28 C12 42 24 52 32 56 C40 52 52 42 52 28 C52 18 44 8 32 8Z" fill="#f9a8d4" opacity="0.6" />
              <path d="M32 14 C22 14 18 22 18 29 C18 39 26 47 32 50 C38 47 46 39 46 29 C46 22 42 14 32 14Z" fill="#fbcfe8" />
            </svg>
          </div>
          <span className="logo-text">Elysia</span>
        </div>

        <div className="nav-links">
          <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={20} />
            <span>{t("nav.home")}</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Search size={20} />
            <span>{t("nav.search")}</span>
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Library size={20} />
            <span>{t("nav.library")}</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Bell size={20} />
            <span>{t("nav.notifications")}</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <User size={20} />
            <span>{t("nav.profile")}</span>
          </NavLink>
          <div className="sidebar-lang">
            <LanguageSwitcher />
          </div>
        </div>

        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>{t("nav.logout")}</span>
        </button>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <div className="mobile-top-bar">
        <div className="mobile-logo">
          <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 C20 8 12 18 12 28 C12 42 24 52 32 56 C40 52 52 42 52 28 C52 18 44 8 32 8Z" fill="#f9a8d4" opacity="0.6" />
            <path d="M32 14 C22 14 18 22 18 29 C18 39 26 47 32 50 C38 47 46 39 46 29 C46 22 42 14 32 14Z" fill="#fbcfe8" />
          </svg>
          <span>Elysia</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setDrawerOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile Sliding Drawer ── */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Menu</span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-lang">
            <LanguageSwitcher />
          </div>
          <button className="drawer-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="main-content">
        <div className="content-inner">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        {bottomNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
