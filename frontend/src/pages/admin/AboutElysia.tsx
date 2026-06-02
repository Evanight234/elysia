import AdminLayout from './AdminLayout'
import './AdminPage.css'
import {
  BookOpen, Search, Library, Bell, User, LogOut,
  Heart, Globe, Shield, Sparkles, ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminAboutElysia() {
  const navigate = useNavigate()

  const navFeatures = [
    { icon: BookOpen, label: 'Beranda (Home)', desc: 'Halaman utama website yang menampilkan rekomendasi buku pilihan dari admin kepada pengguna.' },
    { icon: Search, label: 'Cari (Search)', desc: 'Digunakan untuk mencari buku berdasarkan judul maupun kategori.' },
    { icon: Library, label: 'Perpustakaan (Library)', desc: 'Menampilkan daftar buku favorit dan riwayat bacaan pengguna.' },
    { icon: Bell, label: 'Notifikasi (Notification)', desc: 'Menampilkan pesan dan pemberitahuan terbaru dari admin maupun informasi update novel.' },
    { icon: User, label: 'Profil (Profile)', desc: 'Menampilkan informasi akun pengguna seperti nama, email, status akun, tanggal bergabung, dan foto profil.' },
    { icon: LogOut, label: 'Log Out', desc: 'Digunakan untuk keluar dari akun dan mengakhiri sesi login pengguna secara aman.' },
  ]

  const categories = ['Action', 'Adventure', 'Teknologi', 'Sci-fi', 'Fantasy / Isekai', 'Mystery', 'Romance', 'Horror / Thriller']
  const languages = ['Indonesia', 'English', 'Japanese', 'Chinese']

  const sampleBooks = [
    { title: 'Lord of the Mysteries', author: 'Cuttlefish That Loves Diving' },
    { title: 'Omniscient Reader', author: 'Sing Shong' },
    { title: 'Shadow Slave', author: 'Guiltythree' },
    { title: 'Reverend Insanity', author: 'Gu Zhen Ren' },
    { title: 'Classroom of the Elite', author: 'Shogo Kinugasa' },
  ]

  return (
    <AdminLayout>
      <div className="about-elysia-page">

        <div className="about-content-inner">
          {/* Back Button */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Kembali
          </button>

          {/* Header */}
          <div className="about-header">
            <div className="about-header-icon">
              <div className="logo-dot" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', margin: '0 auto' }} />
            </div>
            <h1 className="about-title">ElysiaApp</h1>
            <p className="about-subtitle">Website Perpustakaan Digital Modern</p>
          </div>

          {/* Section 1: Deskripsi Umum */}
          <section className="about-section">
            <div className="about-section-header">
              <Sparkles size={22} />
              <h2>Deskripsi Umum</h2>
            </div>
            <div className="about-card">
              <p>
                ElysiaApp merupakan sebuah website perpustakaan digital yang dirancang untuk memudahkan pengguna dalam
                mencari, membaca, menyimpan, dan mengelola koleksi buku secara online.
              </p>
              <p>
                Website ini menggunakan tema warna pink pastel yang memberikan kesan modern, elegan, nyaman, dan ramah bagi pengguna.
              </p>
              <p>
                Sistem memiliki dua jenis pengguna yaitu <strong>User</strong> dan <strong>Admin</strong>. Setiap pengguna wajib melakukan login
                terlebih dahulu sebelum mengakses fitur-fitur di dalam website.
              </p>
            </div>
          </section>

          {/* Section 2: Sistem Login */}
          <section className="about-section">
            <div className="about-section-header">
              <Shield size={22} />
              <h2>Sistem Login dan Register</h2>
            </div>
            <div className="about-card">
              <p>
                Sebelum memasuki website, pengguna harus melakukan login menggunakan email dan kata sandi yang telah terdaftar.
              </p>
              <ul className="about-list">
                <li>Jika akun bertipe <strong>User</strong> maka masuk ke Dashboard User.</li>
                <li>Jika akun bertipe <strong>Admin</strong> maka masuk ke Dashboard Admin.</li>
              </ul>
              <p>
                Pengguna yang belum memiliki akun wajib melakukan registrasi terlebih dahulu melalui halaman daftar akun.
              </p>
            </div>
          </section>

          {/* Section 3: Dashboard User */}
          <section className="about-section">
            <div className="about-section-header">
              <BookOpen size={22} />
              <h2>Dashboard User</h2>
            </div>
            <div className="about-card">
              <p>
                Setelah login berhasil, pengguna akan diarahkan menuju halaman utama yang berisi rekomendasi buku dari admin
                dan berbagai fitur perpustakaan digital.
              </p>
            </div>
          </section>

          {/* Section 4: Navbar */}
          <section className="about-section">
            <div className="about-section-header">
              <BookOpen size={22} />
              <h2>Navbar Website</h2>
            </div>
            <div className="about-card">
              <p>Pada bagian kiri website terdapat sidebar navigation yang memudahkan pengguna berpindah halaman:</p>
              <div className="about-features-grid">
                {navFeatures.map((feat, idx) => (
                  <div key={idx} className="about-feature-card">
                    <div className="about-feature-icon">
                      <feat.icon size={20} />
                    </div>
                    <div className="about-feature-info">
                      <h4>{feat.label}</h4>
                      <p>{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Fitur Home */}
          <section className="about-section">
            <div className="about-section-header">
              <BookOpen size={22} />
              <h2>Fitur Home</h2>
            </div>
            <div className="about-card">
              <p>Pada halaman Home terdapat fitur rekomendasi buku yang dipilih langsung oleh admin. Setiap kartu buku menampilkan:</p>
              <ul className="about-list">
                <li>Cover buku</li>
                <li>Judul buku</li>
                <li>Nama penulis</li>
                <li>Tombol Baca Sekarang</li>
              </ul>
              <div className="about-books-showcase">
                {sampleBooks.map((book, idx) => (
                  <div key={idx} className="about-book-card">
                    <div className="about-book-cover">
                      <span>{book.title[0]}</span>
                    </div>
                    <div className="about-book-title">{book.title}</div>
                    <div className="about-book-author">{book.author}</div>
                    <div className="about-book-btn">Baca Sekarang</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 6: Fitur Search */}
          <section className="about-section">
            <div className="about-section-header">
              <Search size={22} />
              <h2>Fitur Search</h2>
            </div>
            <div className="about-card">
              <p>Halaman Search memungkinkan pengguna menemukan buku dengan lebih cepat. Fitur ini mencakup:</p>
              <ul className="about-list">
                <li>Pencarian berdasarkan judul.</li>
                <li>Pencarian berdasarkan kategori.</li>
                <li>Filter genre populer.</li>
                <li>Pencarian real-time.</li>
              </ul>
              <p><strong>Kategori Populer yang tersedia:</strong></p>
              <div className="about-categories-grid">
                {categories.map((cat, idx) => (
                  <div key={idx} className="about-category-tag">{cat}</div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 7: Fitur Library */}
          <section className="about-section">
            <div className="about-section-header">
              <Library size={22} />
              <h2>Fitur Library</h2>
            </div>
            <div className="about-card">
              <p>Library merupakan tempat penyimpanan buku yang pernah dibaca maupun yang ingin dibaca nanti. Terdiri dari:</p>
              <ul className="about-list">
                <li><Heart size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Favorit Saya</li>
                <li><BookOpen size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Bacaan Terakhir</li>
                <li><Library size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Riwayat Membaca</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Fitur Profil */}
          <section className="about-section">
            <div className="about-section-header">
              <User size={22} />
              <h2>Fitur Profil</h2>
            </div>
            <div className="about-card">
              <p>Halaman profil digunakan untuk melihat informasi akun pengguna, yang menampilkan:</p>
              <ul className="about-list">
                <li>Foto Profil</li>
                <li>Nama Pengguna</li>
                <li>Email</li>
                <li>Status Akun (USER / ADMIN)</li>
                <li>Tanggal Bergabung</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Fitur Multi Bahasa */}
          <section className="about-section">
            <div className="about-section-header">
              <Globe size={22} />
              <h2>Fitur Multi Bahasa</h2>
            </div>
            <div className="about-card">
              <p>ElysiaApp menyediakan fitur pergantian bahasa untuk meningkatkan kenyamanan pengguna. Bahasa yang didukung meliputi:</p>
              <div className="about-languages-grid">
                {languages.map((lang, idx) => (
                  <div key={idx} className="about-language-card">{lang}</div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 10: Kesimpulan */}
          <section className="about-section">
            <div className="about-section-header">
              <Sparkles size={22} />
              <h2>Kesimpulan</h2>
            </div>
            <div className="about-card about-conclusion">
              <p>
                ElysiaApp adalah website perpustakaan digital berbasis web yang memiliki tampilan sederhana, modern, dan
                menarik dengan dominasi warna pink pastel. Website ini menyediakan fitur login, register,
                pencarian buku, perpustakaan pribadi, notifikasi, profil pengguna, serta dukungan multi bahasa sehingga
                mampu memberikan pengalaman membaca digital yang nyaman dan mudah digunakan.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="about-footer">
            &copy; 2026 ElysiaApp Digital Library
          </footer>
        </div>
      </div>
    </AdminLayout>
  )
}
