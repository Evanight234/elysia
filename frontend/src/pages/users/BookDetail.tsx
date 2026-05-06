import { useState } from 'react'
import { useParams, useNavigate, } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import { Heart, Eye, BookOpen, ChevronLeft } from 'lucide-react'
import './UserPages.css'

// Tipe data
interface Chapter {
    id: number
    number: number
    title: string
    isRead: boolean
}

interface BookDetailData {
    id: number
    title: string
    author: string
    cover: string
    description: string
    category: string
    likeCount: number
    viewCount: number
    isLiked: boolean
    chapters: Chapter[]
}

export default function BookDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    //simulasi data buku
    const [book, setBook] = useState<BookDetailData>({
        id: 1,
        title: 'The Pink Adventure',
        author: 'Elysia Dash',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
        description: 'Sebuah petualangan seru di dunia serba merah muda yang penuh kejutan dan persahabatan sejati.',
        category: 'Romansa',
        likeCount: 1240,
        viewCount: 8532,
        isLiked: false,
        chapters: [
            { id: 1, number: 1, title: 'Awal Perjalanan', isRead: true },
            { id: 2, number: 2, title: 'Pertemuan Tak Terduga', isRead: true },
            { id: 3, number: 3, title: 'Rahasia Tersembunyi', isRead: false },
            { id: 4, number: 4, title: 'Jalan yang Bercabang', isRead: false },
            { id: 5, number: 5, title: 'Akhir yang Manis', isRead: false },
        ],
    })

    const lastChapterRead = [...book.chapters]
        .reverse()
        .find(chapter => chapter.isRead)
    // Tombol "Baca Sekarang" → arahkan ke chapter terakhir dibaca
    // atau chapter 1 jika belum pernah baca

    const HandleReadNow = () => {
        const target = lastChapterRead ?? book.chapters[0]
        navigate(`/read/${book.id}/chapter/${target.number}`)
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
                        <img src={book.cover} alt={book.title} />
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
                        <p className='book-description'>{book.description}</p>

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