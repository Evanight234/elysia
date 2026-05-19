import { createContext, useContext, useState, useCallback } from 'react'
import ToastContainer from '../components/ui/Toast'
import type { ToastItem, ToastType } from '../components/ui/Toast'

interface ToastContextType {
    toast: {
        success: (title: string, message?: string) => void
        error: (title: string, message?: string) => void
        warning: (title: string, message?: string) => void
        info: (title: string, message?: string) => void
    }
}

const ToastContext = createContext<ToastContextType | null>(null)

let idCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const addToast = useCallback((
        type: ToastType,
        title: string,
        message?: string,
        duration?: number
    ) => {
        const id = `toast-${++idCounter}`
        setToasts(prev => [...prev, { id, type, title, message, duration }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (title: string, message?: string) => addToast('success', title, message),
        error: (title: string, message?: string) => addToast('error', title, message),
        warning: (title: string, message?: string) => addToast('warning', title, message),
        info: (title: string, message?: string) => addToast('info', title, message),
    }

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToastContext() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToastContext harus dipakai di dalam ToastProvider')
    return ctx
}