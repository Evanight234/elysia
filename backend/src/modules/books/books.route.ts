import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { authMiddleware } from '../../middleware/auth.middleware'
import { adminOnly } from '../../middleware/role.middleware'
import { getAllBooks, getBooksPaginated, searchBooks, searchBooksPaginated, getBookById, getChapterByNumber, createBook, updateBook, deleteBook, toggleLike, getAdminBookStats, getBooksByCategory } from './books.service'
import { createBookSchema, UpdateBookSchema } from './books.Schema'
import { successResponse, errorResponse } from '../../utils/response'
import { NewBook } from '../../db/schema'

export const bookRoute = new Elysia({ prefix: '/books' })
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET!,
        })
    )
    // Helper to get optional user without throwing error
    .derive(async ({ jwt, headers }) => {
        const authHeader = headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) return { user: null }

        const token = authHeader.split(' ')[1]
        const payload = await jwt.verify(token)
        return { user: payload as any }
    })

    // ── PUBLIC ROUTES ─────────────────────────────────────

    // GET /books
    .get('/', async ({ set }) => {
        try {
            const data = await getAllBooks()
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    // GET /books/paginated?page=1&limit=10
    .get('/paginated', async ({ query, set }) => {
        try {
            const page = Number(query.page) || 1
            const limit = Number(query.limit) || 10
            const data = await getBooksPaginated(page, limit)
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    }, { query: t.Object({ page: t.Optional(t.String()), limit: t.Optional(t.String()) }) })

    // GET /books/search?q=xxx&page=1&limit=10
    .get(
        '/search',
        async ({ query, set }) => {
            try {
                const q = query.q || ''
                if (query.page || query.limit) {
                    const page = Number(query.page) || 1
                    const limit = Number(query.limit) || 10
                    const data = await searchBooksPaginated(q, page, limit)
                    return successResponse(data)
                }
                const data = await searchBooks(q)
                return successResponse(data)
            } catch (error: any) {
                set.status = 500
                return errorResponse(error.message)
            }
        },
        {
            query: t.Object({
                q: t.Optional(t.String()),
                page: t.Optional(t.String()),
                limit: t.Optional(t.String())
            })
        }
    )

    // GET /books/:id
    .get('/:id', async ({ params, set, user }) => {
        try {
            // user comes from .derive above (optional)
            const data = await getBookById(params.id, user?.id)
            if (!data) {
                set.status = 404
                return errorResponse('Buku tidak ditemukan')
            }
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    // GET /books/:id/chapters/:number
    .get('/:id/chapters/:number', async ({ params, set }) => {
        try {
            const data = await getChapterByNumber(params.id, Number(params.number))
            if (!data) {
                set.status = 404
                return errorResponse('Chapter tidak ditemukan')
            }
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    // ── PROTECTED ROUTES ──────────────────────────────────

    .group('', (app) => app
        .use(authMiddleware)

        // POST /books/:id/like
        .post('/:id/like', async ({ params, set, user }) => {
            try {
                const data = await toggleLike(user.id, params.id)
                return successResponse(data, data.liked ? 'Buku disukai' : 'Batal menyukai')
            } catch (error: any) {
                set.status = 500
                return errorResponse(error.message)
            }
        })
    )

    // ── ADMIN ROUTES ──────────────────────────────────────

    .group('', (app) => app
        .use(authMiddleware)
        .use(adminOnly)

        // GET /books/admin/stats — statistik agregat buku
        .get('/admin/stats', async ({ set }) => {
            try {
                const data = await getAdminBookStats()
                return successResponse(data)
            } catch (error: any) {
                set.status = 500
                return errorResponse(error.message)
            }
        })

        // GET /books/admin/category/:category — filter buku per kategori
        .get('/admin/category/:category', async ({ params, set }) => {
            try {
                const data = await getBooksByCategory(params.category)
                return successResponse(data)
            } catch (error: any) {
                set.status = 500
                return errorResponse(error.message)
            }
        })

        .post('/', async ({ body, set }) => {
            try {
                const data = await createBook(body)
                set.status = 201
                return successResponse(data, 'Buku berhasil ditambahkan')
            } catch (error: any) {
                set.status = 400
                return errorResponse(error.message)
            }
        }, { body: createBookSchema })

        .put('/:id', async ({ params, body, set }) => {
            try {
                const data = await updateBook(params.id, body as NewBook)
                return successResponse(data, 'Buku berhasil diupdate')
            } catch (error: any) {
                set.status = 404
                return errorResponse(error.message)
            }
        }, { body: UpdateBookSchema })

        .delete('/:id', async ({ params, set }) => {
            try {
                const data = await deleteBook(params.id)
                return successResponse(data, 'Buku berhasil dihapus')
            } catch (error: any) {
                set.status = 404
                return errorResponse(error.message)
            }
        })
    )
