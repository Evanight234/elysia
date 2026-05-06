import { useNavigate } from 'react-router-dom'
import UserLayout from '../../components/layout/UserLayout'
import './UserPages.css'

export default function Home() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');

  const recommendations = [
    { id: 1, title: 'The Pink Adventure', author: 'Elysia Dash', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200', viewCount: 8532 },
    { id: 2, title: 'Buku Favorit Admin', author: 'Admin Kece', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200', viewCount: 3210 },
    { id: 3, title: 'Digital Library Guide', author: 'Tech Pink', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200', viewCount: 1540 },
    { id: 4, title: 'Novel Romansa', author: 'Sweet Pinky', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200', viewCount: 12004 },
  ]

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Halo, Selamat Datang {user.username}!</h1>
        <p>Lihat rekomendasi buku spesial untukmu hari ini.</p>
      </div>

      <section className="recommendation-section">
        <h2 className="section-title">Rekomendasi Admin</h2>
        <div className="book-grid">
          {recommendations.map(book => (
            <div
              key={book.id}
              className="book-card"
              // Klik card → ke halaman detail buku
              onClick={() => navigate(`/books/${book.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="book-cover">
                <img src={book.cover} alt={book.title} />
                {/* Badge jumlah pembaca */}
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
                    e.stopPropagation() // Jangan trigger klik card
                    navigate(`/read/${book.id}/chapter/1`)
                  }}
                >
                  Baca Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  )
}