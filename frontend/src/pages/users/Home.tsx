import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import api from '../../api/axios'
import { Loader2 } from 'lucide-react'
import './UserPages.css'
import { useTranslation } from 'react-i18next'

interface Book {
  id: string
  title: string
  author: string
  cover: string | null
  viewCount: number
}

export default function Home() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/books')
        setBooks(res.data.data || [])
      } catch (err) {
        console.error('Failed to fetch books:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  return (
    <UserLayout>
      <div className="page-header">
        <h1>{t("home.greeting")} {user.username}!</h1>
        <p>{t("home.subtitle")}</p>
      </div>

      <section className="recommendation-section">
        <h2 className="section-title">{t("home.recommended")}</h2>

        {loading ? (
          <div className="empty-state">
            <Loader2 size={32} className="spin" />
            <p>{t("common.loading")}</p>
          </div>
        ) : books.length > 0 ? (
          <div className="book-grid">
            {books.map(book => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => navigate(`/books/${book.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="book-cover">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} />
                  ) : (
                    <div className="book-cover-placeholder">{book.title[0]}</div>
                  )}
                  <div className="view-badge">
                    👁 {book.viewCount.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <button
                    className="btn-read"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/read/${book.id}/chapter/1`)
                    }}
                  >
                    Baca Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Belum ada buku tersedia.</p>
          </div>
        )}
      </section>
    </UserLayout>
  )
}