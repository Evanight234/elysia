import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getUserLibrary, addToLibrary, removeFromLibrary, updateLastChapter } from './library.service'
import { successResponse, errorResponse } from '../../utils/response'

export const libraryRoute = new Elysia({ prefix: '/library' })
    .use(authMiddleware)

    .get('/', async ({ query, user, set }) => {
        try {
            const status = query.status || undefined
            const page = Number(query.page) || 1
            const limit = Number(query.limit) || 20
            const data = await getUserLibrary(user.id, status, page, limit)
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    }, {
        query: t.Object({
            status: t.Optional(t.String()),
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        })
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
                status: t.Union([t.Literal('SAVED'), t.Literal('FAVORITE'), t.Literal('READING')]),
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

    .patch('/:bookId/lastChapter', async ({ user, params, body, set }) => {
        try {
            const data = await updateLastChapter(user.id, params.bookId, body.lastChapter)
            return successResponse(data, 'Progres membaca diperbarui')
        } catch (error: any) {
            set.status = 400
            return errorResponse(error.message)
        }
    }, {
        body: t.Object({
            lastChapter: t.Number()
        })
    })