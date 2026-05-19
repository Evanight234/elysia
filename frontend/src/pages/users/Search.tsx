import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';
import { Search as SearchIcon, Loader2, BookOpen } from 'lucide-react';
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

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const { t } = useTranslation();
  const { toast } = useToastContext();

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await api.get(`/books/search?q=${query}`);
      setResults(res.data.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-search-main" onClick={handleSearch} disabled={loading}>
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
        </section>
      ) : query && !loading ? (
        <div className="empty-state">
          <p>{t('search.empty-search')} "{query}".</p>
        </div>
      ) : (
        <div className="categories-section">
          <h2 className="section-title">{t('search.categories')}</h2>
          <div className="category-tags">
            {["Action",
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
              "Hentai",
              "Isekai",
              "Horror",
              "Thriller",
              "Slice of Life",
              "Drama",
              "Adult",
              "Supernatural",
              "Yuri",
              "Yaoi",
              "Martial Arts"].map(cat => (
                <button key={cat} className="category-tag" onClick={() => {
                  setQuery(cat);
                  const searchCat = async () => {
                    try {
                      setLoading(true);
                      const res = await api.get(`/books/search?q=${cat}`);
                      setResults(res.data.data || []);
                    } catch (err) {
                      console.error('Search failed:', err);
                    } finally {
                      setLoading(false);
                    }
                  };
                  searchCat();
                }}>{translateCategory(cat)}</button>
              ))}
          </div>
        </div>
      )}
    </UserLayout>
  );
}
