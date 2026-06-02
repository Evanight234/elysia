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

const app = new Elysia()
  .use(cors({
    origin: [
      'http://localhost:5173',
      /\.vercel\.app$/,
    ],
    credentials: true,
  }))
  .onAfterHandle(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff'
    set.headers['X-Frame-Options'] = 'DENY'
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  })
  .use(swagger({
    documentation: {
      info: {
        title: 'Elysia API Documentation',
        version: '1.0.0'
      }
    }
  }))
  .get("/", () => "Hello Elysia")
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


