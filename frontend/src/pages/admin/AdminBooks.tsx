import { useState, useEffect, useRef } from 'react'
import AdminLayout from './AdminLayout'
import {
    Plus, Trash2, Loader2, X,
    BookOpen, Check, Image as ImageIcon
} from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'
import { useTranslation } from 'react-i18next'
import { useToastContext } from '../../context/ToastContext'
import { translateCategory } from '../../utils/categoryHelper'

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

    const { t } = useTranslation()
    const { toast } = useToastContext()

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
            setCoverError(t('settings.formatUploadError'))
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setCoverError(t('settings.sizeUploadError'))
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

        if (!form.title.trim()) return setSubmitError(t('common.title-empty'))
        if (!form.author.trim()) return setSubmitError(t('common.author-empty'))
        if (!form.category.trim()) return setSubmitError(t('common.category-empty'))

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
            toast.success(t('books.successfully-upload'))
            await fetchBooks()
            setTimeout(() => handleCloseModal(), 1500)

        } catch (err: any) {
            const msg = err.response?.data?.message || t('common.errorAdd')
            setSubmitError(msg)
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    // ── Hapus buku ─────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            await api.delete(`/books/${deleteTarget.id}`)
            setBooks(prev => prev.filter(b => b.id !== deleteTarget.id))
            setDeleteTarget(null)
            toast.success(t('books.successfully-delete'))
        } catch (err: any) {
            const msg = err.response?.data?.message || t('common.errordeleteBook')
            setSubmitError(msg)
            toast.error(msg)
        } finally {
            setDeleting(false)
        }
    }
    // ─── RENDER ──────────────────────────────────────────
    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>{t('admin.manage book')}</h1>
                <p>{t('admin.manageBookDesc')}</p>
            </div>

            {/* ── Wrapper tabel + tombol + ── */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>{t('admin.totalBook')} ({books.length})</h2>
                    {/* Tombol + di pojok kanan atas */}
                    <button
                        className="btn-add-book"
                        onClick={() => { resetForm(); setShowAddModal(true) }}
                    >
                        <Plus size={16} /> {t('books.addBook')}
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <Loader2 size={28} className="spin" />
                        <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>{t('settings.loadingB')}</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="admin-empty">
                        <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p>{t('admin.emptyB')}</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('settings.cover')}</th>
                                <th>{t('settings.Title & Author')}</th>
                                <th>{t('common.category')}</th>
                                <th>{t('settings.views')}</th>
                                <th>{t('settings.likes')}</th>
                                <th>{t('settings.added')}</th>
                                <th>{t('settings.action')}</th>
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
                                        <span className="admin-book-category">{translateCategory(book.category)}</span>
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
                                            <Trash2 size={14} /> {t('admin.delete')}
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
                            <h3>{t('books.addB')}</h3>
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
                                <label className="notif-form-label">{t('settings.cover')}</label>
                                <div
                                    className={`cover-upload-area ${coverPreview ? 'has-cover' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} alt="Preview" className="cover-preview-img" />
                                            <div className="cover-overlay">
                                                <ImageIcon size={20} />
                                                <span>{t('settings.change-Cover')}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="cover-placeholder">
                                            <ImageIcon size={32} color="#f9a8d4" />
                                            <span>{t('books.uploadClick')}</span>
                                            <span className="cover-hint">{t('books.uploadCategory')}</span>
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
                                <label className="notif-form-label"> {t('books.title')} *</label>
                                <input
                                    className="notif-form-input"
                                    name="title"
                                    type="text"
                                    placeholder={t('books.example') + " : " + t('books.Book-Title-example')}
                                    value={form.title}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    maxLength={200}
                                />
                            </div>

                            {/* Penulis */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">{t('books.author')} *</label>
                                <input
                                    className="notif-form-input"
                                    name="author"
                                    type="text"
                                    placeholder={t('books.example') + " : " + t('books.Author-example')}
                                    value={form.author}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    maxLength={100}
                                />
                            </div>

                            {/* Kategori */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">{t('books.category')} *</label>
                                <select
                                    className="notif-form-input"
                                    name="category"
                                    value={form.category}
                                    onChange={handleFormChange}
                                    disabled={submitting || submitSuccess}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="">{t('books.Chose Category')}</option>
                                    <option value="Adventure">{t('category.Adventure')}</option>
                                    <option value="Fantasy">{t('category.Fantasy')}</option>
                                    <option value="Mystery">{t('category.Mystery')}</option>
                                    <option value="Romance">{t('category.Romance')}</option>
                                    <option value="School">{t('category.School')}</option>
                                    <option value="Guide">{t('category.Guide')}</option>
                                    <option value="Fiction">{t('category.Fiction')}</option>
                                    <option value="Biography">{t('category.Biography')}</option>
                                    <option value="History">{t('category.History')}</option>
                                    <option value="Technology">{t('category.Technology')}</option>
                                    <option value="Sci-fi">{t('category.Sci-fi')}</option>
                                    <option value="Hentai">{t('category.Hentai')}</option>
                                    <option value="Isekai">{t('category.Isekai')}</option>
                                    <option value="Horror">{t('category.Horror')}</option>
                                    <option value="Thriller">{t('category.Thriller')}</option>
                                    <option value="Slice of Life">{t('category.Slice of Life')}</option>
                                    <option value="Action">{t('category.Action')}</option>
                                    <option value="Drama">{t('category.Drama')}</option>
                                    <option value="Adult">{t('category.Adult')}</option>
                                    <option value="Supernatural">{t('category.Supernatural')}</option>
                                    <option value="Yuri">{t('category.Yuri')}</option>
                                    <option value="Yaoi">{t('category.Yaoi')}</option>
                                    <option value="Martial Arts">{t('category.Martial Arts')}</option>
                                </select>
                            </div>

                            {/* Deskripsi */}
                            <div className="notif-form-group">
                                <label className="notif-form-label">{t('common.description')}</label>
                                <textarea
                                    className="notif-form-textarea"
                                    name="description"
                                    placeholder={t('books.sinopsis example')}
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
                                    <Check size={16} /> {t('books.successfully-upload')}!
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
                                    {t('admin.cancel')}
                                </button>
                                <button
                                    className="btn-send-confirm"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? <><Loader2 size={15} className="spin" /> {t('books.loadingBookSave')}</>
                                        : <><Plus size={15} /> {t('books.bookAdd')}</>
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
                        <h3>{t('books.deleteBook?')}</h3>
                        <p>
                            {t('common.book')} <strong>"{deleteTarget.title}"</strong> {t('common.by')}
                            <strong>{deleteTarget.author}</strong> {t('books.permanently-delete')}
                        </p>
                        <div className="confirm-btns">
                            <button
                                className="btn-cancel"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                className="btn-confirm-delete"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? t('books.loadingDelete') : t('books.deleteConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}