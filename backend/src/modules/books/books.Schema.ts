import { t } from "elysia";

// Di book.schema.ts — update createBookSchema
// Di book.schema.ts — update createBookSchema
export const createBookSchema = t.Object({
    title: t.String({ minLength: 1 }),
    author: t.String({ minLength: 1 }),
    description: t.Optional(t.Nullable(t.String())),
    cover: t.Optional(t.Nullable(t.String())),
    category: t.String({ minLength: 1 }),
    fileUrl: t.Optional(t.Nullable(t.String())),
    viewCount: t.Optional(t.Number()),   // ← tambah
    likeCount: t.Optional(t.Number()),   // ← tambah
})

export const UpdateBookSchema = t.Partial(createBookSchema)