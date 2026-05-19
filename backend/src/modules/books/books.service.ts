import { db } from "../../db";
import { books } from "../../db/schema";
import { eq, ilike, or, and, count, sum, sql } from "drizzle-orm";
import type { NewBook } from '../../db/schema'

import { chapters } from "../../db/schema/chapter";

import { checkIsLiked } from './likes.service'
export { toggleLike } from './likes.service'

export const getAllBooks = async () => {
    return await db.select().from(books).orderBy(books.createdAt)
}

export const getBookById = async (id: string, userId?: string) => {
    const [book] = await db.select().from(books).where(eq(books.id, id))
    if (!book) return null

    const bookChapters = await db.select().from(chapters).where(eq(chapters.bookId, id)).orderBy(chapters.number)

    let isLiked = false
    if (userId) {
        isLiked = await checkIsLiked(userId, id)
    }

    return {
        ...book,
        chapters: bookChapters,
        isLiked
    }
}

export const searchBooks = async (query: string) => {
    return await db
        .select()
        .from(books)
        .where(
            or(
                ilike(books.title, `%${query}%`),
                ilike(books.author, `%${query}%`),
                ilike(books.category, `%${query}%`)
            )
        )
}
// tambah buku baru admin only — ID sequential: book-1, book-2, dst
export const createBook = async (data: Omit<NewBook, 'id'>) => {
    // Ambil semua ID yang formatnya book-N untuk cari nomor terbesar
    const allBooks = await db.select({ id: books.id }).from(books)
    const maxNum = allBooks.reduce((max, b) => {
        const match = b.id.match(/^book-(\d+)$/)
        if (match) {
            const num = parseInt(match[1], 10)
            return num > max ? num : max
        }
        return max
    }, 0)

    const newId = `book-${maxNum + 1}`
    const [book] = await db.insert(books).values({ ...data, id: newId }).returning()
    return book
}

// update buku by id admin only
export const updateBook = async (id: string, data: NewBook) => {
    const [book] = await db.update(books).set(data).where(eq(books.id, id)).returning()


    if (!book) {
        throw new Error('Book not found')
    }
    return book
}

//hapus buku admin only
export const deleteBook = async (id: string) => {
    const [book] = await db.delete(books).where(eq(books.id, id)).returning()

    if (!book) {
        throw new Error('Book not found')
    }
    return book
}

export const getChapterByNumber = async (bookId: string, chapterNum: number) => {
    const [chapterData] = await db
        .select()
        .from(chapters)
        .where(and(eq(chapters.bookId, bookId), eq(chapters.number, chapterNum)))

    if (!chapterData) return null

    // Split content into paragraphs for the frontend
    const paragraphs = chapterData.content.split('\n').filter(p => p.trim() !== '').map((text, index) => ({
        id: index + 1,
        text,
        comments: 0 // Placeholder
    }))

    return {
        ...chapterData,
        paragraphs,
        totalComments: 0 // Placeholder
    }
}

// ── ADMIN ONLY ────────────────────────────────────────────────────────────

// Statistik agregat buku untuk dashboard admin
export const getAdminBookStats = async () => {
    const [stats] = await db
        .select({
            totalBooks: count(books.id),
            totalViews: sum(books.viewCount),
            totalLikes: sum(books.likeCount),
        })
        .from(books)

    const categoryRows = await db
        .select({
            category: books.category,
            count: count(books.id),
        })
        .from(books)
        .groupBy(books.category)
        .orderBy(sql`count(${books.id}) desc`)

    return {
        totalBooks: Number(stats?.totalBooks ?? 0),
        totalViews: Number(stats?.totalViews ?? 0),
        totalLikes: Number(stats?.totalLikes ?? 0),
        byCategory: categoryRows,
    }
}

// Filter buku berdasarkan kategori (admin)
export const getBooksByCategory = async (category: string) => {
    return await db
        .select()
        .from(books)
        .where(ilike(books.category, category))
        .orderBy(books.createdAt)
}
