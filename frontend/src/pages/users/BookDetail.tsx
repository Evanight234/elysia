import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import { Heart, Eye, BookOpen, ChevronLeft, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import './UserPages.css'

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

    useEffect(() => {
        const fetchBookDetail = async () => {
            try {
                setLoading(true)
                const res = await api.get(`/books/${id}`)
                setBook(res.data.data)
            } catch (err: any) {
                console.error('Failed to fetch book detail:', err)
                setError('Buku tidak ditemukan atau terjadi kesalahan.')
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
                    <p>Memuat detail buku...</p>
                </div>
            </UserLayout>
        )
    }

    if (error || !book) {
        return (
            <UserLayout>
                <div className="empty-state">
                    <p>{error || 'Buku tidak ditemukan.'}</p>
                    <button onClick={() => navigate(-1)} className="back-btn">Kembali</button>
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
            await api.post('/library', { bookId: book.id, status: 'READING' })
        } catch (err) {
            console.error('Failed to update library status:', err)
        }
        
        const target = lastChapterRead ?? (book.chapters.length > 0 ? book.chapters[0] : null)
        if (target) {
            navigate(`/read/${book.id}/chapter/${target.number}`)
        } else {
            alert('Belum ada chapter tersedia untuk buku ini.')
        }
    }
    // togle Like

    const handleLike = () => {
        setBook(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        }))
        //TODO : POST /Book/:id/like ke backend
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
                Kembali
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
                        <span className='book-category-badge'>{book.category}</span>
                        <h1 className='book-detail-title'>{book.title}</h1>
                        <p className='book-detail-author'>oleh : {book.author}</p>

                        {/* stats: Likes & view */}
                        <div className='book-stats'>
                            <div className='stats-items'>
                                <Heart size={18} fill={book.isLiked ? 'var(--pink-500)' : 'none'} color="var(--pink-500)" />
                                <span>{book.likeCount.toLocaleString('id-ID')} Like </span>
                            </div>
                            <div className='stats-items'>
                                <Eye size={18} />
                                <span>{book.viewCount.toLocaleString('id-ID')} views </span>
                            </div>
                        </div>
                        <p className='book-description'>{book.description || 'Tidak ada deskripsi untuk buku ini.'}</p>

                        {/* tombol aksi */}
                        <div className='book-action-btns'>
                            <button className='btn-read-now' onClick={HandleReadNow}>
                                <BookOpen size={18} /> {lastChapterRead ? `Lanjutkan Baca Chapter ${lastChapterRead.number}` : 'Mulai baca'}
                            </button>

                            <button
                                className={`btn-like ${book.isLiked ? 'liked' : ''}`}
                                onClick={handleLike}
                            >
                                <Heart
                                    size={18}
                                    fill={book.isLiked ? 'white' : 'none'}
                                />
                                {book.isLiked ? 'Disukai' : 'Suka'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* daftar chapter */}
                <div className='chapter-selection'>
                    <h2>Daftar Chapter</h2>
                    <div className='chapter-list'>
                        {book.chapters.map((chapter) => (
                            <button
                                key={chapter.id}
                                className={`chapter-item ${chapter.isRead ? 'chapter-read' : ''}`}
                                onClick={() => HandleChapterClick(chapter.number)}
                            >
                                <div className='chapter-left'>
                                    <span className='chapter-number'> Chapter {chapter.number} </span>
                                    <span className='chapter-title'>{chapter.title}</span>
                                </div>
                                {chapter.isRead && (
                                    <span className='chapter-read-badge'> Dibaca </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </UserLayout>
    )
}