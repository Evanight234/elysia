import { status } from "elysia";
import { db } from "../../db";
import { library, books } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export const getUserLibrary = async (userId: string) => {
    return await db
        .select({
            id: library.id,
            status: library.status,
            lastChapterRead: library.lastChapterRead,
            addedAt: library.addedAt,
            book: books,
        })
        .from(library)
        .innerJoin(books, eq(library.bookId, books.id))
        .where(eq(library.userId, userId))
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