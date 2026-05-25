import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './ForgetPassword.css'
import { useTranslation } from 'react-i18next'
import { Mail, UserCheck, Lock, Eye, EyeOff, Sparkles, Heart, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ELYSIA_RESET_QUOTES = [
    {
        id: 1,
        text: "Jangan khawatir! Aku akan membantu kamu mengatur ulang kata sandimu dengan aman~ 🔐💖",
        lang: "id"
    },
    {
        id: 2,
        text: "Pastikan kamu mengingat kata sandi barumu ya! Aku tidak ingin kamu lupa lagi~ 🌸",
        lang: "id"
    },
    {
        id: 3,
        text: "别担心！我会帮你重置密码的~ 请确保新密码足够安全哦！🔑✨",
        lang: "zh"
    },
    {
        id: 4,
        text: "Don't worry! Everyone forgets sometimes. Let's get you a fresh new password~ 💕",
        lang: "en"
    }
]

export default function ForgetPassword() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [message, setMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [quoteIndex, setQuoteIndex] = useState(0)
    const [wiggle, setWiggle] = useState(false)
    const { t, i18n } = useTranslation()

    const handleQuoteCycle = () => {
        setWiggle(true)
        setQuoteIndex((prev) => (prev + 1) % ELYSIA_RESET_QUOTES.length)
        setTimeout(() => setWiggle(false), 600)
    }

    useEffect(() => {
        const currentLang = i18n.language || 'id'
        const index = ELYSIA_RESET_QUOTES.findIndex(q => q.lang === currentLang)
        if (index !== -1) {
            setQuoteIndex(index)
        }
    }, [i18n.language])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        if (!email || !username || !newPassword || !confirm) {
            setStatus('error')
            setMessage('Semua kolom harus diisi.')
            return
        }

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
            {/* Background effects */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="crystal-particles">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`crystal-shard shard-${i + 1}`} />
                ))}
            </div>

            <div className="fp-container">
                {/* Left Side: Visual Mascot Panel (Desktop) */}
                <div className="fp-visual-panel">
                    <div className="visual-background-overlay" />

                    <div className="visual-avatar-ring">
                        <img
                            src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779721351/WhatsApp_Image_2026-05-25_at_23.01.24_q65fkc.jpg"
                            alt="Elysia Portrait"
                            className="visual-avatar-img"
                        />
                    </div>

                    <div className="mascot-section">
                        {/* Interactive Speech Bubble */}
                        <div className="speech-bubble-container" onClick={handleQuoteCycle}>
                            <div className="speech-bubble-content">
                                <p className="quote-text">{ELYSIA_RESET_QUOTES[quoteIndex].text}</p>
                                <div className="speech-bubble-tip" />
                            </div>
                        </div>

                        {/* Chibi Mascot */}
                        <div
                            className={`chibi-mascot-wrapper ${wiggle ? 'wiggle' : ''}`}
                            onClick={handleQuoteCycle}
                            title="Click me for encouragement!🌸"
                        >
                            <img
                                src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720328/250_wolupe.png"
                                alt="Elysia Chibi"
                                className="chibi-image"
                            />
                            <div className="chibi-shadow" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="fp-card-container">
                    <div className="fp-header">
                        <div className="mobile-logo-header">
                            <div className="logo-ring-mini">
                                <img
                                    src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720330/part-four-traced-even-more-symbol-and-stigmata-from-honkai-v0-bwybasca0sc71_png_q0mbsq.png"
                                    alt="Elysia Logo"
                                    className="logo-img-mini"
                                />
                            </div>
                        </div>

                        <h1 className="app-title-premium">
                            Elysia App <span className="title-sparkle"><Sparkles size={16} /></span>
                        </h1>
                        <div className="subtitle-badge">
                            <ShieldCheck size={13} className="shield-icon" />
                            <span>Lupa Kata Sandi</span>
                        </div>
                    </div>

                    <p className="fp-desc-premium">
                        Masukkan email, username, dan password baru kamu.
                        Fitur ini hanya untuk akun <strong>User</strong>.
                    </p>

                    {/* Form */}
                    <form className="fp-form-premium" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="input-group-premium">
                            <div className="input-icon-wrapper">
                                <Mail size={18} className="input-icon" />
                            </div>
                            <input
                                className="input-field-premium"
                                type="email"
                                placeholder="Alamat Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={status === 'loading' || status === 'success'}
                                autoComplete="email"
                            />
                            <span className="input-highlight-line" />
                        </div>

                        {/* Username */}
                        <div className="input-group-premium">
                            <div className="input-icon-wrapper">
                                <UserCheck size={18} className="input-icon" />
                            </div>
                            <input
                                className="input-field-premium"
                                type="text"
                                placeholder="Nama Pengguna (Username)"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                disabled={status === 'loading' || status === 'success'}
                                autoComplete="username"
                            />
                            <span className="input-highlight-line" />
                        </div>

                        {/* New Password */}
                        <div className="input-group-premium">
                            <div className="input-icon-wrapper">
                                <Lock size={18} className="input-icon" />
                            </div>
                            <input
                                className="input-field-premium"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password Baru"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                disabled={status === 'loading' || status === 'success'}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <span className="input-highlight-line" />
                        </div>

                        {/* Confirm Password */}
                        <div className="input-group-premium">
                            <div className="input-icon-wrapper">
                                <Lock size={18} className="input-icon" />
                            </div>
                            <input
                                className="input-field-premium"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Konfirmasi Password Baru"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                                disabled={status === 'loading' || status === 'success'}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirm(!showConfirm)}
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <span className="input-highlight-line" />
                        </div>

                        {/* Error message */}
                        {status === 'error' && (
                            <div className="fp-alert-premium fp-alert--error">
                                <AlertTriangle size={16} />
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Success message */}
                        {status === 'success' && (
                            <div className="fp-alert-premium fp-alert--success">
                                <CheckCircle size={16} />
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        {status !== 'success' && (
                            <button
                                className="btn-reset-premium"
                                type="submit"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <div className="btn-loader-content">
                                        <div className="crystal-spinner" />
                                        <span>Memproses...</span>
                                    </div>
                                ) : (
                                    <div className="btn-text-content">
                                        <span>Ubah Password</span>
                                        <ArrowRight size={18} className="arrow-icon" />
                                    </div>
                                )}
                            </button>
                        )}

                        {/* Success: Go to login button */}
                        {status === 'success' && (
                            <a href="/login" className="btn-back-to-login">
                                <ArrowRight size={18} />
                                <span>Masuk dengan Password Baru</span>
                            </a>
                        )}
                    </form>

                    {/* Back to Login link */}
                    <div className="auth-links-premium">
                        <a href="/login" className="link-hover-effect">
                            <ArrowLeft size={14} />
                            <span>Kembali ke Login</span>
                        </a>
                    </div>

                    {/* Mobile Mascot Helper */}
                    <div className="mobile-mascot-helper" onClick={handleQuoteCycle}>
                        <div className="mobile-bubble">
                            <p>{ELYSIA_RESET_QUOTES[quoteIndex].text}</p>
                        </div>
                        <img
                            src="https://res.cloudinary.com/dwagqm8ha/image/upload/v1779720328/250_wolupe.png"
                            alt="Elysia Chibi Mobile"
                            className={`mobile-chibi-img ${wiggle ? 'wiggle' : ''}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}