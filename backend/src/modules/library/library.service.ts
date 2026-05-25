import { db } from "../../db";
import { library, books } from "../../db/schema";
import { eq, and, count } from "drizzle-orm";

export const getUserLibrary = async (userId: string, status?: string, page: number = 1, limit: number = 20) => {
    const conditions = [eq(library.userId, userId)]
    if (status) conditions.push(eq(library.status, status as any))

    const where = and(...conditions)

    const [countResult, data] = await Promise.all([
        db.select({ total: count() }).from(library).where(where),
        db
            .select({
                id: library.id,
                status: library.status,
                lastChapterRead: library.lastChapterRead,
                addedAt: library.addedAt,
                book: {
                    id: books.id,
                    title: books.title,
                    author: books.author,
                    cover: books.cover,
                    category: books.category,
                    description: books.description,
                },
            })
            .from(library)
            .innerJoin(books, eq(library.bookId, books.id))
            .where(where)
            .orderBy(library.addedAt)
            .limit(limit)
            .offset((page - 1) * limit)
    ])

    const total = Number(countResult[0]?.total || 0)

    return {
        items: data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }
}

// Tambah atau Update buku di library
export const addToLibrary = async (userId: string, bookId: string, status: 'SAVED' | 'FAVORITE' | 'READING') => {
    const [item] = await db
        .insert(library)
        .values({ userId, bookId, status })
        .onConflictDoUpdate({
            target: [library.userId, library.bookId],
            set: { status }
        })
        .returning()
    return item
}

// Hapus buku dari library
export const removeFromLibrary = async (userId: string, libraryId: string) => {
    const [item] = await db
        .delete(library)
        .where(and(eq(library.id, libraryId), eq(library.userId, userId)))
        .returning()

    if (!item) throw new Error('Item tidak ditemukan')
    return item
}

// Update chapter terakhir dibaca
export const updateLastChapter = async (userId: string, bookId: string, chapterNum: number) => {
    const [item] = await db
        .insert(library)
        .values({ userId, bookId, status: 'READING', lastChapterRead: chapterNum })
        .onConflictDoUpdate({
            target: [library.userId, library.bookId],
            set: { lastChapterRead: chapterNum }
        })
        .returning()
    return item
}