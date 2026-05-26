import AdminLayout from './AdminLayout'
import { Search as SearchIcon, BookOpen } from 'lucide-react'
import { useState } from 'react'
import api from '../../api/axios'
import './AdminPage.css'
import { useTranslation } from 'react-i18next'

interface Book {
    id: string
    title: string
    author: string
    cover: string | null
    category: string
}

export default function AdminSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Book[]>([])
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation()

    const handleSearch = async () => {
        if (!query.trim()) return
        try {
            setLoading(true)
            const res = await api.get(`/books/search?q=${query}`)
            setResults(res.data.data || [])
        } catch (err) {
            console.error('Search failed:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>{t('admin.searchTitle')}</h1>
                <p>{t('admin.searchSub')}</p>
            </div>

            <div className="admin-search-box">
                <SearchIcon size={20} color="#d1a0b8" />
                <input
                    type="text"
                    placeholder={t('admin.searchPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    className="btn-admin-search"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? t('admin.searchLoading') : t('admin.searchBtn')}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.map(book => (
                    <div key={book.id} className="admin-book-result">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="admin-book-cover-sm">
                                {book.cover ? (
                                    <img src={book.cover} alt={book.title} />
                                ) : (
                                    book.title[0]
                                )}
                            </div>
                            <div className="admin-book-info">
                                <div className="admin-book-title">{book.title}</div>
                                <div className="admin-book-author">{book.author}</div>
                                <div className="admin-book-category">{book.category}</div>
                            </div>
                        </div>
                        <button className="btn-add-rec" style={{ background: '#fce7f3', color: '#be185d' }}>
                            <BookOpen size={16} /> {t('admin.searchDetail')}
                        </button>
                    </div>
                ))}

                {query && results.length === 0 && !loading && (
                    <div className="admin-empty">
                        {t('admin.searchNoResult')} "{query}"
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
