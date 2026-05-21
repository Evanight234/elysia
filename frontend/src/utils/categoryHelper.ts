import i18n from '../i18n'

// Translate kategori dari value DB ke bahasa aktif
// Contoh: "Fantasy" → "ファンタジー" (saat bahasa JP)
export function translateCategory(category: string): string {
    const key = `category.${category}`
    const translated = i18n.t(key)
    // Kalau tidak ada terjemahan → tampilkan nilai asli
    return translated === key ? category : translated
}