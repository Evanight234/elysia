import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
      exp: '7d',
    })
  )
  .derive({ as: 'scoped' }, async ({ jwt, headers, set }) => {
    const authHeader = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401
      throw new Error('Token tidak ditemukan')
    }

    const token = authHeader.split(' ')[1]
    const payload = await jwt.verify(token)

    if (!payload) {
      set.status = 401
      throw new Error('Token tidak valid atau sudah expired')
    }

    return {
      user: payload as {
        id: string
        name: string
        email: string
        username?: string
        role: 'USER' | 'ADMIN'
      },
    }
  })
