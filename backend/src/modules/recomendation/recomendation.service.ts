import { db } from '../../db'
import { recommendations, books } from '../../db/schema'
import { eq } from 'drizzle-orm'

// Ambil semua rekomendasi (untuk ditampilkan di Home user)
export const getRecommendations = async () => {
    return await db
        .select({
            id: recommendations.id,
            note: recommendations.note,
            createdAt: recommendations.createdAt,
            author: books.author,
            book: books,
        })
        .from(recommendations)
        .innerJoin(books, eq(recommendations.bookId, books.id))
        .orderBy(recommendations.createdAt)
}

// Admin tambah rekomendasi
export const addRecommendation = async (data: {
    bookId: string
    note?: string
}) => {
    const [rec] = await db.insert(recommendations).values(data).returning()
    return rec
}

// Admin hapus rekomendasi
export const removeRecommendation = async (id: string) => {
    const [rec] = await db
        .delete(recommendations)
        .where(eq(recommendations.id, id))
        .returning()

    if (!rec) throw new Error('Rekomendasi tidak ditemukan')
    return rec
}