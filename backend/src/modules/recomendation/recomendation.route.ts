import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { adminOnly } from '../../middleware/role.middleware'
import { getRecommendations, addRecommendation, removeRecommendation } from './recomendation.service'
import { successResponse, errorResponse, formatDbError } from '../../utils/response'

export const recommendationRoute = new Elysia({ prefix: '/recommendations' })

    // User: lihat rekomendasi di halaman Home
    .use(authMiddleware)
    .get('/', async ({ set }) => {
        try {
            const data = await getRecommendations()
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(formatDbError(error), 500)
        }
    })

    // Admin: kelola rekomendasi
    .use(adminOnly)
    .post(
        '/',
        async ({ body, set }) => {
            try {
                const data = await addRecommendation(body)
                set.status = 201
                return successResponse(data, 'Rekomendasi berhasil ditambahkan')
            } catch (error: any) {
                set.status = 400
                return errorResponse(formatDbError(error), 400)
            }
        },
        {
            body: t.Object({
                bookId: t.String(),
                note: t.Optional(t.String()),
            }),
        }
    )

    .delete('/:id', async ({ params, set }) => {
        try {
            const data = await removeRecommendation(params.id)
            return successResponse(data, 'Rekomendasi berhasil dihapus')
        } catch (error: any) {
            set.status = 404
            return errorResponse(formatDbError(error), 404)
        }
    })
