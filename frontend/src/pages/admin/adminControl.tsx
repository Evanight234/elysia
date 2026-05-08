import { useState, useEffect } from 'react'
import AdminLayout from './adminLayout'
import { Trash2, Users, Loader2, Search } from 'lucide-react'
import api from '../../api/axios'
import './adminPage.css'

interface userData {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export default function AdminUserControl() {
  const [users, setUsers] = useState<userData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<userData | null>(null)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users')
      setUsers(res.data.data || []);
    } catch (error) {
      console.error('failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLocaleLowerCase()) ||
    u.email.toLowerCase().includes(search.toLocaleLowerCase()));

  // hitung jumlah per role
  const usercount = users.filter(u => u.role === 'USER').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  // hendle delete
  const handledelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await api.delete(`/admin/users/${deleteTarget.id}`)
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      console.error('failed to delete user', error)
    } finally {
      setDeleting(false)
    }
  }
  return (
    <AdminLayout>
      <div className='admin-page-header'>
        <h1>User Control</h1>
        <p>Kelola semua akun yang terdaftar di ElysiaApp.</p>
      </div>

      {/* ringkasan role */}
      <div className='admin-stats-grid'>
        <div className='admin-stats-card'>
          <div className='admin-stats-icon'>
            <Users size={24} />
          </div>
          <div className='admin-stats-value'>{usercount}</div>
          <div className='admin-stats-label'>total akun user</div>
        </div>
        <div className='admin-stats-card'>
          <div className='admin-stats-icon' style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={20} />
          </div>
          <div className='admin-stats-value'>{adminCount}</div>
          <div className='admin-stats-label'>total akun admin</div>
        </div>
        <div className='admin-stats-card'>
          <div className="admin-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <Users size={20} />
          </div>
          <div className='admin-stats-value'>{users.length}</div>
          <div className='admin-stats-label'>total akun</div>
        </div>
      </div>

      <div className="admin-search-box" style={{ marginBottom: '1.25rem' }}>
        <Search size={20} color="#f472b6" />
        <input type="text"
          placeholder=' cari user'
          value={search}
          onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button style={{ background: 'none', border: 'none', color: '#f472b6', cursor: 'pointer' }} onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>
      {/* ── Tabel User ── */}
      <div className='admin-table-wrapper'>
        <div className='admin-table-header'>
          <h2>Semua user</h2>
          <span style={{ fontSize: '0.82rem', color: '#d1a0b8' }}>
            {filtered.length} akun ditemukan
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">
            <Loader2 size={28} className="spin" />
            <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>Memuat user...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            {search ? `Tidak ada user dengan kata kunci "${search}"` : 'Belum ada user.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className='admin-user-cell'>
                      <div admin-user-avatar>
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className='admin-user-name'>{user.name}</div>
                        <div className='admin-user-email'>{user.email}</div>
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
                    {/* admin tidak bisa menghapus akun sesama admin*/}
                    {user.role === 'USER' ? (
                      <button className='btn-delete' onClick={() => setDeleteTarget(user)}>
                        <Trash2 size={14} />
                        Hapus
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#d1a0b8' }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* konfirmasi Hapus */}
      {deleteTarget && (
        <div className='confirm-overlay'>
          <div className='confirm-box'>
            <h3>Hapus Akun</h3>
            <p>Akun <strong> {deleteTarget.name} </strong> ({deleteTarget.email}) akan dihapus permanen dari database. Tindakan ini tidak bisa dibatalkan</p>
            <div className='confirm-btns'>
              <button className='btn-cancel' onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Batal
              </button>
              <button className='btn-confirm-delete' onClick={handledelete} disabled={deleting}>
                {deleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}