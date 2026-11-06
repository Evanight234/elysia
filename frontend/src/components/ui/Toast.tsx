import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import './Toast.css'

// ─── Tipe ────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number   // ms, default 4000
}

interface ToastProps {
    toasts: ToastItem[]
    onRemove: (id: string) => void
}

// ─── Satu item toast ─────────────────────────────────────
function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
    const [leaving, setLeaving] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleClose = () => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setLeaving(true)
        setTimeout(() => onRemove(toast.id), 300)
    }

    useEffect(() => {
        const duration = toast.duration ?? 4000
        timerRef.current = setTimeout(() => handleClose(), duration)
        return () => clearTimeout(timerRef.current)
    }, [])

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />,
    }

    return (
        <div className={`toast-card toast-${toast.type} ${leaving ? 'toast-leaving' : ''}`}>
            {/* Progress bar */}
            <div
                className="toast-progress"
                style={{ animationDuration: `${toast.duration ?? 4000}ms` }}
            />

            {/* Icon */}
            <div className="toast-icon">
                {icons[toast.type]}
            </div>

            {/* Konten */}
            <div className="toast-content">
                <span className="toast-title">{toast.title}</span>
                {toast.message && (
                    <span className="toast-message">{toast.message}</span>
                )}
            </div>

            {/* Tombol tutup */}
            <button className="toast-close" onClick={handleClose}>
                <X size={14} />
            </button>
        </div>
    )
}

// ─── Container semua toast ───────────────────────────────
export default function ToastContainer({ toasts, onRemove }: ToastProps) {
    if (toasts.length === 0) return null

    return createPortal(
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>,
        document.body
    )
}