import { db } from "../src/db";
import { users, profile } from "../src/db/schema";
import { hashPassword } from "../src/utils/hash";

async function test() {
    try {
        const data = {
            name: "Test User",
            username: "testuser_" + Date.now(),
            email: "test_" + Date.now() + "@example.com",
            password: "password123"
        };

        console.log("Hashing password...");
        const hashed = await hashPassword(data.password);

        console.log("Inserting user...");
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

        console.log("New user created:", newUser);

        console.log("Inserting profile...");
        await db.insert(profile).values({
            userId: newUser.id,
        });

        console.log("Profile created successfully");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
