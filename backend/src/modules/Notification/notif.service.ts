import { db } from '../../db'
import { notifications } from '../../db/schema/notifications'
import { eq, and, count } from 'drizzle-orm'

//ambil semua notifikasi user (tanpa pagination — legacy)
export const getUserNotifications = async (userId: string) => {
    return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(notifications.createdAt)
}

//ambil notifikasi user dengan pagination
export const getUserNotificationsPaginated = async (userId: string, page: number = 1, limit: number = 5) => {
    const offset = (page - 1) * limit

    const [countResult, data] = await Promise.all([
        db.select({ total: count() }).from(notifications).where(eq(notifications.userId, userId)),
        db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(notifications.createdAt)
            .limit(limit)
            .offset(offset)
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

//kirim notifikasi ke user tertentu (khusus role admin)
export const sendNotification = async (data: {
    userId: string;
    title: string;
    message: string;
}) => {
    const [notif] = await db.insert(notifications).values({
        userId: data.userId,
        title: data.title,
        message: data.message,
        isRead: false
    }).returning()
    return notif
}

//kirim notifikasi ke semua user (khusus role admin)
export const sendBroadcastNotification = async (data: {
    title: string;
    message: string;
}) => {
    const [notif] = await db.insert(notifications).values({
        userId: 'all',
        title: data.title,
        message: data.message
    }).returning()
    return notif
}

// Tandai notifikasi sudah dibaca
export const markAsRead = async (userId: string, notifId: string) => {
    const [notif] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notifId), eq(notifications.userId, userId)))
        .returning()

    if (!notif) throw new Error('Notifikasi tidak ditemukan')
    return notif
}

// Tandai semua notifikasi sudah dibaca
export const markAllAsRead = async (userId: string) => {
    const updated = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId))
        .returning()

    return updated
}

