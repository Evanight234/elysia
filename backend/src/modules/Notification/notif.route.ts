import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { adminOnly } from '../../middleware/role.middleware'
import { getUserNotifications, getUserNotificationsPaginated, sendNotification, markAsRead, markAllAsRead } from './notif.service'
import { successResponse, errorResponse } from '../../utils/response'
export const notifRoute = new Elysia({ prefix: '/notifications' })

    // User: lihat notifikasi sendiri
    .use(authMiddleware)
    .get('/', async ({ user, query, set }) => {
        try {
            if (query.page || query.limit) {
                const page = Number(query.page) || 1
                const limit = Number(query.limit) || 5
                const data = await getUserNotificationsPaginated(user.id, page, limit)
                return successResponse(data)
            }
            const data = await getUserNotifications(user.id)
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    }, {
        query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        })
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
                    message: body.message,
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
