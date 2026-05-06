import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { adminOnly } from '../../middleware/role.middleware'
import { getAllBooks, searchBooks, getBookById, createBook, updateBook, deleteBook } from './books.service'
import { CreateBookSchema, UpdateBookSchema } from './books.Schema'
import { successResponse, errorResponse } from '../../utils/response'
import { NewBook } from '../../db/schema'

export const bookRoute = new Elysia({ prefix: '/books' })

    // GET /books — semua user login bisa akses
    .use(authMiddleware)
    .get('/', async ({ set }) => {
        try {
            const data = await getAllBooks()
            return successResponse(data)
        } catch (error: any) {
            set.status = 500
            return errorResponse(error.message)
        }
    })

    // GET /books/:id
    .get('/:id', async ({ params, set }) => {
        try {
            const data = await getBookById(params.id)
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

    // GET /books/search?q=xxx
    .get(
        '/search',
        async ({ query, set }) => {
            try {
                const data = await searchBooks(query.q || '')
                return successResponse(data)
            } catch (error: any) {
                set.status = 500
                return errorResponse(error.message)
            }
        },
        { query: t.Object({ q: t.Optional(t.String()) }) }
    )

    // POST /PUT /DELETE — admin only
    .use(adminOnly)
    .post(
        '/',
        async ({ body, set }) => {
            try {
                const data = await createBook(body)
                set.status = 201
                return successResponse(data, 'Buku berhasil ditambahkan')
            } catch (error: any) {
                set.status = 400
                return errorResponse(error.message)
            }
        },
        { body: CreateBookSchema }
    )

    .put(
        '/:id',
        async ({ params, body, set }) => {
            try {
                const data = await updateBook(params.id, body as NewBook)
                return successResponse(data, 'Buku berhasil diupdate')
            } catch (error: any) {
                set.status = 404
                return errorResponse(error.message)
            }
        },
        { body: UpdateBookSchema }
    )

    .delete('/:id', async ({ params, set }) => {
        try {
            const data = await deleteBook(params.id)
            return successResponse(data, 'Buku berhasil dihapus')
        } catch (error: any) {
            set.status = 404
            return errorResponse(error.message)
        }
    })