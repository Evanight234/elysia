import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Heart, List, X, Loader2, MessageSquare, Flame, Gift } from 'lucide-react'
import api from '../../api/axios'
import CommentSection from '../../components/ui/CommentSection'
import './ReadChapter.css'

// ── Tipe Data ──────────────────────────────────────────────
interface Paragraph {
    id: number
    text: string
    comments: number
}

interface ChapterData {
    id: string
    number: number
    title: string
    paragraphs: Paragraph[]
    totalComments: number
}

interface BookInfo {
    id: string
    title: string
    author: string
    cover: string | null
    totalChapters: number
}

interface ChapterListItem {
    number: number
    title: string
    isRead: boolean
}

export default function ReadChapter() {
    const { bookId, chapterNumber } = useParams()
    const navigate = useNavigate()
    const contentRef = useRef<HTMLDivElement>(null)

    const [chapter, setChapter] = useState<ChapterData | null>(null)
    const [book, setBook] = useState<BookInfo | null>(null)
    const [allChapters, setAllChapters] = useState<ChapterListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showChapterList, setShowChapterList] = useState(false)
    const [activeComment, setActiveComment] = useState<number | null>(null)
    const [isLiked, setIsLiked] = useState(false)
    const [isRead, setIsRead] = useState(false)

    const currentNum = parseInt(chapterNumber || '1')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const [bookRes, chapterRes] = await Promise.all([
                    api.get(`/books/${bookId}`),
                    api.get(`/books/${bookId}/chapters/${currentNum}`)
                ])

                const bookData = bookRes.data.data
                const chapterData = chapterRes.data.data

                setBook({
                    id: bookData.id,
                    title: bookData.title,
                    author: bookData.author,
                    cover: bookData.cover,
                    totalChapters: bookData.chapters.length
                })

                setAllChapters(bookData.chapters.map((ch: any) => ({
                    number: ch.number,
                    title: ch.title,
                    isRead: false // TODO: check read status
                })))

                setChapter(chapterData)
                setIsLiked(bookData.isLiked || false)

                if (contentRef.current) {
                    contentRef.current.scrollTop = 0
                }

            } catch (err: any) {
                console.error(err)
                setError('Gagal memuat chapter. Silakan coba lagi.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [bookId, currentNum])

    useEffect(() => {
        const updateProgress = async () => {
            if (!isRead && chapter) {
                try {
                    await api.patch(`/library/${bookId}/lastChapter`, {
                        chapterNumber: currentNum
                    })
                    setIsRead(true)
                } catch (err) {
                    console.error('Failed to update progress:', err)
                }
            }
        }

        const handleScroll = () => {
            if (!contentRef.current) return
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                updateProgress()
            }
        }

        const el = contentRef.current
        if (el) {
            el.addEventListener('scroll', handleScroll)
            return () => el.removeEventListener('scroll', handleScroll)
        }
    }, [bookId, currentNum, isRead, chapter])

    const handleNavChapter = (num: number) => {
        setShowChapterList(false)
        setActiveComment(null)
        setIsRead(false)
        navigate(`/read/${bookId}/chapter/${num}`)
    }

    const handleLike = async () => {
        try {
            const res = await api.post(`/books/${bookId}/like`)
            setIsLiked(res.data.data.liked)
        } catch (err) {
            console.error('Failed to toggle like:', err)
        }
    }

    const hasPrev = currentNum > 1
    const hasNext = book ? currentNum < book.totalChapters : false

    const [scrollPercent, setScrollPercent] = useState(0)
    useEffect(() => {
        const el = contentRef.current
        if (!el) return
        const handleProgress = () => {
            const total = el.scrollHeight - el.clientHeight
            const current = el.scrollTop
            const percent = Math.round((current / (total || 1)) * 100)
            setScrollPercent(Math.min(100, Math.max(0, percent)))
        }
        el.addEventListener('scroll', handleProgress)
        return () => el.removeEventListener('scroll', handleProgress)
    }, [loading])

    if (loading) {
        return (
            <div className="reader-root loading">
                <Loader2 className="animate-spin" size={40} />
                <p>Memuat keajaiban...</p>
            </div>
        )
    }

    if (error || !book || !chapter) {
        return (
            <div className="reader-root">
                <div className="empty-state">
                    <p>{error || 'Chapter tidak ditemukan.'}</p>
                    <Link to={`/books/${bookId}`} className="back-btn">Kembali ke Detail Buku</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="reader-root">
            <header className="reader-topbar premium">
                <div className="reader-topbar-left">
                    <Link to={`/books/${bookId}`} className="reader-breadcrumb-link">
                        {book.title}
                    </Link>
                    <span className="reader-divider">/</span>
                    <span className="reader-current-ch">
                        Chapter {chapter.number}: {chapter.title}
                    </span>
                    <span className="reader-progress-badge">
                        {scrollPercent}%
                    </span>
                </div>

                <div className="reader-topbar-right">
                    <Link to="/library" className="reader-nav-link">Library</Link>
                    <button
                        className="reader-icon-btn main"
                        onClick={() => setShowChapterList(v => !v)}
                    >
                        <List size={20} />
                    </button>
                </div>
            </header>

            <main className="reader-main" ref={contentRef}>
                <div className="reader-container">

                    {/* ── CHAPTER START (Only at top) ── */}
                    <div className="chapter-start-section">
                        <div className="start-cover-wrapper">
                            <img
                                src={book.cover || 'https://placehold.co/200x300?text=No+Cover'}
                                alt={book.title}
                                className="start-cover-img"
                            />
                        </div>
                        <h2 className="start-book-title">{book.title}</h2>
                        <p className="start-book-author"><b>Author:</b> {book.author}</p>

                        <div className="copyright-info">
                            <span className="copyright-icon">©</span> ElysiaApp
                        </div>

                        <div className="start-divider">
                            <div className="divider-line" />
                            <BookOpen size={20} className="divider-icon" />
                            <div className="divider-line" />
                        </div>
                    </div>

                    {/* Judul Chapter Besar */}
                    <div className="chapter-header-main">
                        <h1 className="chapter-title-main">
                            Chapter {chapter.number}: {chapter.title}
                        </h1>
                    </div>

                    {/* ── Paragraf ── */}
                    <article className="chapter-article">
                        {chapter.paragraphs.map((para) => (
                            <div
                                key={para.id}
                                className={`para-group ${activeComment === para.id ? 'active' : ''}`}
                            >
                                <div className="para-text-wrapper">
                                    <p className="para-body-text">{para.text}</p>

                                    <button
                                        className={`para-side-badge ${para.comments > 0 ? 'has-comments' : ''}`}
                                        onClick={() => setActiveComment(activeComment === para.id ? null : para.id)}
                                    >
                                        {para.comments > 0 ? para.comments : '+'}
                                    </button>
                                </div>

                                {activeComment === para.id && (
                                    <div className="para-comment-portal">
                                        <CommentSection
                                            paragraphId={para.id}
                                            chapterId={chapter.id}
                                            onClose={() => setActiveComment(null)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </article>

                    {/* ── CHAPTER END ACTIONS (WebNovel Style) ── */}
                    <div className="chapter-meta-bar bottom">
                        <div className="meta-action-item">
                            <div className="meta-icon-circle">
                                <MessageSquare size={20} />
                            </div>
                            <span className="meta-label">COMMENT</span>
                            <span className="meta-sub">{chapter.totalComments} comment</span>
                        </div>
                        <div className="meta-action-item">
                            <div className="meta-icon-circle">
                                <Flame size={20} />
                            </div>
                            <span className="meta-label">Vote</span>
                            <span className="meta-sub">1 left</span>
                        </div>
                        <div className="meta-action-item">
                            <div className="meta-icon-circle">
                                <Gift size={20} />
                            </div>
                            <span className="meta-label">SEND GIFT</span>
                        </div>
                    </div>

                    <footer className="chapter-footer">
                        <div className="footer-nav">
                            <button
                                className={`nav-btn-round ${!hasPrev ? 'disabled' : ''}`}
                                onClick={() => hasPrev && handleNavChapter(currentNum - 1)}
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="footer-progress">
                                <span>{currentNum} / {book.totalChapters} Chapters</span>
                            </div>

                            <button
                                className={`nav-btn-round ${!hasNext ? 'disabled' : ''}`}
                                onClick={() => hasNext && handleNavChapter(currentNum + 1)}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="footer-like-section">
                            <button
                                className={`premium-like-btn ${isLiked ? 'active' : ''}`}
                                onClick={handleLike}
                            >
                                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                                {isLiked ? 'Liked this story' : 'Give it a heart'}
                            </button>
                        </div>
                    </footer>
                </div>
            </main>

            {showChapterList && (
                <>
                    <div className="panel-overlay" onClick={() => setShowChapterList(false)} />
                    <aside className="premium-panel">
                        <div className="panel-header">
                            <h3>Table of Contents</h3>
                            <button className="panel-close" onClick={() => setShowChapterList(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="panel-scroll">
                            {allChapters.map(ch => (
                                <button
                                    key={ch.number}
                                    className={`panel-item ${ch.number === currentNum ? 'active' : ''} ${ch.isRead ? 'read' : ''}`}
                                    onClick={() => handleNavChapter(ch.number)}
                                >
                                    <span className="item-num">Chapter {ch.number}</span>
                                    <span className="item-title">{ch.title}</span>
                                    {ch.isRead && <span className="read-status">✓</span>}
                                </button>
                            ))}
                        </div>
                    </aside>
                </>
            )}
        </div>
    )
}