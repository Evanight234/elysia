import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getProfile, updateProfile } from './profile.service'
import { successResponse, errorResponse, formatDbError } from '../../utils/response'

export const profileRoute = new Elysia({ prefix: '/profile' })
    .use(authMiddleware)

    .get('/', async ({ user, set }) => {
        try {
            const data = await getProfile(user.id)
            return successResponse(data)
        } catch (error: any) {
            set.status = 404
            return errorResponse(formatDbError(error), 404)
        }
    })

    .put(
        '/',
        async ({ user, body, set }) => {
            try {
                const data = await updateProfile(user.id, body)
                return successResponse(data, 'Profil berhasil diupdate')
            } catch (error: any) {
                set.status = 400
                return errorResponse(formatDbError(error), 400)
            }
        },
        {
            body: t.Object({
                name: t.Optional(t.String({ minLength: 2 })),
                avatar: t.Optional(t.String()),  // URL foto profil
            }),
        }
    )
    .put('/avatar', async ({ user, body, set }) => {
        try {
            const file = (body as any)?.avatar as File

            if (!file) {
                set.status = 400
                return errorResponse('File tidak bisa ditemukan', 400)
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                set.status = 400
                return errorResponse('File harus format jpg, png, atau webp', 400)
            }
            if (file.size > 2 * 1024 * 1024) {
                set.status = 400
                return errorResponse('Ukuran file maksimal 2MB', 400)
            }
            // Baca file → convert ke base64 URL
            const buffer = await file.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const avatarUrl = `data:${file.type};base64,${base64}`

            // Simpan URL ke database
            const data = await updateProfile(user.id, { avatar: avatarUrl })

            // Update juga di localStorage via response
            return successResponse(data, 'Foto profil berhasil diperbarui')
        } catch (error: any) {
            set.status = 500
            return errorResponse(formatDbError(error), 500)
        }
    })
