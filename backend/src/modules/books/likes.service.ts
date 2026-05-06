import { db } from "../../db";
import { Likes, books } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";

export const toggleLike = async (userId: string, bookId: string) => {
    const [existing] = await db
        .select()
        .from(Likes)
        .where(and(eq(Likes.userId, userId), eq(Likes.bookId, bookId)))

    if (existing) {
        // Unlike
        await db.delete(Likes).where(eq(Likes.id, existing.id))
        // Decrement like count
        await db.update(books)
            .set({ likeCount: sql`${books.likeCount} - 1` })
            .where(eq(books.id, bookId))
        return { liked: false }
    } else {
        // Like
        await db.insert(Likes).values({ userId, bookId })
        // Increment like count
        await db.update(books)
            .set({ likeCount: sql`${books.likeCount} + 1` })
            .where(eq(books.id, bookId))
        return { liked: true }
    }
}

export const checkIsLiked = async (userId: string, bookId: string) => {
    const [item] = await db
        .select()
        .from(Likes)
        .where(and(eq(Likes.userId, userId), eq(Likes.bookId, bookId)))
    return !!item
}
