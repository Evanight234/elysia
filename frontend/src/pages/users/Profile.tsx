import { useState, useRef } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import './UserPages.css';
import { User as UserIcon, Camera, Loader2, Check, X, File } from 'lucide-react';
import api from '../../api/axios';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "username": "user123", "email": "user@example.com", "createdAt": "createdAt"}');
  const [avatar, setAvatar] = useState<string>(user.avatar || '')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return


    //validasi type file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('format harus jpeg, jpg, png, atau webp')
      return
    }
    //ukuran file maksimal 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 2MB.')
      return
    }
    setUploadError('')
    setSelectedFile(file)
    setUploadSuccess(false)

    // buat priview url buat untuk ditampikan sebelum di upload
    const render = new FileReader()
    render.onloadend = () => {
      setPreviewUrl(render.result as string)
    }
    render.readAsDataURL(file)
  }
  //upload ke backend
  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      // PUT /profile/avatar → backend simpan file & return URL
      const res = await api.put('profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/formData' },
      })
      const newAvatarUrl = res.data.data.avatar

      // Update state & localStorage supaya langsung tampil
      setAvatar(newAvatarUrl)
      setPreviewUrl('')
      setSelectedFile(null)
      setUploadSuccess(true)

      // Update user di localStorage
      const updateUser = { ...user, avatar: newAvatarUrl }
      localStorage.setItem('user', JSON.stringify(updateUser))

      //reset succes setelah 3 detik
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message || 'Gagal mengupload foto. Coba lagi.'
      )
    } finally {
      setUploading(false)
    }
  }

  //batal pilih foto
  const handleCancel = () => {
    setPreviewUrl('')
    setSelectedFile(null)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const displayPhoto = previewUrl || avatar

  return (
    <UserLayout>
      <div className="page-header">
        <h1>Profil {user.username}</h1>
        <p>Data diri dan informasi akun {user.username} yang terdaftar.</p>
      </div>
      <div className="profile-card">
        <div className='profile-avatar-wrapper'>
          <div className="profile-avatar-large">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt='Foto Profile'
                className='avatar-profilr-img' />
            ) : (
              <UserIcon size={64} />
            )}
          </div>
          <button className="profile-camera-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Ganti foto profil"
            disabled={uploading}
          >
            <Camera size={16} />
          </button>
          {/*input file tersembunyi */}
          <input type="file" ref={fileInputRef} accept='image/jpeg,image/jpg,image/png,image/webp' onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        {/* priview tombol aksi */}
        {selectedFile && (
          <div className='profile-upload-action'>
            <p className='upload-filename'>{selectedFile.name}</p>

            <div className='upload-btn-grup'>
              <button className='btn-upload-save' onClick={handleUpload} disabled={uploading}>
                {uploading
                  ? <>< Loader2 size={15} className='spin' /> mengupload.... </>
                  : <><Check size={15} /> Simpan Foto</>}
              </button>
              <button className='btn-upload-cancel' onClick={handleCancel} disabled={uploading}>
                <X size={15} /> Batal
              </button>
            </div>
          </div>
        )}
        {uploadError && (
          <div className="upload-error">
            {uploadError}
          </div>
        )}
        {uploadSuccess && (
          <div className="upload-success">
            ✓ Foto profil berhasil diperbarui!
          </div>
        )}

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
            <span className="detail-value">{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bergabung Pada</span>
            <span className="detail-value">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Baru saja'}
            </span>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
