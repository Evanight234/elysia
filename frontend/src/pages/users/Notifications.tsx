import { useState, useEffect } from 'react'
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { Mail, Info, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';


interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Ambil notifikasi dari backend saat halaman dibuka
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tandai satu notifikasi sebagai dibaca → simpan ke database
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Gagal menandai notifikasi:', error);
    }
  };

  // Tandai semua notifikasi sebagai dibaca → simpan ke database
  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Gagal menandai semua notifikasi:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Format waktu relatif
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  };

  return (
    <UserLayout>
      <div className="page-header">
        <div className="notif-header-row">
          <div>
            <h1>{t('nav.notifications')} {user.username} {unreadCount > 0 && `(${unreadCount})`}</h1>
            <p>{t('notifications.subtitle')}</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={markAllRead}>
              {t('notifications.markAll')}
            </button>
          )}
        </div>
      </div>

      <div className="notif-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '0.5rem', color: '#999' }}>{t('notifications.loading')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <Info size={40} />
            <p style={{ marginTop: '0.5rem' }}>{t('notifications.empty')}</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`notif-card ${notif.isRead ? 'notif-read' : 'notif-unread'}`}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
            >
              <div className="notif-icon">
                <Mail size={20} />
              </div>
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <div className="notif-time">{timeAgo(notif.createdAt)}</div>
              </div>
              {!notif.isRead && <span className="notif-dot" />}
            </div>
          ))
        )}
      </div>
    </UserLayout>
  );
}
