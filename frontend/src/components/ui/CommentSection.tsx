import { useState } from 'react'
import { X, Send } from 'lucide-react'
import './CommentSection.css'

// ── Fungsi: Tampilkan komentar per paragraf
// Dipanggil dari ReadChapter saat user klik badge angka di paragraf

interface Comment {
    id: number
    user: string
    avatar: string
    text: string
    time: string
}

interface Props {
    paragraphId: number
    chapterId: string
<<<<<<< HEAD
=======

>>>>>>> 8776d14 (oke)
    onClose: () => void
}

export default function CommentSection({ paragraphId, chapterId, onClose }: Props) {
    const [newComment, setNewComment] = useState('')

    // TODO: Fetch comments using chapterId: ${chapterId} and paragraphId: ${paragraphId}
    const comments: Comment[] = [
        { id: 1, user: 'PinkReader', avatar: 'P', text: 'Kalimat pembuka yang sangat kuat!', time: '2 jam lalu' },
        { id: 2, user: 'ElysiaFan', avatar: 'E', text: 'Ini langsung bikin penasaran banget.', time: '5 jam lalu' },
        { id: 3, user: 'BookLover99', avatar: 'B', text: 'Nulis kutipan ini di notes aku hehe.', time: '1 hari lalu' },
    ]

    const handleSubmit = () => {
        if (!newComment.trim()) return
        // TODO: POST /chapters/:chapterId/paragraphs/:paragraphId/comments
        // { text: newComment }
        setNewComment('')
    }

    return (
        <div className="comment-panel">
            {/* Header */}
            <div className="comment-panel-header">
                <span>Komentar Paragraf</span>
                <button onClick={onClose}><X size={16} /></button>
            </div>

            {/* List komentar */}
            <div className="comment-list">
                {comments.map(c => (
                    <div key={c.id} className="comment-item">
                        <div className="comment-avatar">{c.avatar}</div>
                        <div className="comment-body">
                            <div className="comment-meta">
                                <span className="comment-user">{c.user}</span>
                                <span className="comment-time">{c.time}</span>
                            </div>
                            <p className="comment-text">{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input komentar baru */}
            <div className="comment-input-row">
                <input
                    type="text"
                    placeholder="Tulis komentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button onClick={handleSubmit} disabled={!newComment.trim()}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}