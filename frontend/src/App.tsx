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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/read/:bookId/chapter/:chapterNumber" element={<ReadChapter />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App