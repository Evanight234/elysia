import { hash, compare } from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
    return hash(password, 12);
}

export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => (
    compare(password, hashedPassword)
)