import { db } from "../../db";
import { books } from "../../db/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import type { NewBook } from '../../db/schema'

import { chapters } from "../../db/schema/chapter";

<<<<<<< HEAD
import { checkIsLiked } from './likes.service'
export { toggleLike } from './likes.service'

export const getAllBooks = async () => {
    return await db.select().from(books).orderBy(books.createdAt)
}

export const getBookById = async (id: string, userId?: string) => {
    const [book] = await db.select().from(books).where(eq(books.id, id))
=======
import { readingProgress } from "../../db/schema/readingProgres";
import { paragraphComments } from "../../db/schema/paragraphComments";
import { sql, count } from "drizzle-orm";

export const getAllBooks = async (userId?: string) => {
    const baseQuery = db.select({
        id: books.id,
        title: books.title,
        author: books.author,
        cover: books.cover,
        viewCount: books.viewCount,
        category: books.category,
        lastChapterNumber: chapters.number
    })
        .from(books)
        .leftJoin(readingProgress, sql`${books.id} = ${readingProgress.bookId} AND ${readingProgress.userId} = ${userId || ''}`)
        .leftJoin(chapters, eq(readingProgress.lastChapterId, chapters.id))
        .orderBy(books.createdAt);

    return await baseQuery;
}

export const getBookById = async (id: string, userId?: string) => {
    const [book] = await db.select({
        id: books.id,
        title: books.title,
        author: books.author,
        cover: books.cover,
        description: books.description,
        category: books.category,
        likeCount: books.likeCount,
        viewCount: books.viewCount,
        lastChapterNumber: chapters.number
    })
        .from(books)
        .leftJoin(readingProgress, sql`${books.id} = ${readingProgress.bookId} AND ${readingProgress.userId} = ${userId || ''}`)
        .leftJoin(chapters, eq(readingProgress.lastChapterId, chapters.id))
        .where(eq(books.id, id));

>>>>>>> 8776d14 (oke)
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

export const searchBooks = async (query: string, userId?: string) => {
    return await db
        .select({
            id: books.id,
            title: books.title,
            author: books.author,
            cover: books.cover,
            viewCount: books.viewCount,
            category: books.category,
            lastChapterNumber: chapters.number
        })
        .from(books)
        .leftJoin(readingProgress, sql`${books.id} = ${readingProgress.bookId} AND ${readingProgress.userId} = ${userId || ''}`)
        .leftJoin(chapters, eq(readingProgress.lastChapterId, chapters.id))
        .where(
            or(
                ilike(books.title, `%${query}%`),
                ilike(books.author, `%${query}%`),
                ilike(books.category, `%${query}%`)
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

<<<<<<< HEAD
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
=======
export const getChapterByNumber = async (bookId: string, chapterNumber: number) => {
    const [chapter] = await db
        .select()
        .from(chapters)
        .where(and(eq(chapters.bookId, bookId), eq(chapters.number, chapterNumber)))
    
    if (!chapter) return null

    // Fetch jumlah komentar per paragraf
    const commentCounts = await db
        .select({
            paragraphId: paragraphComments.paragraphId,
            count: count()
        })
        .from(paragraphComments)
        .where(eq(paragraphComments.chapterId, chapter.id))
        .groupBy(paragraphComments.paragraphId)

    // Transform content (string) menjadi array of paragraphs
    // Asumsi: paragraf dipisah oleh newline ( \n )
    const paragraphs = chapter.content.split('\n').filter(text => text.trim() !== '').map((text, index) => {
        const pId = index + 1
        const comm = commentCounts.find(c => c.paragraphId === pId)
        return {
            id: pId,
            text: text.trim(),
            comments: comm ? Number(comm.count) : 0
        }
    })

    return {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        paragraphs: paragraphs,
        totalComments: paragraphs.reduce((sum, p) => sum + p.comments, 0)
    }
}


>>>>>>> 8776d14 (oke)
