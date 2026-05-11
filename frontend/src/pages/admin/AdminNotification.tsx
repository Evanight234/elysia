import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import {
    Send, Bell, Loader2, X,
    CheckCircle, Clock, User
} from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'

// ─── Tipe Data ───────────────────────────────────────────
interface UserData {
    id: string
    name: string
    username: string
    email: string
    role: 'USER' | 'ADMIN'
}

interface SentNotif {
    id: string
    userId: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
    user?: { name: string; username: string; email: string }
}

// ─── Tab Type ────────────────────────────────────────────
type Tab = 'send' | 'history'

export default function AdminNotification() {
    const [activeTab, setActiveTab] = useState<Tab>('send')
    const [users, setUsers] = useState<UserData[]>([])
    const [sentNotifs, setSentNotifs] = useState<SentNotif[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [loadingHist, setLoadingHist] = useState(false)
    const [sending, setSending] = useState<string | null>(null) // userId yang sedang dikirimi

    // State form kirim pesan
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [sendSuccess, setSendSuccess] = useState('')
    const [sendError, setSendError] = useState('')

    // ── Load users saat mount ──────────────────────────────
    useEffect(() => {
        fetchUsers()
    }, [])

    // ── Load history saat pindah tab ──────────────────────
    useEffect(() => {
        if (activeTab === 'history') fetchHistory()
    }, [activeTab])

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true)
            // GET /admin/users → semua user
            const res = await api.get('/admin/users')
            // Filter hanya USER, bukan ADMIN
            const userOnly = (res.data.data || []).filter(
                (u: UserData) => u.role === 'USER'
            )
            setUsers(userOnly)
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoadingUsers(false)
        }
    }

    const fetchHistory = async () => {
        try {
            setLoadingHist(true)
            // GET /admin/notifications → semua notif yang pernah dikirim admin
            const res = await api.get('/admin/notifications')
            setSentNotifs(res.data.data || [])
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoadingHist(false)
        }
    }

    // ── Buka modal kirim pesan ─────────────────────────────
    const handleOpenSend = (user: UserData) => {
        setSelectedUser(user)
        setTitle('')
        setMessage('')
        setSendError('')
        setSendSuccess('')
        setShowModal(true)
    }

    // ── Kirim notifikasi ke user ───────────────────────────
    const handleSend = async () => {
        if (!selectedUser || !title.trim() || !message.trim()) {
            setSendError('Judul dan pesan tidak boleh kosong.')
            return
        }

        try {
            setSending(selectedUser.id)
            setSendError('')

            // POST /notifications → kirim notif ke user tertentu
            await api.post('/notifications', {
                userId: selectedUser.id,
                title: title.trim(),
                message: message.trim(),
            })

            setSendSuccess(`Pesan berhasil dikirim ke ${selectedUser.name}!`)
            setTitle('')
            setMessage('')

            // Tutup modal setelah 2 detik
            setTimeout(() => {
                setShowModal(false)
                setSendSuccess('')
                setSelectedUser(null)
            }, 2000)

        } catch (err: any) {
            setSendError(
                err.response?.data?.message || 'Gagal mengirim pesan. Coba lagi.'
            )
        } finally {
            setSending(null)
        }
    }

    // ── Format waktu ───────────────────────────────────────
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `${minutes} menit lalu`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours} jam lalu`
        return `${Math.floor(hours / 24)} hari lalu`
    }

    // ─── RENDER ──────────────────────────────────────────
    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>Send Notification</h1>
                <p>Kirim pesan ke user tertentu. Pesan akan masuk ke notifikasi user.</p>
            </div>

            {/* ── Tab: Kirim Pesan | History ── */}
            <div className="notif-admin-tabs">
                <button
                    className={`notif-admin-tab ${activeTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveTab('send')}
                >
                    <Send size={15} /> Kirim Pesan
                </button>
                <button
                    className={`notif-admin-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <Clock size={15} /> Pesan Terkirim
                </button>
            </div>

            {/* ══════════════════════════════════════
          TAB: KIRIM PESAN
      ══════════════════════════════════════ */}
            {activeTab === 'send' && (
                <div className="admin-table-wrapper">
                    <div className="admin-table-header">
                        <h2>Daftar User</h2>
                        <span style={{ fontSize: '0.82rem', color: '#d1a0b8' }}>
                            {users.length} user terdaftar
                        </span>
                    </div>

                    {loadingUsers ? (
                        <div className="admin-loading">
                            <Loader2 size={28} className="spin" />
                            <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>Memuat user...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="admin-empty">Belum ada user terdaftar.</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">
                                                    {user.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="admin-user-name">{user.name}</div>
                                                    <div className="admin-user-email">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: '#d1a0b8', fontSize: '0.85rem' }}>
                                            {user.email}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-send-notif"
                                                onClick={() => handleOpenSend(user)}
                                            >
                                                <Send size={14} /> Kirim Pesan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════
          TAB: HISTORY / PESAN TERKIRIM
      ══════════════════════════════════════ */}
            {activeTab === 'history' && (
                <div className="admin-table-wrapper">
                    <div className="admin-table-header">
                        <h2>Pesan Terkirim</h2>
                        <span style={{ fontSize: '0.82rem', color: '#d1a0b8' }}>
                            {sentNotifs.length} pesan
                        </span>
                    </div>

                    {loadingHist ? (
                        <div className="admin-loading">
                            <Loader2 size={28} className="spin" />
                            <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>Memuat history...</p>
                        </div>
                    ) : sentNotifs.length === 0 ? (
                        <div className="admin-empty">
                            <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p>Belum ada pesan yang dikirim.</p>
                        </div>
                    ) : (
                        <div className="notif-history-list">
                            {sentNotifs.map(notif => (
                                <div key={notif.id} className="notif-history-item">
                                    {/* Icon status dibaca/belum */}
                                    <div className={`notif-history-icon ${notif.isRead ? 'read' : 'unread'}`}>
                                        {notif.isRead
                                            ? <CheckCircle size={18} />
                                            : <Bell size={18} />
                                        }
                                    </div>

                                    {/* Isi pesan */}
                                    <div className="notif-history-body">
                                        <div className="notif-history-title">{notif.title}</div>
                                        <div className="notif-history-message">{notif.message}</div>

                                        {/* Info penerima */}
                                        <div className="notif-history-meta">
                                            <User size={12} />
                                            <span>
                                                {notif.user
                                                    ? `${notif.user.name} (@${notif.user.username})`
                                                    : `User ID: ${notif.userId.slice(0, 8)}...`
                                                }
                                            </span>
                                            <span className="notif-meta-dot">·</span>
                                            <span>{timeAgo(notif.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <span className={`notif-status-badge ${notif.isRead ? 'read' : 'unread'}`}>
                                        {notif.isRead ? '✓ Dibaca' : 'Belum Dibaca'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════
          MODAL: FORM KIRIM PESAN
      ══════════════════════════════════════ */}
            {showModal && selectedUser && (
                <div className="confirm-overlay">
                    <div className="notif-send-modal">

                        {/* Header modal */}
                        <div className="notif-modal-header">
                            <div>
                                <h3>Kirim Pesan</h3>
                                <p>
                                    Kepada: <strong>{selectedUser.name}</strong>
                                    <span style={{ color: '#d1a0b8' }}> (@{selectedUser.username})</span>
                                </p>
                            </div>
                            <button
                                className="notif-modal-close"
                                onClick={() => { setShowModal(false); setSendSuccess(''); setSendError('') }}
                                disabled={!!sending}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="notif-modal-body">
                            {/* Judul pesan */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">Judul Pesan</label>
                                <input
                                    className="notif-form-input"
                                    type="text"
                                    placeholder="contoh: Buku Baru Tersedia!"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    maxLength={100}
                                    disabled={!!sending || !!sendSuccess}
                                />
                                <span className="notif-char-count">{title.length}/100</span>
                            </div>

                            {/* Isi pesan */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">Isi Pesan</label>
                                <textarea
                                    className="notif-form-textarea"
                                    placeholder="Tulis isi pesan untuk user ini..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    disabled={!!sending || !!sendSuccess}
                                />
                                <span className="notif-char-count">{message.length}/500</span>
                            </div>

                            {/* Error */}
                            {sendError && (
                                <div className="notif-send-error">{sendError}</div>
                            )}

                            {/* Sukses */}
                            {sendSuccess && (
                                <div className="notif-send-success">
                                    <CheckCircle size={16} /> {sendSuccess}
                                </div>
                            )}
                        </div>

                        {/* Footer tombol */}
                        {!sendSuccess && (
                            <div className="notif-modal-footer">
                                <button
                                    className="btn-cancel"
                                    onClick={() => { setShowModal(false); setSendError('') }}
                                    disabled={!!sending}
                                >
                                    Batal
                                </button>
                                <button
                                    className="btn-send-confirm"
                                    onClick={handleSend}
                                    disabled={!!sending || !title.trim() || !message.trim()}
                                >
                                    {sending
                                        ? <><Loader2 size={15} className="spin" /> Mengirim...</>
                                        : <><Send size={15} /> Kirim Pesan</>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}