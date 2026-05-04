import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { RegisterUsers, LoginUsers, GetCurrentUser } from './auth.service'
import { registerSchema, LoginSchema } from './auth.schema'
import { successResponse, errorResponse } from '../../utils/response'
import { authMiddleware } from '../../middleware/auth.middleware'

export const authRoute = new Elysia({ prefix: '/auth' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))

  // POST /auth/register
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        const user = await RegisterUsers(body)
        set.status = 201
        return successResponse(user, 'Registrasi berhasil')
      } catch (error: any) {
        set.status = 400
        return errorResponse(error.message)
      }
    },
    { body: registerSchema }
  )

  // POST /auth/login
  .post(
    '/login',
    async ({ body, jwt, set }) => {
      try {
        const user = await LoginUsers(body)

        const token = await jwt.sign({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })

        return successResponse({ token, user }, 'Login berhasil')
      } catch (error: any) {
        set.status = 401
        return errorResponse(error.message)
      }
    },
    { body: LoginSchema }
  )

  // GET /auth/me — get current logged-in user + profile
  .use(authMiddleware)
  .get(
    '/me',
    async ({ user, set }) => {
      try {
        const userData = await GetCurrentUser(user.id)
        return successResponse(userData, 'Data user berhasil diambil')
      } catch (error: any) {
        set.status = 404
        return errorResponse(error.message)
      }
    }
  )