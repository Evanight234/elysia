import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import { Heart, Eye, BookOpen, ChevronLeft, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import './UserPages.css'
import { useTranslation } from 'react-i18next'
import { translateCategory } from '../../utils/categoryHelper'

interface Chapter {
    id: string
    number: number
    title: string
    isRead: boolean
}

interface BookDetailData {
    id: string
    title: string
    author: string
    cover: string | null
    description: string | null
    category: string
    likeCount: number
    viewCount: number
    isLiked: boolean
    chapters: Chapter[]
}

export default function BookDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState<BookDetailData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { t } = useTranslation()

    useEffect(() => {
        const fetchBookDetail = async () => {
            try {
                setLoading(true)
                const res = await api.get(`/books/${id}`)
                setBook(res.data.data)
            } catch (err: any) {
                console.error('Failed to fetch book detail:', err)
                setError(t('bookDetail.errorBook'))
            } finally {
                setLoading(false)
            }
        }
        fetchBookDetail()
    }, [id])

    if (loading) {
        return (
            <UserLayout>
                <div className="empty-state">
                    <Loader2 size={32} className="spin" />
                    <p>{t('bookDetail.loading')}</p>
                </div>
            </UserLayout>
        )
    }

    if (error || !book) {
        return (
            <UserLayout>
                <div className="empty-state">
                    <p>{error || t('bookDetail.errorBook')}</p>
                    <button onClick={() => navigate(-1)} className="back-btn">{t('bookDetail.back')}</button>
                </div>
            </UserLayout>
        )
    }

    const lastChapterRead = [...book.chapters]
        .reverse()
        .find(chapter => chapter.isRead)

    const HandleReadNow = async () => {
        // Logika "Baca Sekarang": Tambahkan ke library dengan status READING
        try {
            await api.post('/library', { bookId: book.id, status: t('bookDetail.reading') })
        } catch (err) {
            console.error('Failed to update library status:', err)
        }

        const target = lastChapterRead ?? (book.chapters.length > 0 ? book.chapters[0] : null)
        if (target) {
            navigate(`/read/${book.id}/chapter/${target.number}`)
        } else {
            alert(t('bookDetail.errorChapterLoad'))
        }
    }
    // togle Like

    // toggle Like
    const handleLike = async () => {
        try {
            const res = await api.post(`/books/${book.id}/like`)
            const { liked } = res.data.data
            setBook(prev => ({
                ...prev,
                isLiked: liked,
                likeCount: liked ? prev.likeCount + 1 : prev.likeCount - 1,
            }))
        } catch (err) {
            console.error('Failed to toggle like:', err)
        }
    }

    //klik chapter langsung
    const HandleChapterClick = (chapterNumber: number) => {
        navigate(`/read/${book.id}/chapter/${chapterNumber}`)
    }
    return (
        <UserLayout>
            {/* tombol kembali */}
            <button onClick={() => navigate(-1)} className='back-btn'>
                <ChevronLeft size={20} />
                {t('bookDetail.back')}
            </button>

            {/*detail buku */}
            <div className='book-detail-wrapper'>
                {/* cover + info */}
                <div className='book-detail-top'>
                    <div className='book-detail-cover'>
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} />
                        ) : (
                            <div className="book-cover-placeholder-large">{book.title[0]}</div>
                        )}
                    </div>
                    <div className='book-detail-info'>
                        <span className='book-category-badge'>{translateCategory(book.category)}</span>
                        <h1 className='book-detail-title'>{book.title}</h1>
                        <p className='book-detail-author'>{t('bookDetail.author')} : {book.author}</p>

                        {/* stats: Likes & view */}
                        <div className='book-stats'>
                            <div className='stats-items'>
                                <Heart size={18} fill={book.isLiked ? 'var(--pink-500)' : 'none'} color="var(--pink-500)" />
                                <span>{book.likeCount.toLocaleString('id-ID')} {t('bookDetail.like')} </span>
                            </div>
                            <div className='stats-items'>
                                <Eye size={18} />
                                <span>{book.viewCount.toLocaleString('id-ID')} {t('bookDetail.views')} </span>
                            </div>
                        </div>
                        <p className='book-description'>{book.description || t('bookDetail.noDescription')}</p>

                        {/* tombol aksi */}
                        <div className='book-action-btns'>
                            <button className='btn-read-now' onClick={HandleReadNow}>
                                <BookOpen size={18} /> {lastChapterRead ? `${t('bookDetail.continueReading')} ${lastChapterRead.number}` : t('bookDetail.startReading')}
                            </button>

                            <button
                                className={`btn-like ${book.isLiked ? 'liked' : ''}`}
                                onClick={handleLike}
                            >
                                <Heart
                                    size={18}
                                    fill={book.isLiked ? 'white' : 'none'}
                                />
                                {book.isLiked ? t('bookDetail.liked') : t('bookDetail.like')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* daftar chapter */}
                <div className='chapter-selection'>
                    <h2>{t('bookDetail.chapters list')}</h2>
                    <div className='chapter-list'>
                        {book.chapters.map((chapter) => (
                            <button
                                key={chapter.id}
                                className={`chapter-item ${chapter.isRead ? 'chapter-read' : ''}`}
                                onClick={() => HandleChapterClick(chapter.number)}
                            >
                                <div className='chapter-left'>
                                    <span className='chapter-number'> {t('bookDetail.chapters')} {chapter.number} </span>
                                    <span className='chapter-title'>{chapter.title}</span>
                                </div>
                                {chapter.isRead && (
                                    <span className='chapter-read-badge'> {t('bookDetail.read')} </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </UserLayout>
    )
}