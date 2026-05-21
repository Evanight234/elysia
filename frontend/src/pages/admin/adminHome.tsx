import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { Users, BookOpen, Bell, Star, Loader2, User } from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'
import { useTranslation } from 'react-i18next'
import { useToastContext } from '../../context/ToastContext'

interface UserStat {
    id: string
    name: string
    email: string
    role: 'USER' | 'ADMIN'
    createdAt: string
}

interface StatData {
    totalUsers: number
    totalBooks: number
    totalNotifs: number
    totalRecs: number
}

export default function AdminHome() {
    const [stats, setStats] = useState<StatData>({ totalUsers: 0, totalBooks: 0, totalNotifs: 0, totalRecs: 0 })
    const [users, setUsers] = useState<UserStat[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()
    const { toast } = useToastContext()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ambil semua user dari backend
                // GET /admin/users
                const usersRes = await api.get('/admin/users')
                const userList: UserStat[] = usersRes.data.data || []
                setUsers(userList)

                // Ambil jumlah buku
                const booksRes = await api.get('/books')
                const bookCount = (booksRes.data.data || []).length

                // Ambil rekomendasi
                const recRes = await api.get('/recommendations')
                const recCount = (recRes.data.data || []).length

                setStats({
                    totalUsers: userList.length,
                    totalBooks: bookCount,
                    totalNotifs: 0,   // TODO: GET /admin/notifications/count
                    totalRecs: recCount,
                })
            } catch (err) {
                console.error('Failed to fetch admin home data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const statCards = [
        { label: t('admin.totalUser'), value: stats.totalUsers, icon: Users, color: '#fce7f3' },
        { label: t('admin.totalBook'), value: stats.totalBooks, icon: BookOpen, color: '#ede9fe' },
        { label: t('admin.activeRec'), value: stats.totalRecs, icon: Star, color: '#fef3c7' },
        { label: t('admin.totalNotif'), value: stats.totalNotifs, icon: Bell, color: '#d1fae5' },
    ]

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>{t('admin.dashboard')}</h1>
                <p>{t('admin.dashSub')}</p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="admin-stats-grid">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: color }}>
                            <Icon size={20} />
                        </div>
                        <div className="admin-stat-value">
                            {loading ? '...' : value.toLocaleString('id-ID')}
                        </div>
                        <div className="admin-stat-label">{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabel Semua User ── */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>{t('admin.userList')}</h2>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <Loader2 size={28} className="spin" />
                        <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>{t('common.loading')}</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="admin-empty">{t('settings.noUsers')}</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('settings.user')}</th>
                                <th>{t('settings.role')}</th>
                                <th>{t('settings.joined')}</th>
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
                                                <div className="admin-user-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    )
}