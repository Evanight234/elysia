/* UserLayout.tsx */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './UserLayout.css';
import {
  Home,
  Search,
  Library,
  Bell,
  User,
  LogOut
} from 'lucide-react';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Simpan semua key avatar sebelum logout
    // Key formatnya: "avatar_<email>"
    const avatarKeys: { key: string; value: string }[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('avatar_')) {
        avatarKeys.push({ key, value: localStorage.getItem(key) || '' })
      }
    }

    // Hapus semua data (token, user, dll)
    localStorage.clear()

    // Kembalikan semua avatar key
    avatarKeys.forEach(({ key, value }) => {
      localStorage.setItem(key, value)
    })

    navigate('/login');
  }

  return (
    <div className="user-layout">
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
            <span>Home</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Search size={20} />
            <span>Search</span>
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Library size={20} />
            <span>Library</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Bell size={20} />
            <span>Notification</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </div>

        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </nav>

      <main className="main-content">
        <header className="content-header">
          <div className="search-bar-mini">
            <Search size={16} />
            <input type="text" placeholder="Search books..." />
          </div>
          <div className="header-profile">
            <div className="avatar-mini">
              <User size={16} />
            </div>
          </div>
        </header>
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
