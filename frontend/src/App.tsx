import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Home from './pages/users/Home'
import Search from './pages/users/Search'
import Library from './pages/users/Library'
import Notifications from './pages/users/Notifications'
import Profile from './pages/users/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/daftar" element={<Register />} />
        <Route path="/auth/masuk" element={<Login />} />
        
        {/* User Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/auth/masuk" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App