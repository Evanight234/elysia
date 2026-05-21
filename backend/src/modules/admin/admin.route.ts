import { Elysia } from 'elysia'
import { adminOnly } from '../../middleware/role.middleware'
import { db } from '../../db'
import { users, notifications } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { successResponse, errorResponse } from '../../utils/response'

export const adminRoute = new Elysia({ prefix: '/admin' })
    .use(adminOnly)

    // GET /admin/users → semua user
    .get('/users', async ({ set }) => {
        try {
            const data = await db
                .select({
                    id: users.id,
                    name: users.name,
                    username: users.username,
                    email: users.email,
                    role: users.role,
                    createdAt: users.createdAt,
                })
                .from(users)
                .orderBy(users.createdAt)
            return successResponse(data)
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })

    // GET /admin/notifications → semua notifikasi yang pernah dikirim (history admin)
    .get('/notifications', async ({ set }) => {
        try {
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
                .orderBy(desc(notifications.createdAt))

            return successResponse(data)
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })

    // DELETE /admin/users/:id → hapus user dari DB
    .delete('/users/:id', async ({ params, set }) => {
        try {
            const [deleted] = await db
                .delete(users)
                .where(eq(users.id, params.id))
                .returning()
            if (!deleted) {
                set.status = 404
                return errorResponse('User tidak ditemukan')
            }
            return successResponse(deleted, 'User berhasil dihapus')
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })