import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import { Heart, BookOpen, Clock } from 'lucide-react'
import './UserPages.css'

type Tab = 'favorite' | 'lastRead'

interface LibraryBook {
  id: number
  title: string
  author: string
  cover: string
  lastChapterRead: number
  totalChapters: number
}

export default function Library() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('favorite')

  const favorites: LibraryBook[] = [
    { id: 101, title: 'Pink World', author: 'Lily Rose', cover: 'https://images.unsplash.com/photo-1543005120-a1bb6ea7b124?auto=format&fit=crop&q=80&w=200', lastChapterRead: 3, totalChapters: 10 },
    { id: 1, title: 'The Pink Adventure', author: 'Elysia Dash', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200', lastChapterRead: 2, totalChapters: 5 },
  ]

  const lastRead: LibraryBook[] = [
    { id: 1, title: 'The Pink Adventure', author: 'Elysia Dash', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200', lastChapterRead: 2, totalChapters: 5 },
    { id: 3, title: 'Digital Library Guide', author: 'Tech Pink', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200', lastChapterRead: 1, totalChapters: 8 },
  ]

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
        {currentList.length > 0 ? (
          <div className="book-grid">
            {currentList.map(book => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => navigate(`/books/${book.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="book-cover">
                  <img src={book.cover} alt={book.title} />
                  {/* Progress chapter */}
                  <div className="chapter-progress-badge">
                    Ch.{book.lastChapterRead}/{book.totalChapters}
                  </div>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  {/* Progress bar */}
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(book.lastChapterRead / book.totalChapters) * 100}%` }}
                    />
                  </div>
                  <button
                    className="btn-read"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/read/${book.id}/chapter/${book.lastChapterRead}`)
                    }}
                  >
                    <BookOpen size={14} /> Lanjut Ch.{book.lastChapterRead}
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