import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { Trash2, Users, Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'
import { useTranslation } from 'react-i18next'
import { useToastContext } from '../../context/ToastContext'
import { useSidebarState } from '../../hooks/useSidebarState'

interface UserData {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export default function AdminUserControl() {
  const { paginationLimit } = useSidebarState()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)

  // Reset page when paginationLimit changes
  useEffect(() => {
    setPage(1)
  }, [paginationLimit])
    const { t } = useTranslation()
    const { toast } = useToastContext()
    useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data.data || [])
    } catch (err) {
      console.error('failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )
  const userCount = users.filter(u => u.role === 'USER').length
  const adminCount = users.filter(u => u.role === 'ADMIN').length

  const totalPages = Math.max(1, Math.ceil(filtered.length / paginationLimit))
  const paginatedUsers = filtered.slice((page - 1) * paginationLimit, page * paginationLimit)

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return
    setPage(pageNumber)
  }

  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
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

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await api.delete(`/admin/users/${deleteTarget.id}`)
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success(t('admin.deleteConfirm'))
    } catch (err: any) {
      const msg = err.response?.data?.message || t('admin.delete-loading')
      toast.error(msg)
      console.error('failed to delete user', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>{t('admin.userControl')}</h1>
        <p>{t('admin.userSub')}</p>
      </div>

      {/* ── Stat Cards ── pakai class yang sama dengan AdminHome */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={20} />
          </div>
          <div className="admin-stat-value">{loading ? '...' : userCount}</div>
          <div className="admin-stat-label">{t('admin.accountUser')}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={20} />
          </div>
          <div className="admin-stat-value">{loading ? '...' : adminCount}</div>
          <div className="admin-stat-label">{t('admin.accountAdmin')}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <Users size={20} />
          </div>
          <div className="admin-stat-value">{loading ? '...' : users.length}</div>
          <div className="admin-stat-label">{t('admin.totalAccounts')}</div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="admin-search-box">
        <Search size={20} color="#f472b6" />
        <input
          type="text"
          placeholder={t('admin.searchUser')}
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
        />
        {search && (
          <button
            style={{ background: 'none', border: 'none', color: '#f472b6', cursor: 'pointer' }}
            onClick={() => handleSearchChange('')}
          >✕</button>
        )}
      </div>

      {/* ── Tabel User ── pakai class admin-table seperti AdminHome */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>{t('admin.allUsers')}</h2>
          <span style={{ fontSize: '0.82rem', color: '#d1a0b8' }}>
            {filtered.length} {t('admin.found')}
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">
            <Loader2 size={28} className="spin" />
            <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>{t('common.loading')}...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            {search ? `${t('admin.empty-user')} "${search}"` : t('common.noUsers')}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('settings.user')}</th>
                <th>{t('settings.role')}</th>
                <th>{t('settings.joined')}</th>
                <th>{t('settings.action')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
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
                  <td>
                    {user.role === 'USER' ? (
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 size={14} /> {t('admin.delete')}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#d1a0b8' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            {t("admin.showingAccounts", {
              from: (page - 1) * paginationLimit + 1,
              to: Math.min(page * paginationLimit, filtered.length),
              total: filtered.length,
            })}
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={() => goToPage(1)} disabled={page === 1} title={t("common.firstPage")}>
              <ChevronsLeft size={18} />
            </button>
            <button className="pagination-btn" onClick={() => goToPage(page - 1)} disabled={page === 1} title={t("common.prevPage")}>
              <ChevronLeft size={18} />
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="pagination-dots">…</span>
              ) : (
                <button key={p} className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`} onClick={() => goToPage(p as number)}>
                  {p}
                </button>
              )
            )}
            <button className="pagination-btn" onClick={() => goToPage(page + 1)} disabled={page === totalPages || totalPages === 0} title={t("common.nextPage")}>
              <ChevronRight size={18} />
            </button>
            <button className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={page === totalPages || totalPages === 0} title={t("common.lastPage")}>
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteTarget && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>{t('admin.deleteTitle')}</h3>
            <p>
              {t('settings.account')} <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) {t('admin.deleteDesc')}
              <br /> {t('admin.warning-delete')}
            </p>
            <div className="confirm-btns">
              <button
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                {t('admin.deleteCancel')}
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t('admin.delete-loading') : t('admin.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}