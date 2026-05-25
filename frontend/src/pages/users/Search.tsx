import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';
import { Search as SearchIcon, Loader2, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './UserPages.css';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../../context/ToastContext';
import { translateCategory } from '../../utils/categoryHelper';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  category: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const { t } = useTranslation();
  const { toast } = useToastContext();
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = async (page: number = 1, searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true);
      const res = await api.get(`/books/search?q=${searchQuery}&page=${page}&limit=10`, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return
      const data = res.data.data;
      setResults(data.books || []);
      setPagination(data.pagination);
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error('Search failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pagination.totalPages) return;
    handleSearch(pageNumber, query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <UserLayout>
      <div className="page-header">
        <h1>{t('search.hei')} {user.name}, {t('search.heiSub')}</h1>
        <p>{t('search.subtitle')}</p>
      </div>

      <div className="search-container">
        <div className="search-box-large">
          <SearchIcon size={24} />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(1, query)}
          />
          <button className="btn-search-main" onClick={() => handleSearch(1, query)} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : t('nav.search')}
          </button>
        </div>
      </div>

      {results.length > 0 ? (
        <section className="results-section">
          <h2 className="section-title">{t('search.results')}</h2>
          <div className="book-grid">
            {results.map(book => (
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
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <button
                    className="btn-read"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/books/${book.id}`);
                    }}
                  >
                    <BookOpen size={14} /> {t('search.show-details')}
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
        </section>
      ) : query && !loading ? (
        <div className="empty-state">
          <p>{t('search.empty-search')} "{query}".</p>
        </div>
      ) : (
        <div className="categories-section">
          <h2 className="section-title">{t('search.categories')}</h2>
          <div className="category-tags">
            {[
              "Action",
              "Adventure",
              "Fantasy",
              "Mystery",
              "Romance",
              "School",
              "Guide",
              "Fiction",
              "Biography",
              "History",
              "Technology",
              "Sci-fi",
              "Isekai",
              "Horror",
              "Thriller",
              "Slice of Life",
              "Drama",
              "Adult",
              "Supernatural",
              "Yuri",
              "Yaoi",
              "Martial Arts",
              "shota",
              "Loli",
              "kultivation",
              "Trasmigration",
              "Magic",
              "Reincarnation",
              "Harem",
              "Historical"
            ].map(cat => (
              <button
                key={cat}
                className="category-tag"
                onClick={() => {
                  setQuery(cat);
                  handleSearch(1, cat);
                }}
              >
                {translateCategory(cat)}
              </button>
            ))}
          </div>
        </div>
      )}
    </UserLayout>
  );
}
