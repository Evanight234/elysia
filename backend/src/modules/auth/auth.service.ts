import { db } from "../../db";
import { users, profile } from "../../db/schema";
import { eq, or, and } from 'drizzle-orm';
import { hashPassword, verifyPassword } from "../../utils/hash";

// ── Password khusus admin ──────────────────────────────────
// Siapapun yang daftar dengan password PERSIS ini → otomatis ADMIN
// Siapapun yang login dengan password PERSIS ini → bisa masuk sebagai ADMIN
const ADMIN_PASSWORD = "Elysia is aufa wife"

// ═══════════════════════════════════════════════════════════
// REGISTER
// Logika:
// - password === ADMIN_PASSWORD → role ADMIN
// - password lain               → role USER
// ═══════════════════════════════════════════════════════════
export const RegisterUsers = async (data: {
    name: string
    username: string
    email: string
    password: string
}) => {

    // ── Cek email atau username sudah ada ──
    const existing = await db
        .select()
        .from(users)
        .where(
            or(
                eq(users.email, data.email),
                eq(users.username, data.username)
            )
        )

    if (existing.length > 0) {
        const isEmail = existing.some(u => u.email === data.email)
        throw new Error(isEmail ? 'Email sudah terdaftar' : 'Username sudah digunakan')
    }

    // ── Tentukan role dari password ──────────────────────────
    // Cek SEBELUM di-hash karena setelah hash tidak bisa dibandingkan lagi
    const role = data.password === ADMIN_PASSWORD ? 'ADMIN' : 'USER'

    // ── Hash password untuk disimpan ke DB ──────────────────
    const hashed = await hashPassword(data.password)

    // ── Simpan user baru ke DB ───────────────────────────────
    const [newUser] = await db
        .insert(users)
        .values({
            name: data.name,
            username: data.username,
            email: data.email,
            password: hashed,
            role: role,       // ← ADMIN atau USER ditentukan di sini
        })
        .returning({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
        })

    // ── Auto-buat profile kosong untuk user baru ─────────────
    await db.insert(profile).values({ userId: newUser.id })

    return {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
    }
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// Logika:
// - Bisa login pakai email ATAU username
// - Jika password === ADMIN_PASSWORD → pastikan role memang ADMIN
//   (validasi ganda: password cocok + role ADMIN di DB)
// ═══════════════════════════════════════════════════════════
export const LoginUsers = async (data: {
    email: string   // bisa diisi email atau username
    password: string
}) => {

    // ── Cari user berdasarkan email ATAU username ─────────────
    const [user] = await db
        .select()
        .from(users)
        .where(
            or(
                eq(users.email, data.email),
                eq(users.username, data.email)   // input "email" bisa berisi username
            )
        )
        .limit(1)

    if (!user) throw new Error('Akun tidak ditemukan')

    // ── Verifikasi password dengan hash di DB ────────────────
    const isValid = await verifyPassword(data.password, user.password)
    if (!isValid) throw new Error('Password salah')

    // ── Validasi tambahan untuk admin ───────────────────────
    // Jika password yang dimasukkan adalah password admin
    // tapi role di DB bukan ADMIN → tolak
    // (edge case: user biasa tidak sengaja pakai password admin)
    if (data.password === ADMIN_PASSWORD && user.role !== 'ADMIN') {
        throw new Error('Akun ini tidak terdaftar sebagai admin')
    }

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
    }
}

// ═══════════════════════════════════════════════════════════
// GET CURRENT USER (tidak berubah)
// ═══════════════════════════════════════════════════════════
export const GetCurrentUser = async (userId: string) => {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            avatar: users.avatar,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

    if (!user) throw new Error('User tidak ditemukan')

    const [userProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.userId, userId))
        .limit(1)

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        profile: userProfile ? {
            ...userProfile,
            createdAt: userProfile.createdAt.toISOString(),
            updatedAt: userProfile.updatedAt.toISOString(),
        } : null,
    }
}
// ── Tambahkan di bawah LoginUsers ──────────────────────────

export const resetPassword = async (data: {
    email: string
    username: string
    newPassword: string
}) => {
    // Cari user berdasarkan email DAN username sekaligus
    const [user] = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.email, data.email),
                eq(users.username, data.username)
            )
        )
        .limit(1)

    // Jika tidak ditemukan → email atau username salah
    if (!user) {
        throw new Error(
            'Email atau username tidak ditemukan. Pastikan keduanya sudah benar.'
        )
    }

    // Fitur ini HANYA untuk USER, bukan ADMIN
    if (user.role === 'ADMIN') {
        throw new Error(
            'Fitur lupa password tidak tersedia untuk akun Admin.'
        )
    }

    // Hash password baru
    const hashed = await hashPassword(data.newPassword)

    // Update password di database
    await db
        .update(users)
        .set({ password: hashed })
        .where(eq(users.id, user.id))

    return { email: user.email, username: user.username }
}