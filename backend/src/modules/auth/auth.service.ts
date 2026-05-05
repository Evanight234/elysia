import { db } from "../../db";
import { users, profile } from "../../db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../../utils/hash";

export const RegisterUsers = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
}) => {
    // Check if email or username already exists
    const existing = await db
        .select()
        .from(users)
        .where(
            or(
                eq(users.email, data.email),
                eq(users.username, data.username)
            )
        );

    if (existing.length > 0) {
        const isEmail = existing.some(u => u.email === data.email);
        throw new Error(isEmail ? "Email sudah terdaftar" : "Username sudah digunakan");
    }

    const hashed = await hashPassword(data.password);

    const [newUser] = await db
        .insert(users)
        .values({
            name: data.name,
            username: data.username,
            email: data.email,
            password: hashed,
            role: "USER",
        })
        .returning({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
        });

    // Auto-create an empty profile for the new user
    await db.insert(profile).values({
        userId: newUser.id,
    });

    return {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
    };
};

export const LoginUsers = async (data: {
    email: string; // This can be email or username
    password: string;
}) => {
    const [user] = await db
        .select()
        .from(users)
        .where(
            or(
                eq(users.email, data.email),
                eq(users.username, data.email)
            )
        )
        .limit(1);

    if (!user) {
        throw new Error("Akun tidak ditemukan");
    }

    const isValid = await verifyPassword(data.password, user.password);

    if (!isValid) {
        throw new Error("Password salah");
    }

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
    };
};

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
        .limit(1);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    // Fetch the user's profile
    const [userProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.userId, userId))
        .limit(1);

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        profile: userProfile ? {
            ...userProfile,
            createdAt: userProfile.createdAt.toISOString(),
            updatedAt: userProfile.updatedAt.toISOString(),
        } : null,
    };
};