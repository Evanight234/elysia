import { Elysia } from "elysia";
import { authRoute } from "./modules/auth/auth.route";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

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
  .listen(3000);

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

