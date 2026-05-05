import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

// Ambil data profil user
export const getProfile = async (userId: string) => {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

    if (!user) throw new Error('User tidak ditemukan')
    return user
}

// Update profil user
export const updateProfile = async (userId: string, data: {
    name?: string
    avatar?: string  // URL gambar profil
}) => {
    const [user] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
        })

    if (!user) throw new Error('User tidak ditemukan')
    return user
}