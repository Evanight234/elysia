import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import ForgetPassword from './pages/auth/ForgetPassword'
import Home from './pages/users/Home'
import Library from './pages/users/Library'
import Notifications from './pages/users/Notifications'
import Profile from './pages/users/Profile'
import Search from './pages/users/Search'
import ReadChapter from './pages/users/ReadChapter'
import BookDetail from './pages/users/BookDetail'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import AdminHome from './pages/admin/AdminHome'
import AdminUserControl from './pages/admin/AdminControl'
import AdminProfile from './pages/admin/AdminProfile'
import AdminNotification from './pages/admin/AdminNotification'
import AdminBooks from './pages/admin/AdminBooks'
import AdminChapters from './pages/admin/AdminChapters'


// ── Bersihkan token tapi jaga avatar & bahasa ─────────────
function clearAuth() {
  const keep: { key: string; value: string }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('avatar_') || key === 'elysiaapp_lang')) {
      keep.push({ key, value: localStorage.getItem(key) || '' })
    }
  }
  localStorage.clear()
  keep.forEach(({ key, value }) => localStorage.setItem(key, value))
}

function getUserRole(): 'ADMIN' | 'USER' | null {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user).role : null
  } catch {
    return null
  }
}

// ── Hook: verifikasi token ke backend ─────────────────────
function useAuthCheck() {
  const [checked, setChecked] = useState(false)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setValid(false)
        setChecked(true)
        return
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.data.success) {
          // Refresh data user dari backend supaya selalu up to date
          localStorage.setItem('user', JSON.stringify(res.data.data))
          setValid(true)
        } else {
          clearAuth()
          setValid(false)
        }
      } catch {
        // Token invalid / expired → paksa logout
        clearAuth()
        setValid(false)
      } finally {
        setChecked(true)
      }
    }

    verify()
  }, [])

  return { checked, valid }
}

// ── Loading screen ────────────────────────────────────────
function AuthChecking() {
  return <div className="auth-checking" />
}

// ── Guards ────────────────────────────────────────────────
function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const { checked, valid } = useAuthCheck()
  if (!checked) return <AuthChecking />
  if (valid) {
    return <Navigate to={getUserRole() === 'ADMIN' ? '/admin' : '/home'} replace />
  }
  return <>{children}</>
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { checked, valid } = useAuthCheck()
  if (!checked) return <AuthChecking />
  if (!valid) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireUser({ children }: { children: React.ReactNode }) {
  const { checked, valid } = useAuthCheck()
  if (!checked) return <AuthChecking />
  if (!valid) return <Navigate to="/login" replace />
  if (getUserRole() !== 'USER') return <Navigate to="/admin" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { checked, valid } = useAuthCheck()
  if (!checked) return <AuthChecking />
  if (!valid) return <Navigate to="/login" replace />
  if (getUserRole() !== 'ADMIN') return <Navigate to="/home" replace />
  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <RedirectIfLoggedIn>
            <Navigate to="/login" replace />
          </RedirectIfLoggedIn>
        } />

        {/* Auth */}
        <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
        <Route path="/auth/lupa-kata-sandi" element={<RedirectIfLoggedIn><ForgetPassword /></RedirectIfLoggedIn>} />

        {/* User */}
        <Route path="/home" element={<RequireUser><Home /></RequireUser>} />
        <Route path="/search" element={<RequireUser><Search /></RequireUser>} />
        <Route path="/library" element={<RequireUser><Library /></RequireUser>} />
        <Route path="/notifications" element={<RequireUser><Notifications /></RequireUser>} />
        <Route path="/profile" element={<RequireUser><Profile /></RequireUser>} />

        {/* Bisa diakses USER & ADMIN */}
        <Route path="/books/:id" element={<RequireAuth><BookDetail /></RequireAuth>} />
        <Route path="/read/:bookId/chapter/:chapterNumber" element={<RequireAuth><ReadChapter /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUserControl /></RequireAdmin>} />
        <Route path="/admin/books" element={<RequireAdmin><AdminBooks /></RequireAdmin>} />
        <Route path="/admin/chapters" element={<RequireAdmin><AdminChapters /></RequireAdmin>} />
        <Route path="/admin/notification" element={<RequireAdmin><AdminNotification /></RequireAdmin>} />
        <Route path="/admin/profile" element={<RequireAdmin><AdminProfile /></RequireAdmin>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App