import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { User as UserIcon } from 'lucide-react';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com"}');

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Profil Saya</h1>
        <p>Data diri dan informasi akun kamu.</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">
          <UserIcon size={64} />
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <span className="username">@{user.username}</span>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Alamat Email</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status Akun</span>
            <span className="detail-value">Aktif (User)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bergabung Pada</span>
            <span className="detail-value">Mei 2026</span>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
