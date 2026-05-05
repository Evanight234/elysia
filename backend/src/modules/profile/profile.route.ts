import { Elysia, t } from 'elysia'
import { authMiddleware } from '../../middleware/auth.middleware'
import { getProfile, updateProfile } from './profile.service'
import { successResponse, errorResponse } from '../../utils/response'

export const profileRoute = new Elysia({ prefix: '/profile' })
    .use(authMiddleware)

    .get('/', async ({ user, set }) => {
        try {
            const data = await getProfile(user.id)
            return successResponse(data)
        } catch (error: any) {
            set.status = 404
            return errorResponse(error.message)
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
                return errorResponse(error.message)
            }
        },
        {
            body: t.Object({
                name: t.Optional(t.String({ minLength: 2 })),
                avatar: t.Optional(t.String()),  // URL foto profil
            }),
        }
    )