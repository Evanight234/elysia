import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import {
    Plus, Trash2, Loader2, X,
    BookOpen, Check, ChevronRight,
    ArrowLeft, Hash
} from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'

// ─── Tipe Data ───────────────────────────────────────────
interface Book {
    id: string   // format: "book-1", "book-2", dst
    title: string
    author: string
    cover: string | null
    category: string
}

interface Chapter {
    id: string   // format: "ch-{bookNum}-{chapterNum}"
    bookId: string   // format: "book-{num}"
    title: string
    content: string
    number: number
    createdAt: string
    book?: { title: string; author: string }
}

// ─── Step tambah chapter ─────────────────────────────────
type AddStep = 'selectBook' | 'fillForm'

export default function AdminChapters() {
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addStep, setAddStep] = useState<AddStep>('selectBook')
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // ── Form state ─────────────────────────────────────────
    const [chapterNumber, setChapterNumber] = useState('')
    const [chapterTitle, setChapterTitle] = useState('')
    const [chapterContent, setChapterContent] = useState('')

    // ── Fetch data ─────────────────────────────────────────
    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [chapRes, bookRes] = await Promise.all([
                api.get('/chapters'),   // GET semua chapter
                api.get('/books'),      // GET semua buku
            ])
            setChapters(chapRes.data.data || [])
            setBooks(bookRes.data.data || [])
        } catch (err) {
            console.error('Failed to fetch:', err)
        } finally {
            setLoading(false)
        }
    }

    // ── Ekstrak nomor buku dari book.id ───────────────────
    // "book-3" → 3
    const getBookNumber = (bookId: string): number => {
        const match = bookId.match(/book-(\d+)/)
        return match ? parseInt(match[1]) : 0
    }

    // ── Hitung chapter berikutnya untuk buku tertentu ─────
    const getNextChapterNumber = (bookId: string): number => {
        const existing = chapters.filter(ch => ch.bookId === bookId)
        if (existing.length === 0) return 1
        return Math.max(...existing.map(ch => ch.number)) + 1
    }

    // ── Buka modal ─────────────────────────────────────────
    const handleOpenAdd = () => {
        setAddStep('selectBook')
        setSelectedBook(null)
        setChapterNumber('')
        setChapterTitle('')
        setChapterContent('')
        setSubmitError('')
        setSubmitSuccess(false)
        setShowAddModal(true)
    }

    // ── Pilih buku → pindah ke step form ──────────────────
    const handleSelectBook = (book: Book) => {
        setSelectedBook(book)
        // Auto-isi nomor chapter berikutnya
        const nextNum = getNextChapterNumber(book.id)
        setChapterNumber(String(nextNum))
        setAddStep('fillForm')
    }

    // ── Reset & tutup modal ────────────────────────────────
    const handleCloseModal = () => {
        setShowAddModal(false)
        setAddStep('selectBook')
        setSelectedBook(null)
        setChapterNumber('')
        setChapterTitle('')
        setChapterContent('')
        setSubmitError('')
        setSubmitSuccess(false)
    }

    // ── Submit tambah chapter ──────────────────────────────
    const handleSubmit = async () => {
        setSubmitError('')

        if (!selectedBook) return setSubmitError('Buku belum dipilih.')
        if (!chapterNumber.trim()) return setSubmitError('Nomor chapter wajib diisi.')
        if (!chapterTitle.trim()) return setSubmitError('Judul chapter wajib diisi.')
        if (!chapterContent.trim()) return setSubmitError('Isi chapter wajib diisi.')

        const num = parseInt(chapterNumber)
        if (isNaN(num) || num < 1) return setSubmitError('Nomor chapter harus angka positif.')

        // ── Generate ID sesuai format database ──────────────
        // "book-3" → bookNumber = 3 → chapterId = "ch-3-{num}"
        const bookNumber = getBookNumber(selectedBook.id)
        const chapterId = `ch-${bookNumber}-${num}`

        // ── Cek apakah chapter number sudah ada di buku ini ─
        const duplicate = chapters.find(
            ch => ch.bookId === selectedBook.id && ch.number === num
        )
        if (duplicate) {
            return setSubmitError(
                `Chapter ${num} untuk buku ini sudah ada. Gunakan nomor lain.`
            )
        }

        setSubmitting(true)
        try {
            // POST /chapters → simpan ke DB
            await api.post('/chapters', {
                id: chapterId,          // "ch-3-5" (book 3, chapter 5)
                bookId: selectedBook.id,    // "book-3"
                number: num,
                title: chapterTitle.trim(),
                content: chapterContent.trim(),
            })

            setSubmitSuccess(true)
            await fetchAll()
            setTimeout(() => handleCloseModal(), 1500)

        } catch (err: any) {
            setSubmitError(
                err.response?.data?.message || 'Gagal menambahkan chapter. Coba lagi.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    // ── Hapus chapter ──────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            await api.delete(`/chapters/${deleteTarget.id}`)
            setChapters(prev => prev.filter(ch => ch.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (err) {
            console.error('Failed to delete chapter:', err)
        } finally {
            setDeleting(false)
        }
    }

    // ── Cari judul buku berdasarkan bookId ─────────────────
    const getBookTitle = (bookId: string): string => {
        const book = books.find(b => b.id === bookId)
        return book ? book.title : bookId
    }

    // ─── RENDER ──────────────────────────────────────────
    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>Kelola Chapter</h1>
                <p>Lihat, tambah, dan hapus chapter dari database ElysiaApp.</p>
            </div>

            {/* ── Tabel Chapter ── */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>Semua Chapter ({chapters.length})</h2>
                    <button className="btn-add-book" onClick={handleOpenAdd}>
                        <Plus size={16} /> Tambah Chapter
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <Loader2 size={28} className="spin" />
                        <p style={{ marginTop: '0.5rem', color: '#d1a0b8' }}>Memuat chapter...</p>
                    </div>
                ) : chapters.length === 0 ? (
                    <div className="admin-empty">
                        <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p>Belum ada chapter. Klik + untuk menambahkan.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Buku</th>
                                <th>No.</th>
                                <th>Judul Chapter</th>
                                <th>Isi (preview)</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chapters
                                // Urutkan: by bookId lalu by number
                                .sort((a, b) => {
                                    if (a.bookId !== b.bookId) return a.bookId.localeCompare(b.bookId)
                                    return a.number - b.number
                                })
                                .map(ch => (
                                    <tr key={ch.id}>
                                        {/* ID */}
                                        <td>
                                            <span className="chapter-id-badge">{ch.id}</span>
                                        </td>

                                        {/* Judul Buku */}
                                        <td>
                                            <div style={{ maxWidth: '160px' }}>
                                                <div className="admin-user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {getBookTitle(ch.bookId)}
                                                </div>
                                                <div className="admin-user-email">{ch.bookId}</div>
                                            </div>
                                        </td>

                                        {/* Nomor Chapter */}
                                        <td>
                                            <span className="chapter-number-badge">
                                                <Hash size={11} /> {ch.number}
                                            </span>
                                        </td>

                                        {/* Judul Chapter */}
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: '#1a0010',
                                                fontSize: '0.88rem',
                                                maxWidth: '180px',
                                                display: 'block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {ch.title}
                                            </span>
                                        </td>

                                        {/* Preview isi */}
                                        <td>
                                            <span style={{
                                                color: '#d1a0b8',
                                                fontSize: '0.8rem',
                                                maxWidth: '200px',
                                                display: 'block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {ch.content.slice(0, 60)}...
                                            </span>
                                        </td>

                                        {/* Tanggal */}
                                        <td style={{ color: '#d1a0b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                            {new Date(ch.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>

                                        {/* Hapus */}
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => setDeleteTarget(ch)}
                                            >
                                                <Trash2 size={14} /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                )}
            </div>

            {/* ══════════════════════════════════════
          MODAL TAMBAH CHAPTER
      ══════════════════════════════════════ */}
            {showAddModal && (
                <div className="confirm-overlay">
                    <div className="add-book-modal">

                        {/* Header */}
                        <div className="add-book-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                {/* Tombol back ke pilih buku */}
                                {addStep === 'fillForm' && (
                                    <button
                                        style={{
                                            background: 'none', border: 'none',
                                            color: '#be185d', cursor: 'pointer',
                                            display: 'flex', padding: '2px',
                                        }}
                                        onClick={() => setAddStep('selectBook')}
                                        disabled={submitting}
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div>
                                    <h3>
                                        {addStep === 'selectBook'
                                            ? 'Pilih Buku'
                                            : `Tambah Chapter — ${selectedBook?.title}`
                                        }
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#d1a0b8' }}>
                                        {addStep === 'selectBook'
                                            ? 'Pilih buku yang ingin ditambah chapter-nya'
                                            : `Buku: ${selectedBook?.id}`
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                className="notif-modal-close"
                                onClick={handleCloseModal}
                                disabled={submitting}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── STEP 1: Pilih Buku ── */}
                        {addStep === 'selectBook' && (
                            <div className="add-book-modal-body" style={{ padding: '1rem' }}>
                                {books.length === 0 ? (
                                    <div className="admin-empty">Belum ada buku di database.</div>
                                ) : (
                                    <div className="book-select-list">
                                        {books.map(book => {
                                            const chCount = chapters.filter(
                                                ch => ch.bookId === book.id
                                            ).length

                                            return (
                                                <button
                                                    key={book.id}
                                                    className="book-select-item"
                                                    onClick={() => handleSelectBook(book)}
                                                >
                                                    {/* Cover mini */}
                                                    <div className="book-cover-sm" style={{ width: '36px', height: '48px', flexShrink: 0 }}>
                                                        {book.cover ? (
                                                            <img src={book.cover} alt={book.title} />
                                                        ) : (
                                                            <BookOpen size={16} color="#f9a8d4" />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                                        <div style={{
                                                            fontWeight: 700, color: '#1a0010',
                                                            fontSize: '0.9rem',
                                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {book.title}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#d1a0b8' }}>
                                                            {book.author} · {book.id}
                                                        </div>
                                                    </div>

                                                    {/* Info jumlah chapter */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                        <span style={{
                                                            background: '#fce7f3', color: '#be185d',
                                                            fontSize: '0.72rem', fontWeight: 700,
                                                            padding: '2px 8px', borderRadius: '20px',
                                                        }}>
                                                            {chCount} ch
                                                        </span>
                                                        <ChevronRight size={16} color="#d1a0b8" />
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STEP 2: Form isi chapter ── */}
                        {addStep === 'fillForm' && selectedBook && (
                            <>
                                <div className="add-book-modal-body">

                                    {/* Preview ID yang akan dibuat */}
                                    <div className="chapter-id-preview">
                                        <span className="chapter-id-preview-label">ID Chapter yang akan dibuat:</span>
                                        <span className="chapter-id-preview-value">
                                            ch-{getBookNumber(selectedBook.id)}-{chapterNumber || '?'}
                                        </span>
                                        <span className="chapter-id-preview-label">Book ID:</span>
                                        <span className="chapter-id-preview-value">{selectedBook.id}</span>
                                    </div>

                                    {/* Nomor Chapter */}
                                    <div className="notif-form-group">
                                        <label className="notif-form-label">
                                            Nomor Chapter *
                                            <span style={{ color: '#d1a0b8', fontWeight: 400, marginLeft: '4px' }}>
                                                (auto: {getNextChapterNumber(selectedBook.id)})
                                            </span>
                                        </label>
                                        <input
                                            className="notif-form-input"
                                            type="number"
                                            min="1"
                                            placeholder={String(getNextChapterNumber(selectedBook.id))}
                                            value={chapterNumber}
                                            onChange={e => setChapterNumber(e.target.value)}
                                            disabled={submitting || submitSuccess}
                                        />
                                    </div>

                                    {/* Judul Chapter */}
                                    <div className="notif-form-group">
                                        <label className="notif-form-label">Judul Chapter *</label>
                                        <input
                                            className="notif-form-input"
                                            type="text"
                                            placeholder="contoh: Awal Perjalanan"
                                            value={chapterTitle}
                                            onChange={e => setChapterTitle(e.target.value)}
                                            disabled={submitting || submitSuccess}
                                            maxLength={200}
                                        />
                                    </div>

                                    {/* Isi Chapter */}
                                    <div className="notif-form-group">
                                        <label className="notif-form-label">
                                            Isi Chapter *
                                            <span style={{ color: '#d1a0b8', fontWeight: 400, marginLeft: '4px' }}>
                                                ({chapterContent.length} karakter)
                                            </span>
                                        </label>
                                        <textarea
                                            className="notif-form-textarea"
                                            placeholder="Tulis atau paste isi chapter di sini..."
                                            value={chapterContent}
                                            onChange={e => setChapterContent(e.target.value)}
                                            disabled={submitting || submitSuccess}
                                            rows={10}
                                            style={{ resize: 'vertical', minHeight: '200px' }}
                                        />
                                    </div>

                                    {/* Error */}
                                    {submitError && (
                                        <div className="notif-send-error">{submitError}</div>
                                    )}

                                    {/* Sukses */}
                                    {submitSuccess && (
                                        <div className="notif-send-success">
                                            <Check size={16} /> Chapter berhasil ditambahkan!
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
                                                : <><Plus size={15} /> Tambah Chapter</>
                                            }
                                        </button>
                                    </div>
                                )}
                            </>
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
                        <h3>Hapus Chapter?</h3>
                        <p>
                            <strong>{deleteTarget.title}</strong> (Chapter {deleteTarget.number})
                            dari buku <strong>{getBookTitle(deleteTarget.bookId)}</strong> akan
                            dihapus permanen dari database.
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
                                {deleting ? 'Menghapus...' : 'Ya, Hapus Chapter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}