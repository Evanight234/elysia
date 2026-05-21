import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import {
    Send, Bell, Loader2, X,
    CheckCircle, Clock, User,
    RefreshCw, Search
} from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'
import { useTranslation } from 'react-i18next'
import { useToastContext } from '../../context/ToastContext'

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

type Tab = 'send' | 'history'

export default function AdminNotification() {
    const { t } = useTranslation()
    const { toast } = useToastContext()
    const [activeTab, setActiveTab] = useState<Tab>('send')
    const [users, setUsers] = useState<UserData[]>([])
    const [sentNotifs, setSentNotifs] = useState<SentNotif[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [loadingHist, setLoadingHist] = useState(false)
    const [sending, setSending] = useState<string | null>(null)

    // ── Form kirim pesan ──────────────────────────────────
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [sendSuccess, setSendSuccess] = useState('')
    const [sendError, setSendError] = useState('')

    // ── History: filter & search ──────────────────────────
    const [histSearch, setHistSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all')
    const [refreshing, setRefreshing] = useState(false)

    // ── Load data ─────────────────────────────────────────
    useEffect(() => { fetchUsers() }, [])
    useEffect(() => {
        if (activeTab === 'history') fetchHistory()
    }, [activeTab])

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true)
            const res = await api.get('/admin/users')
            setUsers((res.data.data || []).filter((u: UserData) => u.role === 'USER'))
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoadingUsers(false)
        }
    }

    const fetchHistory = async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setLoadingHist(true)
            // GET /admin/notifications → semua notif yang pernah dikirim
            const res = await api.get('/admin/notifications')
            setSentNotifs(res.data.data || [])
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoadingHist(false)
            setRefreshing(false)
        }
    }

    // ── Refresh manual history ────────────────────────────
    const handleRefresh = () => fetchHistory(true)

    // ── Filter & search history ───────────────────────────
    const filteredHistory = sentNotifs.filter(notif => {
        // Filter status
        const matchStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'read' ? notif.isRead :
                    filterStatus === 'unread' ? !notif.isRead : true

        // Search by judul, pesan, atau nama user
        const q = histSearch.toLowerCase()
        const matchSearch = !q || [
            notif.title,
            notif.message,
            notif.user?.name || '',
            notif.user?.username || '',
            notif.user?.email || '',
        ].some(s => s.toLowerCase().includes(q))

        return matchStatus && matchSearch
    })

    // ── Statistik ringkas ─────────────────────────────────
    const totalSent = sentNotifs.length
    const totalRead = sentNotifs.filter(n => n.isRead).length
    const totalUnread = sentNotifs.filter(n => !n.isRead).length

    // ── Kirim notifikasi ──────────────────────────────────
    const handleOpenSend = (user: UserData) => {
        setSelectedUser(user)
        setTitle('')
        setMessage('')
        setSendError('')
        setSendSuccess('')
        setShowModal(true)
    }

    const handleSend = async () => {
        if (!selectedUser || !title.trim() || !message.trim()) {
            setSendError(t('admin.masege-empty'))
            toast.error(t('admin.masege-empty'))
            return
        }
        try {
            setSending(selectedUser.id)
            setSendError('')
            await api.post('/notifications', {
                userId: selectedUser.id,
                title: title.trim(),
                message: message.trim(),
            })
            setSendSuccess(`${t('admin.sendsucces')} ${selectedUser.name}!`)
            toast.success(`${t('admin.sendsucces')} ${selectedUser.name}`)
            setTitle('')
            setMessage('')
            setTimeout(() => {
                setShowModal(false)
                setSendSuccess('')
                setSelectedUser(null)
                if (activeTab === 'history') fetchHistory()
            }, 2000)
        } catch (err: any) {
            const msg = err.response?.data?.message || t('admin.sendfail')
            setSendError(msg)
            toast.error(msg)
        } finally {
            setSending(null)
        }
    }

    // ── Format waktu ──────────────────────────────────────
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 1) return t('timeAgo.justNow')
        if (minutes < 60) return t('timeAgo.minutesAgo', { count: minutes })
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return t('timeAgo.hoursAgo', { count: hours })
        const days = Math.floor(hours / 24)
        if (days < 7) return t('timeAgo.daysAgo', { count: days })
        return new Date(dateStr).toLocaleDateString(t('lang'), {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    // ─── RENDER ───────────────────────────────────────────
    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>{t('admin.notifTitle')}</h1>
                <p>{t('admin.sendDesc')}</p>
            </div>

            {/* ── Tab ── */}
            <div className="notif-admin-tabs">
                <button
                    className={`notif-admin-tab ${activeTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveTab('send')}
                >
                    <Send size={15} /> {t('admin.notifSend')}
                </button>
                <button
                    className={`notif-admin-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <Clock size={15} /> {t('admin.history')}
                    {totalUnread > 0 && (
                        <span className="hist-unread-badge">{totalUnread} {t('admin.notifTotalUnread')}</span>
                    )}
                </button>
            </div>

            {/* ══════════════════════════════════════
          TAB KIRIM PESAN
      ══════════════════════════════════════ */}
            {activeTab === 'send' && (
                <div className="admin-table-wrapper">
                    <div className="admin-table-header">
                        <h2>{t('admin.notifUserList')}</h2>
                        <span style={{ fontSize: '0.82rem', color: '#d1a0b8' }}>
                            {users.length} {t('admin.notifUsers')}
                        </span>
                    </div>

                    {loadingUsers ? (
                        <div className="admin-loading">
                            <Loader2 size={28} className="spin" />
                            <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>{t('admin.notifLoadingUsers')}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="admin-empty">{t('admin.masege-empty2')}</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.notifUser')}</th>
                                    <th>{t('admin.notifEmail')}</th>
                                    <th>{t('admin.notifAksi')}</th>
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
                                                <Send size={14} /> {t('admin.notifSend')}
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
          TAB HISTORY
      ══════════════════════════════════════ */}
            {activeTab === 'history' && (
                <>
                    {/* ── Stat cards ringkas ── */}
                    <div className="hist-stats-row">
                        <div className="hist-stat-card">
                            <span className="hist-stat-value">{totalSent}</span>
                            <span className="hist-stat-label">{t('admin.notifTotalSent')}</span>
                        </div>
                        <div className="hist-stat-card hist-stat-read">
                            <span className="hist-stat-value">{totalRead}</span>
                            <span className="hist-stat-label">{t('admin.notifTotalRead')}</span>
                        </div>
                        <div className="hist-stat-card hist-stat-unread">
                            <span className="hist-stat-value">{totalUnread}</span>
                            <span className="hist-stat-label">{t('admin.notifTotalUnread')}</span>
                        </div>
                    </div>

                    {/* ── Filter & search bar ── */}
                    <div className="hist-filter-bar">
                        {/* Search */}
                        <div className="hist-search-box">
                            <Search size={16} color="#f472b6" />
                            <input
                                type="text"
                                placeholder={t('admin.notifSearch')}
                                value={histSearch}
                                onChange={e => setHistSearch(e.target.value)}
                            />
                            {histSearch && (
                                <button
                                    style={{ background: 'none', border: 'none', color: '#f472b6', cursor: 'pointer' }}
                                    onClick={() => setHistSearch('')}
                                >✕</button>
                            )}
                        </div>

                        {/* Filter status */}
                        <div className="hist-filter-btns">
                            {(['all', 'unread', 'read'] as const).map(status => (
                                <button
                                    key={status}
                                    className={`hist-filter-btn ${filterStatus === status ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status === 'all' ? t('admin.notifAll') : ''}
                                    {status === 'unread' ? t('admin.notifTotalUnread') : ''}
                                    {status === 'read' ? t('admin.notifTotalRead') : ''}
                                </button>
                            ))}
                        </div>

                        {/* Tombol refresh */}
                        <button
                            className="hist-refresh-btn"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title={t('admin.notifRefresh')}
                        >
                            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                            {refreshing ? t('common.loading') : t('admin.notifRefresh')}
                        </button>
                    </div>

                    {/* ── List history ── */}
                    <div className="admin-table-wrapper">
                        <div className="admin-table-header">
                            <h2>{t('admin.notifHistory')}</h2>
                            <span style={{ fontSize: '0.82rem', color: '#d1a0b8' }}>
                                {filteredHistory.length} {t('admin.notifOf')} {totalSent} {t('admin.notifHistory')}
                            </span>
                        </div>

                        {loadingHist ? (
                            <div className="admin-loading">
                                <Loader2 size={28} className="spin" />
                                <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>{t('admin.notifLoading')}</p>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="admin-empty">
                                <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                <p>
                                    {histSearch || filterStatus !== 'all'
                                        ? t('admin.notifNoMatch')
                                        : t('admin.masege-empty2')}
                                </p>
                            </div>
                        ) : (
                            <div className="notif-history-list">
                                {filteredHistory.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`notif-history-item ${!notif.isRead ? 'notif-history-unread' : ''}`}
                                    >
                                        {/* Icon status */}
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

                                            {/* Penerima & waktu */}
                                            <div className="notif-history-meta">
                                                <User size={11} />
                                                <span>
                                                    {notif.user
                                                        ? `${notif.user.name} (@${notif.user.username})`
                                                        : `${t('admin.notifUserID')} ${notif.userId.slice(0, 8)}...`
                                                    }
                                                </span>
                                                <span className="notif-meta-dot">·</span>
                                                <Clock size={11} />
                                                <span>{timeAgo(notif.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Badge status baca */}
                                        <span className={`notif-status-badge ${notif.isRead ? 'read' : 'unread'}`}>
                                            {notif.isRead ? t('admin.notifReadBadge') : t('admin.notifUnreadBadge')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════
          MODAL KIRIM PESAN
      ══════════════════════════════════════ */}
            {showModal && selectedUser && (
                <div className="confirm-overlay">
                    <div className="notif-send-modal">
                        <div className="notif-modal-header">
                            <div>
                                <h3>{t('admin.notifModalTitle')}</h3>
                                <p>
                                    {t('admin.to')}: <strong>{selectedUser.name}</strong>
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

                        <div className="notif-modal-body">
                            <div className="notif-form-group">
                                <label className="notif-form-label">{t('admin.title')}</label>
                                <input
                                    className="notif-form-input"
                                    type="text"
                                    placeholder={t('admin.notifTitlePlace')}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    maxLength={100}
                                    disabled={!!sending || !!sendSuccess}
                                />
                                <span className="notif-char-count">{title.length}{t('admin.notifCharLimit')}</span>
                            </div>

                            <div className="notif-form-group">
                                <label className="notif-form-label">{t('admin.notifMessage')}</label>
                                <textarea
                                    className="notif-form-textarea"
                                    placeholder={t('admin.notifMsgPlace')}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    disabled={!!sending || !!sendSuccess}
                                />
                                <span className="notif-char-count">{message.length}{t('admin.notifCharLimitMsg')}</span>
                            </div>

                            {sendError && (
                                <div className="notif-send-error">{sendError}</div>
                            )}
                            {sendSuccess && (
                                <div className="notif-send-success">
                                    <CheckCircle size={16} /> {sendSuccess}
                                </div>
                            )}
                        </div>

                        {!sendSuccess && (
                            <div className="notif-modal-footer">
                                <button
                                    className="btn-cancel"
                                    onClick={() => { setShowModal(false); setSendError('') }}
                                    disabled={!!sending}
                                >
                                    {t('admin.cancel')}
                                </button>
                                <button
                                    className="btn-send-confirm"
                                    onClick={handleSend}
                                    disabled={!!sending || !title.trim() || !message.trim()}
                                >
                                    {sending
                                        ? <><Loader2 size={15} className="spin" /> {t('admin.notifSending')}</>
                                        : <><Send size={15} /> {t('admin.send')}</>
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