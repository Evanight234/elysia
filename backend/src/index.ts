import { Elysia } from "elysia";
import { authRoute } from "./modules/auth/auth.route";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { bookRoute } from './modules/books/books.route';
import { libraryRoute } from './modules/library/library.route';
import { notifRoute } from './modules/Notification/notif.route'
import { profileRoute } from './modules/profile/profile.route'
import { recommendationRoute } from './modules/recomendation/recomendation.route';
import { adminRoute } from './modules/admin/admin.route';
import { chapterRoute } from './modules/chapters/chapter.route'
import { errorResponse } from "./utils/response";

const isProduction = process.env.NODE_ENV === 'production'

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://elysia-kappa-seven.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

const app = new Elysia()
  .use(cors({
    origin: (request: Request): boolean => {
      const origin = request.headers.get('origin')
      if (!origin) return true
      if (allowedOrigins.includes(origin)) return true
      // Support preview deployments on Vercel only if explicitly matching project prefix
      if (origin.startsWith('https://elysia-') && origin.endsWith('.vercel.app')) {
        return true
      }
      return false
    },
    credentials: true,
  }))
  .onAfterHandle(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff'
    set.headers['X-Frame-Options'] = 'DENY'
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    set.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  })
  .onError(({ code, error, set }: any) => {
    if (code === 'VALIDATION') {
      set.status = 422
      return errorResponse((error as any)?.message || 'Validation error', 422)
    }
    if (code === 'NOT_FOUND') {
      set.status = 404
      return errorResponse('Route tidak ditemukan', 404)
    }
    // Jika middleware sudah menetapkan status 4xx (seperti 401 / 403), pertahankan status dan pesan tersebut
    const rawStatus = typeof set.status === 'number' ? set.status : Number(set.status)
    if (!isNaN(rawStatus) && rawStatus >= 400 && rawStatus < 500) {
      const msg = (error as any)?.message || 'Terjadi kesalahan pada permintaan'
      return errorResponse(msg, rawStatus)
    }
    console.error('Global Error Handler:', error)
    set.status = 500
    return errorResponse('Terjadi kesalahan internal pada server', 500)
  })
  .get("/", () => "Hello Elysia")

// Nonaktifkan Swagger di production untuk mencegah information disclosure
if (!isProduction) {
  app.use(swagger({
    documentation: {
      info: {
        title: 'Elysia API Documentation',
        version: '1.0.0'
      }
    }
  }))
}

app
  .use(authRoute)
  .use(bookRoute)
  .use(libraryRoute)
  .use(notifRoute)
  .use(profileRoute)
  .use(recommendationRoute)
  .use(adminRoute)
  .use(chapterRoute);

if (!process.env.VERCEL) {
  app.listen(process.env.PORT ?? 7860);
  console.log(
    `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export default app;
