import React from 'react';
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  return (
    <UserLayout>
      <div className="page-header">
        <h1>Cari Buku</h1>
        <p>Temukan judul atau kategori buku yang ingin kamu baca.</p>
      </div>

      <div className="search-container">
        <div className="search-box-large">
          <SearchIcon size={24} />
          <input type="text" placeholder="Masukkan judul buku atau kategori..." />
          <button className="btn-search-main">Cari</button>
        </div>
      </div>

      <div className="categories-section">
        <h2 className="section-title">Kategori Populer</h2>
        <div className="category-tags">
          {['Fiksi', 'Romansa', 'Teknologi', 'Sejarah', 'Komik', 'Biografi'].map(cat => (
            <button key={cat} className="category-tag">{cat}</button>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
