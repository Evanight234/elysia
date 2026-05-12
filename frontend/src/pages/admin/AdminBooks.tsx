import { useState, useEffect, useRef } from 'react'
import AdminLayout from './AdminLayout'
import {
    Plus, Trash2, Loader2, X,
    BookOpen, Check, Image as ImageIcon
} from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'

// ─── Tipe Data ───────────────────────────────────────────
interface Book {
    id: string
    title: string
    author: string
    description: string | null
    cover: string | null
    category: string
    viewCount: number
    likeCount: number
    createdAt: string
}

interface BookForm {
    title: string
    author: string
    description: string
    category: string
}

export default function AdminBooks() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // ── State form tambah buku ─────────────────────────────
    const [form, setForm] = useState<BookForm>({
        title: '',
        author: '',
        description: '',
        category: '',
    })

    // ── State cover image ──────────────────────────────────
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string>('')
    const [coverError, setCoverError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Fetch semua buku ───────────────────────────────────
    useEffect(() => { fetchBooks() }, [])

    const fetchBooks = async () => {
        try {
            setLoading(true)
            const res = await api.get('/books')
            setBooks(res.data.data || [])
        } catch (err) {
            console.error('Failed to fetch books:', err)
        } finally {
            setLoading(false)
        }
    }

    // ── Pilih cover image ──────────────────────────────────
    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowed.includes(file.type)) {
            setCoverError('Format harus JPG, PNG, atau WEBP.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setCoverError('Ukuran maksimal 5MB.')
            return
        }

        setCoverError('')
        setCoverFile(file)

        const reader = new FileReader()
        reader.onloadend = () => setCoverPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    // ── Update field form ──────────────────────────────────
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // ── Reset form & modal ─────────────────────────────────
    const resetForm = () => {
        setForm({ title: '', author: '', description: '', category: '' })
        setCoverFile(null)
        setCoverPreview('')
        setCoverError('')
        setSubmitError('')
        setSubmitSuccess(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        resetForm()
    }

    // ── Submit tambah buku ─────────────────────────────────
    const handleSubmit = async () => {
        setSubmitError('')

        if (!form.title.trim()) return setSubmitError('Judul wajib diisi.')
        if (!form.author.trim()) return setSubmitError('Penulis wajib diisi.')
        if (!form.category.trim()) return setSubmitError('Kategori wajib diisi.')

        setSubmitting(true)
        try {
            // Cover: convert ke base64 jika ada
            let coverUrl: string | null = null
            if (coverFile) {
                coverUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(coverFile)
                })
            }

            // POST /books → tambah buku baru
            await api.post('/books', {
                title: form.title.trim(),
                author: form.author.trim(),
                description: form.description.trim() || null,
                cover: coverUrl,
                category: form.category.trim(),
                viewCount: 0,
                likeCount: 0,
            })

            setSubmitSuccess(true)
            // Reload list buku
            await fetchBooks()
            // Tutup modal setelah 1.5 detik
            setTimeout(() => handleCloseModal(), 1500)

        } catch (err: any) {
            setSubmitError(
                err.response?.data?.message || 'Gagal menambahkan buku. Coba lagi.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    // ── Hapus buku ─────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            // DELETE /books/:id
            await api.delete(`/books/${deleteTarget.id}`)
            setBooks(prev => prev.filter(b => b.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (err) {
            console.error('Failed to delete book:', err)
        } finally {
            setDeleting(false)
        }
    }

    // ─── RENDER ──────────────────────────────────────────
    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>Kelola Buku</h1>
                <p>Lihat, tambah, dan hapus buku dari database ElysiaApp.</p>
            </div>

            {/* ── Wrapper tabel + tombol + ── */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>Semua Buku ({books.length})</h2>
                    {/* Tombol + di pojok kanan atas */}
                    <button
                        className="btn-add-book"
                        onClick={() => { resetForm(); setShowAddModal(true) }}
                    >
                        <Plus size={16} /> Tambah Buku
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <Loader2 size={28} className="spin" />
                        <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>Memuat buku...</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="admin-empty">
                        <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p>Belum ada buku. Klik + untuk menambahkan.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Cover</th>
                                <th>Judul & Penulis</th>
                                <th>Kategori</th>
                                <th>👁 Views</th>
                                <th>♥ Likes</th>
                                <th>Ditambahkan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    {/* Cover */}
                                    <td>
                                        <div className="book-cover-sm">
                                            {book.cover ? (
                                                <img src={book.cover} alt={book.title} />
                                            ) : (
                                                <BookOpen size={18} color="#f9a8d4" />
                                            )}
                                        </div>
                                    </td>

                                    {/* Judul & Penulis */}
                                    <td>
                                        <div className="book-title-cell">
                                            <span className="book-title-text">{book.title}</span>
                                            <span className="book-author-text">{book.author}</span>
                                        </div>
                                    </td>

                                    {/* Kategori */}
                                    <td>
                                        <span className="admin-book-category">{book.category}</span>
                                    </td>

                                    {/* Views */}
                                    <td style={{ color: '#9d174d', fontWeight: 700 }}>
                                        {book.viewCount.toLocaleString('id-ID')}
                                    </td>

                                    {/* Likes */}
                                    <td style={{ color: '#ec4899', fontWeight: 700 }}>
                                        {book.likeCount.toLocaleString('id-ID')}
                                    </td>

                                    {/* Tanggal */}
                                    <td style={{ color: '#d1a0b8', fontSize: '0.82rem' }}>
                                        {new Date(book.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>

                                    {/* Hapus */}
                                    <td>
                                        <button
                                            className="btn-delete"
                                            onClick={() => setDeleteTarget(book)}
                                        >
                                            <Trash2 size={14} /> Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ══════════════════════════════════════
          MODAL TAMBAH BUKU
      ══════════════════════════════════════ */}
            {showAddModal && (
                <div className="confirm-overlay">
                    <div className="add-book-modal">

                        {/* Header */}
                        <div className="add-book-modal-header">
                            <h3>Tambah Buku Baru</h3>
                            <button
                                className="notif-modal-close"
                                onClick={handleCloseModal}
                                disabled={submitting}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="add-book-modal-body">

                            {/* Cover Upload */}
                            <div className="add-book-cover-section">
                                <label className="notif-form-label">Cover Buku</label>
                                <div
                                    className={`cover-upload-area ${coverPreview ? 'has-cover' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} alt="Preview" className="cover-preview-img" />
                                            <div className="cover-overlay">
                                                <ImageIcon size={20} />
                                                <span>Ganti Cover</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="cover-placeholder">
                                            <ImageIcon size={32} color="#f9a8d4" />
                                            <span>Klik untuk upload cover</span>
                                            <span className="cover-hint">JPG, PNG, WEBP · Maks 5MB</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleCoverChange}
                                    style={{ display: 'none' }}
                                />
                                {coverError && (
                                    <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{coverError}</span>
                                )}
                            </div>

                            {/* Judul */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">Judul Buku *</label>
                                <input
                                    className="notif-form-input"
                                    name="title"
                                    type="text"
                                    placeholder="contoh: Lord of the Mysteries"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    maxLength={200}
                                />
                            </div>

                            {/* Penulis */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">Penulis / Author *</label>
                                <input
                                    className="notif-form-input"
                                    name="author"
                                    type="text"
                                    placeholder="contoh: 爱潜水的乌贼"
                                    value={form.author}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    maxLength={100}
                                />
                            </div>

                            {/* Kategori */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">Kategori *</label>
                                <select
                                    className="notif-form-input"
                                    name="category"
                                    value={form.category}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Fantasy">Fantasy</option>
                                    <option value="Mystery">Mystery</option>
                                    <option value="Romansa">Romansa</option>
                                    <option value="School">School</option>
                                    <option value="Guide">Guide</option>
                                    <option value="Fiksi">Fiksi</option>
                                    <option value="Biografi">Biografi</option>
                                    <option value="Sejarah">Sejarah</option>
                                    <option value="Teknologi">Teknologi</option>
                                </select>
                            </div>

                            {/* Deskripsi */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">Deskripsi</label>
                                <textarea
                                    className="notif-form-textarea"
                                    name="description"
                                    placeholder="Tulis sinopsis atau deskripsi singkat buku..."
                                    value={form.description}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    rows={4}
                                    maxLength={1000}
                                />
                                <span className="notif-char-count">{form.description.length}/1000</span>
                            </div>

                            {/* Error */}
                            {submitError && (
                                <div className="notif-send-error">{submitError}</div>
                            )}

                            {/* Sukses */}
                            {submitSuccess && (
                                <div className="notif-send-success">
                                    <Check size={16} /> Buku berhasil ditambahkan!
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!submitSuccess && (
                            <div className="notif-modal-footer">
                                <button
                                    className="btn-cancel"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                >
                                    Batal
                                </button>
                                <button
                                    className="btn-send-confirm"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? <><Loader2 size={15} className="spin" /> Menyimpan...</>
                                        : <><Plus size={15} /> Tambah Buku</>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════
          MODAL KONFIRMASI HAPUS
      ══════════════════════════════════════ */}
            {deleteTarget && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <h3>Hapus Buku?</h3>
                        <p>
                            Buku <strong>"{deleteTarget.title}"</strong> oleh{' '}
                            <strong>{deleteTarget.author}</strong> akan dihapus
                            permanen dari database beserta semua chapter-nya.
                        </p>
                        <div className="confirm-btns">
                            <button
                                className="btn-cancel"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Batal
                            </button>
                            <button
                                className="btn-confirm-delete"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Menghapus...' : 'Ya, Hapus Buku'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}