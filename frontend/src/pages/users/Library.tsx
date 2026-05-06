import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import { Heart, BookOpen, Clock, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import './UserPages.css'

type Tab = 'favorite' | 'lastRead'

interface BookData {
  id: string
  title: string
  author: string
  cover: string | null
  category: string
  description: string | null
}

interface LibraryItem {
  id: string
  status: 'FAVORITE' | 'SAVED' | 'READING'
  addedAt: string
  book: BookData
}

export default function Library() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('favorite')
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true)
        const res = await api.get('/library')
        setLibraryItems(res.data.data || [])
      } catch (err: any) {
        console.error('Failed to fetch library:', err)
        setError('Gagal memuat perpustakaan.')
      } finally {
        setLoading(false)
      }
    }
    fetchLibrary()
  }, [])

  const favorites = libraryItems.filter(item => item.status === 'FAVORITE')
  const lastRead = libraryItems.filter(item => item.status === 'READING')
  // fallback if READING is empty, show SAVED in lastRead tab? 
  // Or just show READING. Let's show READING for lastRead.
  const currentList = activeTab === 'favorite' ? favorites : lastRead

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Perpustakaan {user.username}</h1>
        <p>Buku-buku favorit dan riwayat bacaan kamu.</p>
      </div>

      {/* Tab Switch */}
      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === 'favorite' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorite')}
        >
          <Heart size={16} /> Favorit Saya
        </button>
        <button
          className={`library-tab ${activeTab === 'lastRead' ? 'active' : ''}`}
          onClick={() => setActiveTab('lastRead')}
        >
          <Clock size={16} /> Bacaan Terakhir
        </button>
      </div>

      {/* List Buku */}
      <section className="library-section">
        {loading ? (
          <div className="empty-state">
            <Loader2 size={32} className="spin" />
            <p>Memuat perpustakaan...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        ) : currentList.length > 0 ? (
          <div className="book-grid">
            {currentList.map(item => (
              <div
                key={item.id}
                className="book-card"
                onClick={() => navigate(`/books/${item.book.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="book-cover">
                  {item.book.cover ? (
                    <img src={item.book.cover} alt={item.book.title} />
                  ) : (
                    <div className="book-cover-placeholder">{item.book.title[0]}</div>
                  )}
                </div>
                <div className="book-info">
                  <h3>{item.book.title}</h3>
                  <p>{item.book.author}</p>
                  <button
                    className="btn-read"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/books/${item.book.id}`)
                    }}
                  >
                    <BookOpen size={14} /> Baca
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {activeTab === 'favorite'
                ? 'Belum ada buku favorit. Yuk tambahkan!'
                : 'Belum ada riwayat bacaan.'}
            </p>
          </div>
        )}
      </section>
    </UserLayout>
  )
}