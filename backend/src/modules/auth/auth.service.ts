import { db } from "../../db";
import { users, profile } from "../../db/schema";
import { eq, or, and } from 'drizzle-orm';
import { hashPassword, verifyPassword } from "../../utils/hash";

// ═══════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════
export const RegisterUsers = async (data: {
    name: string
    username: string
    email: string
    password: string
}) => {
    // ── Cek email atau username sudah ada ──
    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(
            or(
                eq(users.email, data.email),
                eq(users.username, data.username)
            )
        )
        .limit(1)

    if (existing.length > 0) {
        throw new Error('Email atau username sudah terdaftar')
    }

    // ── Hash password untuk disimpan ke DB ──────────────────
    const hashed = await hashPassword(data.password)

    // ── Simpan user baru ke database ──
    const [newUser] = await db
        .insert(users)
        .values({
            name: data.name,
            username: data.username,
            email: data.email,
            password: hashed,
            role: 'USER', // Role selalu USER untuk pendaftaran publik
        })
        .returning({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
        })

    // ── Auto-buat profile kosong untuk user baru (dengan rollback kompensasi jika gagal) ──
    try {
        await db.insert(profile).values({ userId: newUser.id })
    } catch (profileError) {
        // Rollback: hapus user yang baru dibuat agar tidak terjadi orphaned user di DB
        await db.delete(users).where(eq(users.id, newUser.id))
        console.error('Failed to create profile, user creation rolled back:', profileError)
        throw new Error('Gagal menyelesaikan registrasi pengguna. Silakan coba kembali.')
    }

    return {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
    }
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
export const LoginUsers = async (data: {
    email: string // bisa berupa email atau username
    password: string
}) => {
    // ── Cari user berdasarkan email ATAU username ─────────────
    const [user] = await db
        .select()
        .from(users)
        .where(
            or(
                eq(users.email, data.email),
                eq(users.username, data.email)
            )
        )
        .limit(1)

    // Pesan seragam untuk mencegah user enumeration
    if (!user) {
        throw new Error('Email/username atau password salah')
    }

    // ── Verifikasi password dengan hash di DB ────────────────
    const isValid = await verifyPassword(data.password, user.password)
    if (!isValid) {
        throw new Error('Email/username atau password salah')
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
// GET CURRENT USER
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

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD (DIBATASI DENGAN VERIFIKASI IDENTITAS)
// ═══════════════════════════════════════════════════════════
export const resetPassword = async (
    data: {
        email: string
        username: string
        newPassword: string
    },
    requesterId?: string
) => {
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

    if (!user) {
        throw new Error('Email atau username tidak ditemukan. Pastikan data yang dimasukkan benar.')
    }

    // Hanya akun USER biasa yang dapat mereset password via endpoint ini
    if (user.role === 'ADMIN') {
        throw new Error('Fitur lupa password tidak tersedia untuk akun Admin.')
    }

    // Validasi kepemilikan jika requesterId disertakan
    if (requesterId && user.id !== requesterId) {
        throw new Error('Anda tidak memiliki izin untuk mengubah password akun ini.')
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
