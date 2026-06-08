import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'
import './LanguageSwitcher.css'

// NOTE: Add new languages here and keep the codes in sync with i18n/index.ts
const languages = [
    { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { code: 'cn', label: 'Chinese', flag: '🇨🇳' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' },
    { code: 'jv', label: 'Javanese', flag: '🇮🇩' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'ko', label: 'Korean', flag: '🇰🇷' },
    { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
    { code: 'ms', label: 'Malay', flag: '🇲🇾' },
    { code: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
    { code: 'pl', label: 'Polish', flag: '🇵🇱' },
    { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
    { code: 'it', label: 'Italian', flag: '🇮🇹' },
    { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', label: 'Thai', flag: '🇹🇭' },
    { code: 'cs', label: 'Czech', flag: '🇨🇿' },
    { code: 'da', label: 'Danish', flag: '🇩🇰' },
    { code: 'ga', label: 'Irish', flag: '🇮🇪' }
    ,{ code: 'bg', label: 'Bulgarian', flag: '🇧🇬' }
]

export default function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const current = languages.find(l => l.code === i18n.language) || languages[0]

    const handleChange = (code: string) => {
        i18n.changeLanguage(code)
        localStorage.setItem('elysiaapp_lang', code)
        setOpen(false)
    }

    return (
        <div className="lang-dropdown" ref={ref}>
            {/* Tombol trigger */}
            <button
                className="lang-trigger"
                onClick={() => setOpen(v => !v)}
                title="Ganti Bahasa"
            >
                <Globe size={16} />
                <span className="lang-trigger-flag">{current.flag}</span>
                <span className="lang-trigger-label">{current.label}</span>
                <ChevronDown
                    size={14}
                    className={`lang-chevron ${open ? 'open' : ''}`}
                />
            </button>

            {/* Dropdown list */}
            {open && (
                <div className="lang-menu">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                            onClick={() => handleChange(lang.code)}
                        >
                            <span className="lang-option-flag">{lang.flag}</span>
                            <span className="lang-option-label">{lang.label}</span>
                            {i18n.language === lang.code && (
                                <span className="lang-option-check">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}