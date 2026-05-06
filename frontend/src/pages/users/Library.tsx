import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { Heart } from 'lucide-react';

export default function Library() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  
  // Simulasi data favorit (nanti fetch dari API /library)
  const favorites = [
    { id: 1, title: 'The Pink Adventure', author: 'Elysia Dash', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200', viewCount: 8532 },
    { id: 101, title: 'Pink World', author: 'Lily Rose', cover: 'https://images.unsplash.com/photo-1543005120-a1bb6ea7b124?auto=format&fit=crop&q=80&w=200', viewCount: 420 },
  ];

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Perpustakaan {user.name}</h1>
        <p>Buku-buku favorit dan yang ingin kamu baca nanti.</p>
      </div>

      <section className="library-section">
        <h2 className="section-title">
          <Heart size={20} fill="var(--pink-500)" color="var(--pink-500)" /> Favorit Saya
        </h2>
        
        {favorites.length > 0 ? (
          <div className="book-grid">
            {favorites.map(book => (
              <div 
                key={book.id} 
                className="book-card"
                onClick={() => navigate(`/books/${book.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="book-cover">
                  <img src={book.cover} alt={book.title} />
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
                      e.stopPropagation();
                      navigate(`/read/${book.id}/chapter/1`);
                    }}
                  >
                    Baca Lagi
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Belum ada buku di perpustakaanmu. Yuk cari buku!</p>
          </div>
        )}
      </section>
    </UserLayout>
  );
}
