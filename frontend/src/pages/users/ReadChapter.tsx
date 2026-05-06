import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Heart, List, X, ArrowLeft } from 'lucide-react'
import CommentSection from '../../components/ui/CommentSection'
import './ReadChapter.css'

// ── Tipe Data ──────────────────────────────────────────────
// Satu paragraf dalam chapter
interface Paragraph {
    id: number
    text: string
    comments: number   // jumlah komentar di paragraf ini
}

// Data satu chapter lengkap
interface ChapterData {
    id: number
    number: number
    title: string
    paragraphs: Paragraph[]
    totalComments: number
}

// Info buku ringkas (untuk header & navigasi)
interface BookInfo {
    id: number
    title: string
    totalChapters: number
}

// ── Komponen Utama ─────────────────────────────────────────
export default function ReadChapter() {
    const { bookId, chapterNumber } = useParams<{ bookId: string; chapterNumber: string }>()
    const navigate = useNavigate()
    const contentRef = useRef<HTMLDivElement>(null)

    // State: apakah panel daftar chapter terbuka
    const [showChapterList, setShowChapterList] = useState(false)
    // State: paragraf mana yang sedang hover (untuk tampilkan ikon komentar)
    const [hoveredParagraph, setHoveredParagraph] = useState<number | null>(null)
    // State: paragraf mana yang sedang dibuka komentar-nya
    const [activeComment, setActiveComment] = useState<number | null>(null)
    // State: apakah chapter ini sudah di-like user
    const [isLiked, setIsLiked] = useState(false)
    // State: apakah chapter sudah ditandai selesai dibaca
    const [isRead, setIsRead] = useState(false)

    // ── Data Statis (nanti diganti fetch dari API) ─────────
    const book: BookInfo = {
        id: Number(bookId),
        title: 'The Pink Adventure',
        totalChapters: 5,
    }

    const chapter: ChapterData = {
        id: 1,
        number: Number(chapterNumber),
        title: 'Prologue',
        totalComments: 21,
        paragraphs: [
            { id: 1, text: '"Nasib adalah kartu yang telah dibagikan kepada kita."', comments: 11 },
            { id: 2, text: '"Pilihan adalah cara kita memainkan kartu itu."', comments: 6 },
            { id: 3, text: 'Tapi, bagaimana jika kukatakan padamu bahwa apapun pilihan yang kamu buat, kamu tetap terikat untuk mengikuti jalan yang telah ditetapkan untukmu sejak lahir?', comments: 4 },
            { id: 4, text: 'Sederhananya, jika kamu Ditakdirkan menjadi Pion di kehidupan ini, kamu ditakdirkan memiliki nasib yang sama di kehidupan berikutnya, kehidupan setelahnya, dan kehidupan setelahnya lagi hingga kamu berhenti ada.', comments: 12 },
            { id: 5, text: 'Tak terhitung siklus kelahiran, kematian, dan reinkarnasi.', comments: 1 },
            { id: 6, text: 'Namun demikian, kamu ditakdirkan untuk mengikuti naskah yang sama, menjalani kehidupan yang sama, dan menderita akhir yang sama, terlepas dari seberapa keras kamu berjuang... dan terlepas dari pilihan-pilihan berbeda yang kamu buat.', comments: 2 },
            { id: 7, text: 'Tidakkah itu menyedihkan?', comments: 0 },
            { id: 8, text: 'Tidakkah itu tidak adil?', comments: 0 },
            { id: 9, text: 'Tentu saja, Hidup tidak pernah adil.', comments: 6 },
            { id: 10, text: 'Dan tidak ada seorang pun, kecuali segelintir makhluk, yang bisa berbuat apa-apa tentang hal itu.', comments: 0 },
            { id: 11, text: 'Tapi aku bisa.', comments: 8 },
            { id: 12, text: 'Dan aku akan melakukannya.', comments: 3 },
        ],
    }

    // ── Daftar chapter untuk panel navigasi ───────────────
    const allChapters = Array.from({ length: book.totalChapters }, (_, i) => ({
        number: i + 1,
        title: ['Prologue', 'Pertemuan Tak Terduga', 'Rahasia Tersembunyi', 'Jalan Bercabang', 'Akhir yang Manis'][i],
        isRead: i + 1 < Number(chapterNumber),
    }))

    const currentNum = Number(chapterNumber)
    const hasPrev = currentNum > 1
    const hasNext = currentNum < book.totalChapters

    // ── Efek: scroll ke atas setiap ganti chapter ─────────
    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        setIsRead(false)
        setActiveComment(null)
    }, [chapterNumber])

    // ── Efek: otomatis tandai "sudah dibaca" saat user
    //         scroll sampai paragraf terakhir (±200px dari bawah)
    useEffect(() => {
        const el = contentRef.current
        if (!el) return
        const handleScroll = () => {
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 200
            if (atBottom && !isRead) {
                setIsRead(true)
                // TODO: PATCH /library/:bookId/lastChapter { lastChapterRead: currentNum }
            }
        }
        el.addEventListener('scroll', handleScroll)
        return () => el.removeEventListener('scroll', handleScroll)
    }, [isRead, chapterNumber])

    // ── Handler ───────────────────────────────────────────
    const handleLike = () => {
        setIsLiked(prev => !prev)
        // TODO: POST /books/:bookId/chapters/:chapterId/like
    }

    const handleNavChapter = (num: number) => {
        navigate(`/read/${bookId}/chapter/${num}`)
        setShowChapterList(false)
    }

    // ── Render ────────────────────────────────────────────
    return (
        <div className="reader-root">

            {/* ── TOP BAR ── */}
            <header className="reader-topbar">
                <div className="reader-topbar-left">
                    {/* Tombol kembali ke detail buku */}
                    <Link to={`/books/${bookId}`} className="reader-back-btn">
                        <ArrowLeft size={18} /> Kembali
                    </Link>
                    <span className="reader-book-title">{book.title}</span>
                </div>

                <div className="reader-topbar-right">
                    {/* Tombol buka daftar chapter */}
                    <button
                        className="reader-icon-btn"
                        onClick={() => setShowChapterList(v => !v)}
                        title="Daftar Chapter"
                    >
                        <List size={20} />
                    </button>
                </div>
            </header>

            {/* ── KONTEN UTAMA ── */}
            <main className="reader-main" ref={contentRef}>
                <div className="reader-content">

                    {/* Judul Chapter */}
                    <div className="chapter-heading">
                        <h1>
                            Chapter {chapter.number}: {chapter.title}
                            {/* Total komentar chapter */}
                            <span className="chapter-comment-badge" title="Total komentar">
                                💬 {chapter.totalComments}
                            </span>
                        </h1>
                    </div>

                    {/* ── Paragraf ── */}
                    <div className="chapter-paragraphs">
                        {chapter.paragraphs.map((para) => (
                            <div
                                key={para.id}
                                className={`para-wrapper ${hoveredParagraph === para.id ? 'para-hovered' : ''}`}
                                onMouseEnter={() => setHoveredParagraph(para.id)}
                                onMouseLeave={() => setHoveredParagraph(null)}
                            >
                                {/* Teks paragraf */}
                                <p className="para-text">{para.text}</p>

                                {/* Badge komentar di kanan teks — hanya tampil jika ada komentar */}
                                {para.comments > 0 && (
                                    <button
                                        className={`para-comment-btn ${activeComment === para.id ? 'active' : ''}`}
                                        onClick={() => setActiveComment(
                                            activeComment === para.id ? null : para.id
                                        )}
                                        title={`${para.comments} komentar`}
                                    >
                                        {para.comments}
                                    </button>
                                )}

                                {/* Panel komentar inline (muncul di bawah paragraf saat diklik) */}
                                {activeComment === para.id && (
                                    <CommentSection
                                        paragraphId={para.id}
                                        chapterId={chapter.id}
                                        onClose={() => setActiveComment(null)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── Aksi bawah chapter ── */}
                    <div className="chapter-actions">
                        {/* Tombol Like chapter */}
                        <button
                            className={`chapter-like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            <Heart size={20} fill={isLiked ? 'white' : 'none'} />
                            {isLiked ? 'Disukai' : 'Suka Chapter Ini'}
                        </button>

                        {/* Status sudah dibaca */}
                        {isRead && (
                            <div className="chapter-read-status">
                                ✓ Chapter ini sudah kamu baca
                            </div>
                        )}
                    </div>

                    {/* ── Navigasi chapter bawah ── */}
                    <div className="chapter-nav-bottom">
                        <button
                            className={`chapter-nav-btn ${!hasPrev ? 'disabled' : ''}`}
                            onClick={() => hasPrev && handleNavChapter(currentNum - 1)}
                            disabled={!hasPrev}
                        >
                            <ChevronLeft size={18} /> Chapter Sebelumnya
                        </button>

                        <span className="chapter-nav-info">
                            {currentNum} / {book.totalChapters}
                        </span>

                        <button
                            className={`chapter-nav-btn next ${!hasNext ? 'disabled' : ''}`}
                            onClick={() => hasNext && handleNavChapter(currentNum + 1)}
                            disabled={!hasNext}
                        >
                            Chapter Berikutnya <ChevronRight size={18} />
                        </button>
                    </div>

                </div>
            </main>

            {/* ── PANEL DAFTAR CHAPTER (slide dari kanan) ── */}
            {showChapterList && (
                <>
                    {/* Overlay gelap di belakang panel */}
                    <div
                        className="chapter-panel-overlay"
                        onClick={() => setShowChapterList(false)}
                    />
                    <aside className="chapter-panel">
                        <div className="chapter-panel-header">
                            <h3><BookOpen size={18} /> Daftar Chapter</h3>
                            <button onClick={() => setShowChapterList(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="chapter-panel-list">
                            {allChapters.map(ch => (
                                <button
                                    key={ch.number}
                                    className={`
                    chapter-panel-item
                    ${ch.isRead ? 'ch-read' : ''}
                    ${ch.number === currentNum ? 'ch-active' : ''}
                  `}
                                    onClick={() => handleNavChapter(ch.number)}
                                >
                                    <div className="ch-panel-left">
                                        <span className="ch-panel-num">Chapter {ch.number}</span>
                                        <span className="ch-panel-title">{ch.title}</span>
                                    </div>
                                    {ch.isRead && (
                                        <span className="ch-panel-read-badge">✓ Dibaca</span>
                                    )}
                                    {ch.number === currentNum && (
                                        <span className="ch-panel-current-badge">Sedang Dibaca</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </aside>
                </>
            )}
        </div>
    )
}