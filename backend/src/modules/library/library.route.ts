import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getUserLibrary, addToLibrary, removeFromLibrary } from './library.service'
import { successResponse, errorResponse } from '../../utils/response'

export const libraryRoute = new Elysia({ prefix: '/library' })
    .use(authMiddleware)

    .get('/', async ({ user, set }) => {
        try {
            const data = await getUserLibrary(user.id)
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    .post(
        '/',
        async ({ user, body, set }) => {
            try {
                const data = await addToLibrary(user.id, body.bookId, body.status)
                set.status = 201
                return successResponse(data, 'Buku ditambahkan ke library')
            } catch (error: any) {
                set.status = 400
                return errorResponse(error.message)
            }
        },
        {
            body: t.Object({
                bookId: t.String(),
                status: t.Union([t.Literal('SAVED'), t.Literal('FAVORITE')]),
            }),
        }
    )

    .delete('/:id', async ({ user, params, set }) => {
        try {
            const data = await removeFromLibrary(user.id, params.id)
            return successResponse(data, 'Buku dihapus dari library')
        } catch (error: any) {
            set.status = 404
            return errorResponse(error.message)
        }
    })