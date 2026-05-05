import { Query } from "@neondatabase/serverless";
import { db } from "../../db";
import { books } from "../../db/schema";
import { eq, ilike, or, Or } from "drizzle-orm";
import type { NewBook } from '../../db/schema'

export const getAllBooks = async () => {
    return await db.select().from(books).orderBy(books.createdAt)
}

export const searchBooks = async () => {
    return await db
        .select()
        .from(books)
        .where(
            or(
                ilike(books.title, `%${Query}%`),
                ilike(books.author, `%${Query}%`),
                ilike(books.category, `%${Query}%`)
            )
        )
}
// tambah buku baru admin only
export const createBook = async (data: NewBook) => {
    const [book] = await db.insert(books).values(data).returning()
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
