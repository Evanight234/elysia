//src/App.tsx
import './App.css'
import { BrowserRouter, Routes, Route, Navigate, } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Home from './pages/users/Home'
import Library from './pages/users/Library'
import Notifications from './pages/users/Notifications'
import Profile from './pages/users/Profile'
import Search from './pages/users/Search'
import ReadChapter from './pages/users/ReadChapter'
import BookDetail from './pages/users/BookDetail'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import AdminHome from './pages/admin/adminHome'
import AdminUserControl from './pages/admin/adminControl'

function RequireUser({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (getUserRole() !== 'USER') return <Navigate to="/admin" replace />
  return <>{children}</>
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// ── Guard: hanya ADMIN ────────────────────────────────────
function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (getUserRole() !== 'ADMIN') return <Navigate to="/home" replace />
  return <>{children}</>
}


function isLoggedIn(): boolean {
  return !!localStorage.getItem('token') && !!localStorage.getItem('user')
}

function getUserRole(): 'ADMIN' | 'USER' | null {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user).role : null
}


function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  if (isLoggedIn()) {
    const role = getUserRole()
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/home'} replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isLoggedIn()
            ? <Navigate to={getUserRole() === 'ADMIN' ? '/admin' : '/home'} replace />
            : <Navigate to="/login" replace />
        } />
        <Route path="/register" element={
          <RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>
        } />
        <Route path="/login" element={
          <RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>
        } />

        {/* ── User Routes ── */}
        <Route path="/home" element={
          <RequireUser><Home /></RequireUser>
        } />
        <Route path="/search" element={
          <RequireUser><Search /></RequireUser>
        } />
        <Route path="/notifications" element={
          <RequireUser><Notifications /></RequireUser>
        } />
        <Route path="/profile" element={
          <RequireUser><Profile /></RequireUser>
        } />
        <Route path="/search" element={
          <RequireUser><Search /></RequireUser>
        } />
        <Route path="/library" element={
          <RequireUser><Library /></RequireUser>
        } />
        <Route path="/books/:id" element={
          <RequireAuth><BookDetail /></RequireAuth>
        } />
        <Route path="/read/:bookId/chapter/:chapterNumber" element={
          <RequireAuth><ReadChapter /></RequireAuth>
        } />

        <Route path="/admin" element={
          <RequireAdmin><AdminHome /></RequireAdmin>
        } />

        <Route path="/admin/users" element={
          <RequireAdmin><AdminUserControl /></RequireAdmin>
        } />

        <Route path="*" element={
          <Navigate to={isLoggedIn() ? (getUserRole() === 'ADMIN' ? '/admin' : '/home') : '/login'} replace />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App