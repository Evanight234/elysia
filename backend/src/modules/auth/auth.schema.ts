import { t } from "elysia";

export const registerSchema = t.Object({
    name : t.String({ minLength: 2, maxLength: 50, error: "nama karakter minimal 2 dan maksimal 50" }),
    username : t.String({ minLength: 3, maxLength: 20, error: "username minimal 3 dan maksimal 20 karakter" }),
    email : t.String({ format: "email", error: "email tidak valid" }),
    password : t.String({ minLength: 8, error: "password minimal 8 karakter" })
})
export const LoginSchema = t.Object({
    email : t.String({ minLength: 3, error: "email atau username tidak valid" }),
    password : t.String({ minLength: 8, error: "password minimal 8 karakter" })
})