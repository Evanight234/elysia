import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';
import { Search as SearchIcon, Loader2, BookOpen } from 'lucide-react';
import BookCover from '../../components/ui/BookCover';
import './UserPages.css';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  category: string;
  lastChapterNumber: number | null;
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm || query;
    if (!q.trim()) return;
    try {
      setLoading(true);
      const res = await api.get(`/books/search?q=${q}`);
      setResults(res.data.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadClick = (book: Book) => {
    if (book.lastChapterNumber) {
      navigate(`/read/${book.id}/chapter/${book.lastChapterNumber}`)
    } else {
      navigate(`/books/${book.id}`)
    }
  }

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Hei {user.name}, Mau Baca Apa Hari Ini?</h1>
        <p>Temukan judul atau kategori buku yang ingin kamu baca.</p>
      </div>

      <div className="search-container">
        <div className="search-box-large">
          <SearchIcon size={24} />
          <input 
            type="text" 
            placeholder="Masukkan judul buku atau kategori..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-search-main" onClick={() => handleSearch()} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : 'Cari'}
          </button>
        </div>
      </div>

      {results.length > 0 ? (
        <section className="results-section">
          <h2 className="section-title">Hasil Pencarian</h2>
          <div className="book-grid">
            {results.map(book => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => navigate(`/books/${book.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <BookCover src={book.cover} alt={book.title} />
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <button
                    className="btn-read"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadClick(book);
                    }}
                  >
                    <BookOpen size={14} /> {book.lastChapterNumber ? `Lanjut Ch ${book.lastChapterNumber}` : 'Lihat Detail'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : query && !loading ? (
        <div className="empty-state">
          <p>Tidak ada buku yang ditemukan untuk "{query}".</p>
        </div>
      ) : (
        <div className="categories-section">
          <h2 className="section-title">Kategori Populer</h2>
          <div className="category-tags">
            {['Adventure', 'Fantasy', 'Guide', 'Romansa', 'Teknologi', 'Sejarah'].map(cat => (
              <button key={cat} className="category-tag" onClick={() => {
                setQuery(cat);
                handleSearch(cat);
              }}>{cat}</button>
            ))}
          </div>
        </div>
      )}
    </UserLayout>
  );
}