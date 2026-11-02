import { t } from "elysia"

export const registerSchema = t.Object({
    name: t.String({ minLength: 2, maxLength: 50, error: 'Nama minimal 2 dan maksimal 50 karakter' }),
    username: t.String({ minLength: 3, maxLength: 20, error: 'Username minimal 3 dan maksimal 20 karakter' }),
    email: t.String({ format: 'email', error: 'Format email tidak valid' }),
    password: t.String({ minLength: 6, error: 'Password minimal 6 karakter' }),
})

export const LoginSchema = t.Object({
    email: t.String({ minLength: 1, error: 'Email atau username tidak boleh kosong' }),
    password: t.String({ minLength: 1, error: 'Password tidak boleh kosong' }),
})

export const resetPasswordSchema = t.Object({
    email: t.String({ format: 'email', error: 'Format email tidak valid' }),
    username: t.String({ minLength: 1, error: 'Username tidak boleh kosong' }),
    newPassword: t.String({ minLength: 6, error: 'Password baru minimal 6 karakter' }),
})
