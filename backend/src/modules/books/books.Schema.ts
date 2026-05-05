import { t } from "elysia";

export const CreateBookSchema = t.Object({
    title: t.String({ minLength: 3 }),
    author: t.String({ minLength: 3 }),
    description: t.String({ minLength: 3 }),
    cover: t.String({ minLength: 3 }),
    category: t.String({ minLength: 3 }),
    FileUrl: t.String({ minLength: 3 }),
})

export const UpdateBookSchema = t.Partial(CreateBookSchema)