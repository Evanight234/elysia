import { db } from "../../db";
import { Likes, books } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";

export const toggleLike = async (userId: string, bookId: string) => {
    const [deleted] = await db
        .delete(Likes)
        .where(and(eq(Likes.userId, userId), eq(Likes.bookId, bookId)))
        .returning()

    if (deleted) {
        await db.update(books)
            .set({ likeCount: sql`${books.likeCount} - 1` })
            .where(eq(books.id, bookId))
        return { liked: false }
    }

    await db.insert(Likes).values({ userId, bookId })
    await db.update(books)
        .set({ likeCount: sql`${books.likeCount} + 1` })
        .where(eq(books.id, bookId))
    return { liked: true }
}

export const checkIsLiked = async (userId: string, bookId: string) => {
    const [item] = await db
        .select()
        .from(Likes)
        .where(and(eq(Likes.userId, userId), eq(Likes.bookId, bookId)))
    return !!item
}
