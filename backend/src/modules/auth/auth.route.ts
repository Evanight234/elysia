import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { rateLimit } from 'elysia-rate-limit'
import { RegisterUsers, LoginUsers, GetCurrentUser, resetPassword } from './auth.service'
import { registerSchema, LoginSchema, resetPasswordSchema } from './auth.schema'
import { successResponse, errorResponse, formatDbError } from '../../utils/response'
import { authMiddleware } from '../../middleware/auth.middleware'

export const authRoute = new Elysia({ prefix: '/auth' })
  .use(
    rateLimit({
      duration: 60 * 1000,
      max: 15,
      scoping: 'scoped',
      generator: (req: Request, server: any) =>
        req.headers.get('x-forwarded-for') || (server ? server.requestIP(req)?.address : null) || '127.0.0.1',
      errorResponse: new Response(
        JSON.stringify({
          success: false,
          message: 'Terlalu banyak percobaan pada endpoint otentikasi. Silakan tunggu 1 menit sebelum mencoba kembali.',
          code: 429,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    })
  )
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
      exp: '7d',
    })
  )

  // POST /auth/register
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        const user = await RegisterUsers(body)
        set.status = 201
        return successResponse(user, 'Registrasi berhasil!')
      } catch (error: any) {
        set.status = 400
        return errorResponse(formatDbError(error))
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
          username: user.username,
          email: user.email,
          role: user.role,
          exp: '7d',
        })

        return successResponse({ token, user }, 'Login berhasil')
      } catch (error: any) {
        set.status = 401
        return errorResponse(error.message || 'Email/username atau password salah', 401)
      }
    },
    { body: LoginSchema }
  )

  // POST /auth/reset-password
  // Memerlukan bukti identitas (JWT) untuk mencegah Account Takeover
  .post(
    '/reset-password',
    async ({ headers, body, jwt, set }) => {
      try {
        const authHeader = headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401
          return errorResponse(
            'Diperlukan token login (JWT) yang valid untuk mengubah password. Silakan login terlebih dahulu.',
            401
          )
        }

        const token = authHeader.split(' ')[1]
        const payload = await jwt.verify(token)

        if (!payload) {
          set.status = 401
          return errorResponse('Token otentikasi tidak valid atau sudah kadaluarsa', 401)
        }

        const currentUser = payload as { id: string; email: string; username: string; role: string }

        // Pastikan hanya pemilik akun yang dapat mereset akunnya sendiri
        if (currentUser.email !== body.email || (currentUser.username && currentUser.username !== body.username)) {
          set.status = 403
          return errorResponse('Anda hanya dapat mengubah password untuk akun Anda sendiri.', 403)
        }

        const result = await resetPassword(body, currentUser.id)
        return successResponse(result, 'Password berhasil diubah!')
      } catch (error: any) {
        set.status = 400
        return errorResponse(formatDbError(error))
      }
    },
    { body: resetPasswordSchema }
  )

  // GET /auth/me (Membutuhkan autentikasi)
  .use(authMiddleware)
  .get(
    '/me',
    async ({ user, set }) => {
      try {
        const userData = await GetCurrentUser(user.id)
        return successResponse(userData, 'Data user berhasil diambil')
      } catch (error: any) {
        set.status = 404
        return errorResponse(formatDbError(error), 404)
      }
    }
  )
