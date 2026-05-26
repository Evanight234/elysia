FROM oven/bun:alpine AS base
WORKDIR /app

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY backend/ .

EXPOSE 7860

CMD ["bun", "run", "src/index.ts"]