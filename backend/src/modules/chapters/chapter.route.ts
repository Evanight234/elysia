import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { adminOnly } from '../../middleware/role.middleware'
import { db } from '../../db'
import { chapters } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { successResponse, errorResponse } from '../../utils/response'

export const chapterRoute = new Elysia({ prefix: '/chapters' })

    // GET /chapters → semua chapter (user & admin)
    .use(authMiddleware)
    .get('/', async ({ set }) => {
        try {
            const data = await db
                .select()
                .from(chapters)
                .orderBy(chapters.bookId, chapters.number)
            return successResponse(data)
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })

    // GET /chapters/:id → chapter by id
    .get('/:id', async ({ params, set }) => {
        try {
            const [ch] = await db
                .select()
                .from(chapters)
                .where(eq(chapters.id, params.id))
                .limit(1)
            if (!ch) { set.status = 404; return errorResponse('Chapter tidak ditemukan') }
            return successResponse(ch)
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })

    // POST /chapters → tambah chapter (admin only)
    .use(adminOnly)
    .post(
        '/',
        async ({ body, set }) => {
            try {
                const [ch] = await db
                    .insert(chapters)
                    .values({
                        id: body.id,       // "ch-2-3"
                        bookId: body.bookId,   // "book-2"
                        number: body.number,
                        title: body.title,
                        content: body.content,
                    })
                    .returning()
                set.status = 201
                return successResponse(ch, 'Chapter berhasil ditambahkan')
            } catch (err: any) {
                set.status = 400
                return errorResponse(err.message)
            }
        },
        {
            body: t.Object({
                id: t.String(),
                bookId: t.String(),
                number: t.Number(),
                title: t.String({ minLength: 1 }),
                content: t.String({ minLength: 1 }),
            })
        }
    )

    // DELETE /chapters/:id → hapus chapter (admin only)
    .delete('/:id', async ({ params, set }) => {
        try {
            const [deleted] = await db
                .delete(chapters)
                .where(eq(chapters.id, params.id))
                .returning()
            if (!deleted) { set.status = 404; return errorResponse('Chapter tidak ditemukan') }
            return successResponse(deleted, 'Chapter berhasil dihapus')
        } catch (err: any) {
            set.status = 500
            return errorResponse(err.message)
        }
    })