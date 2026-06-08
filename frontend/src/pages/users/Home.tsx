import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import api from '../../api/axios'
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import './UserPages.css'
import { useTranslation } from 'react-i18next'
import { useSidebarState } from '../../hooks/useSidebarState'

interface Book {
  id: string
  title: string
  author: string
  cover: string | null
  viewCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function Home() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { sidebarCollapsed, paginationLimit, sidebarClass } = useSidebarState()
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  })
  const { t } = useTranslation()

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}')

  const fetchBooks = async (page: number, currentLimit?: number) => {
    setLoading(true)
    try {
      const activeLimit = currentLimit ?? paginationLimit
      const res = await api.get(`/books/paginated?page=${page}&limit=${activeLimit}`)
      const data = res.data.data
      setBooks(data.books || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch books:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch books on mount and whenever sidebar state changes to automatically re-paginate
  useEffect(() => {
    fetchBooks(1, paginationLimit)
  }, [sidebarCollapsed])

  // NOTE: This effect applies the home page wallpaper class for the user-facing home page
  useEffect(() => {
    document.body.classList.add('home-wallpaper-active')
    return () => {
      document.body.classList.remove('home-wallpaper-active')
    }
  }, [])

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    fetchBooks(page, paginationLimit)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const { page, totalPages } = pagination
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <UserLayout>
      <div className={`home-page-container ${sidebarClass}`}>
        {/* Animated Background Blobs & Floating Particles */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="crystal-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`crystal-shard shard-${i + 1}`} />
          ))}
        </div>

        <div className="home-content-inner">
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
              <>
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
                          👁 {book.viewCount.toLocaleString(t('lang'))}
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
                          {t('common.readNow')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages >= 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      {t("home.showing", {
                        from: pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0,
                        to: Math.min(pagination.page * pagination.limit, pagination.total),
                        total: pagination.total,
                      })}
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => goToPage(1)}
                        disabled={pagination.page === 1}
                        title={t("common.firstPage")}
                      >
                        <ChevronsLeft size={18} />
                      </button>
                      <button
                        className="pagination-btn"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        title={t("common.prevPage")}
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {getPageNumbers().map((p, i) =>
                        p === '...' ? (
                          <span key={`dots-${i}`} className="pagination-dots">…</span>
                        ) : (
                          <button
                            key={p}
                            className={`pagination-btn pagination-num ${pagination.page === p ? 'active' : ''}`}
                            onClick={() => goToPage(p as number)}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        className="pagination-btn"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                        title={t("common.nextPage")}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        className="pagination-btn"
                        onClick={() => goToPage(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                        title={t("common.lastPage")}
                      >
                        <ChevronsRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>{t('home.noBooks')}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </UserLayout>
  );
}