import { t } from "elysia"

export const registerSchema = t.Object({
    name: t.String({ minLength: 2, maxLength: 50, error: 'Nama minimal 2 dan maksimal 50 karakter' }),
    username: t.String({ minLength: 3, maxLength: 20, error: 'Username minimal 3 dan maksimal 20 karakter' }),
    email: t.String({ format: 'email', error: 'Format email tidak valid' }),
    password: t.String({ minLength: 1, error: 'Password tidak boleh kosong' }),
    // minLength: 1 bukan 8 — validasi panjang dilakukan di frontend
    // backend hanya perlu terima passwordnya untuk dicek apakah = ADMIN_PASSWORD
})

export const LoginSchema = t.Object({
    email: t.String({ minLength: 1, error: 'Email atau username tidak boleh kosong' }),
    password: t.String({ minLength: 1, error: 'Password tidak boleh kosong' }),
})