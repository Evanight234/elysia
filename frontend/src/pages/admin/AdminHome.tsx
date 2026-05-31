import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { Users, BookOpen, Bell, Star, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'
import { useTranslation } from 'react-i18next'
import { useSidebarState } from '../../hooks/useSidebarState'

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

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 480)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])
    return isMobile
}

export default function AdminHome() {
    const { paginationLimit } = useSidebarState()
    const [stats, setStats] = useState<StatData>({ totalUsers: 0, totalBooks: 0, totalNotifs: 0, totalRecs: 0 })
    const [allUsers, setAllUsers] = useState<UserStat[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const { t } = useTranslation()
    const isMobile = useIsMobile()

    const totalPages = Math.max(1, Math.ceil(allUsers.length / paginationLimit))
    const paginatedUsers = allUsers.slice((page - 1) * paginationLimit, page * paginationLimit)

    // Reset page on pagination limit change
    useEffect(() => {
        setPage(1)
    }, [paginationLimit])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersRes = await api.get('/admin/users')
                const userList: UserStat[] = usersRes.data.data || []
                setAllUsers(userList)

                const booksRes = await api.get('/books')
                const bookCount = (booksRes.data.data || []).length

                const recRes = await api.get('/recommendations')
                const recCount = (recRes.data.data || []).length

                setStats({
                    totalUsers: userList.length,
                    totalBooks: bookCount,
                    totalNotifs: 0,
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

    const goToPage = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return
        setPage(pageNumber)
    }

    const getPageNumbers = () => {
        const pages: (number | '...')[] = []

        if (isMobile) {
            pages.push(1)
            if (page > 2) pages.push('...')
            if (page > 1 && page < totalPages) pages.push(page)
            if (page < totalPages - 1) pages.push('...')
            if (totalPages > 1) pages.push(totalPages)
            return pages
        }

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (page > 3) pages.push('...')
            const start = Math.max(2, page - 1)
            const end = Math.min(totalPages - 1, page + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            if (page < totalPages - 2) pages.push('...')
            pages.push(totalPages)
        }

        return pages
    }

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

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>{t('admin.userList')}</h2>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <Loader2 size={28} className="spin" />
                        <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>{t('common.loading')}</p>
                    </div>
                ) : allUsers.length === 0 ? (
                    <div className="admin-empty">{t('settings.noUsers')}</div>
                ) : isMobile ? (
                    <div className="mobile-user-cards">
                        {paginatedUsers.map(user => (
                            <div key={user.id} className="mobile-user-card">
                                <div className="mobile-user-card-top">
                                    <div className="admin-user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="admin-user-name">{user.name}</div>
                                        <div className="admin-user-email">{user.email}</div>
                                    </div>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="mobile-user-card-bottom">
                                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
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
                            {paginatedUsers.map(user => (
                                <tr key={user.id}>
                                    <td data-label={t('settings.user')}>
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
                                    <td data-label={t('settings.role')}>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td data-label={t('settings.joined')}>
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

            {allUsers.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        {t("admin.showingAccounts", {
                            from: (page - 1) * paginationLimit + 1,
                            to: Math.min(page * paginationLimit, allUsers.length),
                            total: allUsers.length,
                        })}
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => goToPage(1)}
                            disabled={page === 1}
                            title={t("common.firstPage")}
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 1}
                            title={t("common.prevPage")}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {getPageNumbers().map((p, i) =>
                            p === '...' ? (
                                <span key={`dots-${i}`} className="pagination-dots">…</span>
                            ) : (
                                <button
                                    key={p}
                                    className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`}
                                    onClick={() => goToPage(p as number)}
                                >
                                    {p}
                                </button>
                            )
                        )}

                        <button
                            className="pagination-btn"
                            onClick={() => goToPage(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                            title={t("common.nextPage")}
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => goToPage(totalPages)}
                            disabled={page === totalPages || totalPages === 0}
                            title={t("common.lastPage")}
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}