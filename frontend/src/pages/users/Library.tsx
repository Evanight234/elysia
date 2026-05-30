import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import { Heart, BookOpen, Clock, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import api from '../../api/axios'
import './UserPages.css'
import { useTranslation } from 'react-i18next'
import { useSidebarState } from '../../hooks/useSidebarState'

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
  lastChapterRead: number
  addedAt: string
  book: BookData
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const TAB_STATUS: Record<Tab, string> = {
  favorite: 'FAVORITE',
  lastRead: 'READING',
}

export default function Library() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}')
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('favorite')
  const [items, setItems] = useState<LibraryItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const { t } = useTranslation()
  const abortRef = useRef<AbortController | null>(null)
  const { sidebarCollapsed, paginationLimit, sidebarClass } = useSidebarState()

  const fetchLibrary = useCallback(async (tab: Tab, p: number) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      const res = await api.get('/library', {
        params: { status: TAB_STATUS[tab], page: p, limit: paginationLimit },
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setItems(res.data.data.items || [])
      setPagination(res.data.data.pagination || null)
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error('Failed to fetch library:', err)
        setItems([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLibrary(activeTab, page)
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [activeTab, page, fetchLibrary, sidebarCollapsed])

  // Re-fetch on sidebar toggle to adjust limit
  useEffect(() => {
    setPage(1)
  }, [sidebarCollapsed])

  // Add wallpaper class on mount
  useEffect(() => {
    document.body.classList.add('home-wallpaper-active')
    return () => {
      document.body.classList.remove('home-wallpaper-active')
    }
  }, [])

  const handleTabChange = (tab: Tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab)
      setPage(1)
    }
  }

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || (pagination && pageNumber > pagination.totalPages)) return
    setPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    if (!pagination) return []
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
      <div className={`user-page-container ${sidebarClass}`}>
        <div className="page-header">
          <h1>{t('library.title')} {user.username}</h1>
          <p>{t('library.subtitle')}</p>
        </div>

      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === 'favorite' ? 'active' : ''}`}
          onClick={() => handleTabChange('favorite')}
        >
          <Heart size={16} /> {t('library.favorites')}
        </button>
        <button
          className={`library-tab ${activeTab === 'lastRead' ? 'active' : ''}`}
          onClick={() => handleTabChange('lastRead')}
        >
          <Clock size={16} /> {t('library.lastRead')}
        </button>
      </div>

      <section className="library-section">
        {loading ? (
          <div className="empty-state">
            <Loader2 size={32} className="spin" />
            <p>{t('library.loading')}</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="book-grid">
              {items.map(item => (
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
                    {item.lastChapterRead > 0 && (
                      <span className="chapter-badge">{t('readChapter.chapter')} {item.lastChapterRead}</span>
                    )}
                    <button
                      className="btn-read"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/books/${item.book.id}`)
                      }}
                    >
                      <BookOpen size={14} /> {t('library.continueReading')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pagination && pagination.total > 0 && pagination.totalPages >= 1 && (
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
            <p>
              {activeTab === 'favorite'
                ? t('library.empty_fav')
                : t('library.empty_read')}
            </p>
          </div>
        )}
      </section>
      </div>
    </UserLayout>
  )
}