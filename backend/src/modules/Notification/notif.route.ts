import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { adminOnly } from '../../middleware/role.middleware'
import { getUserNotifications, sendNotification, markAsRead, markAllAsRead } from './notif.service'
import { successResponse, errorResponse } from '../../utils/response'
import { db } from '../../db'
import { notifications, users } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export const notifRoute = new Elysia({ prefix: '/notifications' })

    // User: lihat notifikasi sendiri
    .use(authMiddleware)
    .get('/', async ({ user, set }) => {
        try {
            const data = await getUserNotifications(user.id)
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    // User: tandai satu notifikasi dibaca
    .patch('/:id/read', async ({ user, params, set }) => {
        try {
            const data = await markAsRead(user.id, params.id)
            return successResponse(data, 'Notifikasi ditandai sudah dibaca')
        } catch (error: any) {
            set.status = 404
            return errorResponse(error.message)
        }
    })

    // User: tandai semua notifikasi dibaca
    .patch('/read-all', async ({ user, set }) => {
        try {
            const data = await markAllAsRead(user.id)
            return successResponse(data, 'Semua notifikasi ditandai sudah dibaca')
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    // Admin: kirim notifikasi
    .use(adminOnly)
    .post(
        '/',
        async ({ body, set }) => {
            try {
                const data = await sendNotification({
                    userId: body.userId,
                    title: body.title,
                    massege: body.message,
                })
                set.status = 201
                return successResponse(data, 'Notifikasi berhasil dikirim')
            } catch (error: any) {
                set.status = 400
                return errorResponse(error.message)
            }
        },
        {
            body: t.Object({
                userId: t.String(),
                title: t.String(),
                message: t.String(),
            }),
        }
    )
    .get('/notifications', async ({ set }) => {
        try {
            // Ambil semua notifikasi + join dengan data user penerima
            const data = await db
                .select({
                    id: notifications.id,
                    userId: notifications.userId,
                    title: notifications.title,
                    message: notifications.message,
                    isRead: notifications.isRead,
                    createdAt: notifications.createdAt,
                    user: {
                        name: users.name,
                        username: users.username,
                        email: users.email,
                    }
                })
                .from(notifications)
                .leftJoin(users, eq(notifications.userId, users.id))
                .orderBy(desc(notifications.createdAt))  // terbaru dulu

            return successResponse(data)
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })