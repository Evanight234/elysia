import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToastContext } from '../../context/ToastContext'
import AdminLayout from './adminLayout'
import { User as UserIcon, Camera, Loader2, Check, X } from 'lucide-react'
import api from '../../api/axios'
import './AdminPage.css'

export default function AdminProfile() {
    const { t } = useTranslation()
    const { toast } = useToastContext()
    const user = JSON.parse(
        localStorage.getItem('user') ||
        '{"name":"Admin","username":"admin","email":"admin@elysiaapp.com","createdAt":"","role":"ADMIN"}'
    )

    // ── Key avatar unik per email (tidak hilang saat logout) ──
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

    // ── Pilih file ─────────────────────────────────────────
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

    // ── Upload ke backend ──────────────────────────────────
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

            // Simpan di key tersendiri supaya tidak hilang saat logout
            localStorage.setItem(avatarKey, newAvatarUrl)

            // Update localStorage user juga
            const updatedUser = { ...user, avatar: newAvatarUrl }
            localStorage.setItem('user', JSON.stringify(updatedUser))

            setAvatar(newAvatarUrl)
            setPreviewUrl('')
            setSelectedFile(null)
            setUploadSuccess(true)
            toast.success(t('profile.uploadSuccess'))
            setTimeout(() => setUploadSuccess(false), 3000)
        } catch (err: any) {
            const msg = err.response?.data?.message || t('profile.uploadError')
            setUploadError(msg)
            toast.error(msg)
        } finally {
            setUploading(false)
        }
    }

    // ── Batal ──────────────────────────────────────────────
    const handleCancel = () => {
        setPreviewUrl('')
        setSelectedFile(null)
        setUploadError('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const displayPhoto = previewUrl || avatar

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>{t('admin.profileTitle')}</h1>
                <p>{t('admin.profileSub')}</p>
            </div>

            {/* Card terpusat */}
            <div className="admin-profile-center">
                <div className="admin-profile-card">

                    {/* ── Avatar + tombol kamera ── */}
                    <div className="admin-avatar-wrapper">
                        <div className="admin-avatar-circle">
                            {displayPhoto ? (
                                <img
                                    src={displayPhoto}
                                    alt="Foto Profil"
                                    className="admin-avatar-img"
                                />
                            ) : (
                                <UserIcon size={64} />
                            )}
                        </div>
                        <button
                            className="admin-camera-btn"
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

                    {/* ── Preview & tombol aksi ── */}
                    {selectedFile && (
                        <div className="admin-upload-actions">
                            <p className="admin-upload-filename">📎 {selectedFile.name}</p>
                            <div className="admin-upload-btns">
                                <button
                                    className="admin-btn-save"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading
                                        ? <><Loader2 size={14} className="spin" /> {t('profile.uploading')}</>
                                        : <><Check size={14} /> {t('profile.savePhoto')}</>
                                    }
                                </button>
                                <button
                                    className="admin-btn-cancel-upload"
                                    onClick={handleCancel}
                                    disabled={uploading}
                                >
                                    <X size={14} /> {t('profile.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Pesan error/sukses */}
                    {uploadError && <div className="admin-upload-error">{uploadError}</div>}
                    {uploadSuccess && <div className="admin-upload-success">✓ {t('profile.uploadSuccess')}</div>}

                    {/* ── Nama & username ── */}
                    <div className="admin-profile-identity">
                        <h2>{user.name}</h2>
                        <span className="admin-profile-username">@{user.username || 'admin'}</span>
                        <span className="admin-role-badge">🛡️ {t('settings.admin')}</span>
                    </div>

                    {/* ── Detail akun ── */}
                    <div className="admin-profile-details">
                        {[
                            { label: t('profile.email'), value: user.email },
                            { label: t('profile.status'), value: user.role },
                            {
                                label: t('profile.joined'),
                                value: user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })
                                    : 'Baru saja'
                            },
                        ].map(({ label, value }) => (
                            <div key={label} className="admin-detail-item">
                                <span className="admin-detail-label">{label}</span>
                                <span className="admin-detail-value">{value}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}