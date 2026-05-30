import { useState, useRef, useEffect } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { User as UserIcon, Camera, Loader2, Check, X } from 'lucide-react';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../../context/ToastContext';
import { useSidebarState } from '../../hooks/useSidebarState';

export default function Profile() {
  const { t } = useTranslation();
  const { toast } = useToastContext();
  const { sidebarClass } = useSidebarState();
  const user = JSON.parse(
    localStorage.getItem('user') ||
    '{"name":"User","username":"user123","email":"user@example.com","createdAt":"","role":"USER"}'
  )

  // ── Avatar: ambil dari key tersendiri pakai email sebagai key unik ──
  // Key: "avatar_<email>" → tidak ikut terhapus saat logout
  const avatarKey = `avatar_${user.email}`

  const [avatar, setAvatar] = useState<string>(
    localStorage.getItem(avatarKey) || user.avatar || ''
  )
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError(t('profile.formatUploadError'))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError(t('profile.sizeUploadError'))
      return
    }

    setUploadError('')
    setSelectedFile(file)
    setUploadSuccess(false)

    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const res = await api.put('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newAvatarUrl = res.data.data.avatar

      // ── Simpan avatar di key TERSENDIRI pakai email ──────
      // Key ini TIDAK akan terhapus saat logout
      localStorage.setItem(avatarKey, newAvatarUrl)

      // Update state user di localStorage juga (opsional, untuk sesi ini)
      const updatedUser = { ...user, avatar: newAvatarUrl }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setAvatar(newAvatarUrl)
      setPreviewUrl('')
      setSelectedFile(null)
      setUploadSuccess(true)
      toast.success(t('profile.uploadSuccess'))
      setTimeout(() => setUploadSuccess(false), 3000)

    } catch (error: any) {
      const msg = error.response?.data?.message || t('profile.uploadError')
      setUploadError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl('')
    setSelectedFile(null)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const displayPhoto = previewUrl || avatar

  // Add wallpaper class on mount
  useEffect(() => {
    document.body.classList.add('home-wallpaper-active')
    return () => {
      document.body.classList.remove('home-wallpaper-active')
    }
  }, [])

  return (
    <UserLayout>
      <div className={`user-page-container ${sidebarClass}`}>
      <div className="page-header">
        <h1>{t('profile.title')} {user.username}</h1>
        <p>{t('profile.subtitle')} {user.username} {t('profile.subtitle2')}</p>
      </div>

      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-large">
            {displayPhoto ? (
              <img src={displayPhoto} alt="Foto Profil" className="profile-avatar-img" />
            ) : (
              <UserIcon size={64} />
            )}
          </div>
          <button
            className="profile-camera-btn"
            onClick={() => fileInputRef.current?.click()}
            title={t('profile.changePhoto')}
            disabled={uploading}
          >
            <Camera size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Preview & tombol aksi */}
        {selectedFile && (
          <div className="profile-upload-actions">
            <p className="upload-filename">📎 {selectedFile.name}</p>
            <div className="upload-btn-group">
              <button className="btn-upload-save" onClick={handleUpload} disabled={uploading}>
                {uploading
                  ? <><Loader2 size={15} className="spin" /> {t('profile.uploading')}</>
                  : <><Check size={15} /> {t('profile.savePhoto')}</>
                }
              </button>
              <button className="btn-upload-cancel" onClick={handleCancel} disabled={uploading}>
                <X size={15} /> {t('profile.cancel')}
              </button>
            </div>
          </div>
        )}

        {uploadError && <div className="upload-error">{uploadError}</div>}
        {uploadSuccess && <div className="upload-success">✓{t('profile.uploadSuccess')}</div>}

        <div className="profile-info">
          <h2>{user.name}</h2>
          <span className="username">@{user.username}</span>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">{t('profile.email')}</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('profile.status')}</span>
            <span className="detail-value">{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('profile.joined')}</span>
            <span className="detail-value">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString(t('lang'), {
                  year: 'numeric', month: 'long', day: 'numeric'
                })
                : t('timeAgo.justNow')}
            </span>
          </div>
        </div>
      </div>
      </div>
    </UserLayout>
  )
}