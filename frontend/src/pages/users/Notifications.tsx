import { useState, useEffect, useRef } from 'react'
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { Mail, Info, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../../context/ToastContext';


interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Notifications() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { toast } = useToastContext();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (p: number = 1) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true);
      const res = await api.get('/notifications', {
        params: { page: p, limit: 5 },
        signal: controller.signal,
      });
      if (controller.signal.aborted) return
      setNotifications(res.data.data.items || []);
      setPagination(res.data.data.pagination || null);
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Gagal mengambil notifikasi:', error);
      }
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
      toast.error(t('notifications.loading'));
    }
  };

  // Tandai semua notifikasi sebagai dibaca → simpan ke database
  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Gagal menandai semua notifikasi:', error);
      toast.error(t('notifications.loading'));
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || (pagination && pageNumber > pagination.totalPages)) return
    setPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    if (!pagination) return []
    const { page, totalPages } = pagination
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Format waktu relatif
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('timeAgo.justNow');
    if (minutes < 60) return t('timeAgo.minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('timeAgo.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('timeAgo.daysAgo', { count: days });
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
          <>
            {notifications.map(notif => (
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
            ))}
            {pagination && pagination.total > 0 && pagination.totalPages >= 1 && (
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
          </>
        )}
      </div>
    </UserLayout>
  );
}
