import React from 'react';
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { Mail, Info } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    { id: 1, type: 'novel', title: 'Novel Baru!', message: 'Novel "The Pink Adventure" baru saja ditambahkan ke koleksi.', time: '2 jam yang lalu' },
    { id: 2, type: 'admin', title: 'Pesan Admin', message: 'Selamat datang di Elysia App! Nikmati koleksi buku digital kami.', time: '1 hari yang lalu' },
  ];

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Notifikasi</h1>
        <p>Terima pesan tentang novel terbaru dan pemberitahuan admin.</p>
      </div>

      <div className="notif-list">
        {notifications.map(notif => (
          <div key={notif.id} className="notif-card">
            <div className="notif-icon">
              {notif.type === 'novel' ? <Mail size={20} /> : <Info size={20} />}
            </div>
            <div className="notif-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <div className="notif-time">{notif.time}</div>
            </div>
          </div>
        ))}
      </div>
    </UserLayout>
  );
}
