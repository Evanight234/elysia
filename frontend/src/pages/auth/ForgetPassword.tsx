import { useState } from 'react'
import api from '../../api/axios'
import './ForgetPassword.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ForgetPassword() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        // Validasi password cocok
        if (newPassword !== confirm) {
            setStatus('error')
            setMessage('Konfirmasi password tidak cocok.')
            return
        }

        if (newPassword.length < 6) {
            setStatus('error')
            setMessage('Password baru minimal 6 karakter.')
            return
        }

        setStatus('loading')

        try {
            const res = await api.post('/auth/reset-password', {
                email: email.trim(),
                username: username.trim(),
                newPassword: newPassword,
            })

            if (res.data.success) {
                setStatus('success')
                setMessage('Password berhasil diubah! Silakan masuk dengan password baru.')
                // Reset form
                setEmail('')
                setUsername('')
                setNewPassword('')
                setConfirm('')
            }
        } catch (err: any) {
            setStatus('error')
            const msg = err.response?.data?.message
            setMessage(msg || 'Password gagal diubah, silahkan cek lagi email dan username apakah sudah benar.')
        }
    }

    return (
        <div className="fp-wrapper">
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div className="fp-card">
                {/* Logo */}
                <div className="logo-ring">
                    <div className="logo-inner">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
                            <path d="M32 8 C20 8 12 18 12 28 C12 42 24 52 32 56 C40 52 52 42 52 28 C52 18 44 8 32 8Z" fill="#f9a8d4" opacity="0.6" />
                            <path d="M32 14 C22 14 18 22 18 29 C18 39 26 47 32 50 C38 47 46 39 46 29 C46 22 42 14 32 14Z" fill="#fbcfe8" />
                            <ellipse cx="32" cy="30" rx="6" ry="8" fill="white" opacity="0.8" />
                            <circle cx="32" cy="24" r="3" fill="#f472b6" />
                        </svg>
                    </div>
                </div>

                <h1 className="app-title">Elysia App</h1>
                <h2 className="form-subtitle">Lupa Kata Sandi</h2>

                <p className="fp-desc">
                    Masukkan email, username, dan password baru kamu.
                    Fitur ini hanya tersedia untuk akun <strong>User</strong>.
                </p>

                {/* Form */}
                <form className="fp-form" onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="field-group">
                        <input
                            className="field-input"
                            type="email"
                            placeholder="Alamat Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={status === 'loading' || status === 'success'}
                            autoComplete="email"
                        />
                    </div>

                    {/* Username */}
                    <div className="field-group">
                        <input
                            className="field-input"
                            type="text"
                            placeholder="Nama Pengguna (Username)"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            disabled={status === 'loading' || status === 'success'}
                            autoComplete="username"
                        />
                    </div>

                    {/* Password baru */}
                    <div className="field-group">
                        <input
                            className="field-input"
                            type="password"
                            placeholder="Password Baru"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            disabled={status === 'loading' || status === 'success'}
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Konfirmasi password */}
                    <div className="field-group">
                        <input
                            className="field-input"
                            type="password"
                            placeholder="Konfirmasi Password Baru"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            disabled={status === 'loading' || status === 'success'}
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Pesan error */}
                    {status === 'error' && (
                        <div className="fp-alert fp-alert--error">
                            ⚠️ {message}
                        </div>
                    )}

                    {/* Pesan sukses */}
                    {status === 'success' && (
                        <div className="fp-alert fp-alert--success">
                            ✓ {message}
                        </div>
                    )}

                    {/* Tombol submit */}
                    {status !== 'success' && (
                        <button
                            className="btn-masuk"
                            type="submit"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading'
                                ? <span className="spinner" />
                                : 'Ubah Password'
                            }
                        </button>
                    )}
                </form>

                {/* Link kembali ke login */}
                <div className="links" style={{ marginTop: '0.75rem' }}>
                    <a href="/login" className="link-secondary">
                        ← Kembali ke Login
                    </a>
                </div>
            </div>
        </div>
    )
}