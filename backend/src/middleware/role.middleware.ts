import { Elysia } from 'elysia'
import { authMiddleware } from './auth.middleware'
import { errorResponse } from '../utils/response'

// Hanya ADMIN yang boleh akses
export const adminOnly = (app: Elysia) =>
  app
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }: any) => {
      if (!user || user.role !== 'ADMIN') {
        set.status = 403
        return errorResponse('Akses ditolak. Hanya admin yang diizinkan', 403)
      }
    })

// Hanya USER biasa yang boleh akses
export const userOnly = (app: Elysia) =>
  app
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }: any) => {
      if (!user || user.role !== 'USER') {
        set.status = 403
        return errorResponse('Akses ditolak. Hanya user yang diizinkan', 403)
      }
    })
