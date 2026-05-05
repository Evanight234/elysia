import { Elysia } from "elysia";
import { authRoute } from "./modules/auth/auth.route";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { bookRoute } from './modules/books/books.route';
import { libraryRoute } from './modules/library/library.route';
import { notifRoute } from './modules/Notification/notif.route'
import { profileRoute } from './modules/profile/profile.route'
import { recommendationRoute } from './modules/recomendation/recomendation.route';

const app = new Elysia()
  .use(cors())
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
  .listen(3000);

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

