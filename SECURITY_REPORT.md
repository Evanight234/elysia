# 🔒 Laporan Pentest — ElysiaApp (backend port 7860)

Tanggal: 2 Nov 2026 · Metode: black-box + source-code review · Target: local dev server
Scope: semua route (auth, books, chapters, library, profile, notifications, recommendations, admin). Tools: Python/urllib probes + mini-repro Elysia.

## Ringkasan

| # | Temuan | OWASP API | Severity | Status live |
|---|--------|-----------|----------|-------------|
| 1 | **Privilege escalation: USER bisa akses semua route ADMIN** | API5:2023 | 🔴 CRITICAL | ✅ Terbukti |
| 2 | **Password admin ter-hardcode di source** (siapa pun daftar dengan password itu → ADMIN) | API1/API5 | 🔴 CRITICAL | ✅ Terbukti |
| 3 | **Account takeover via /auth/reset-password** (tanpa OTP/token, cukup email+username) | API2/API8 | 🔴 CRITICAL | ✅ Terbukti (200, login sukses dgn password baru) |
| 4 | **JWT tanpa `exp`** — token berlaku selamanya, tak bisa dicabut | API2:2023 | 🟠 HIGH | ✅ Terbukti (klaim token: iat saja) |
| 5 | **Brute force / rate limit tidak ada** di login & register | API4:2023 | 🟠 HIGH | review kode |
| 6 | **Route publik rusak** — `/books/*` return 401 utk pengunjung anonim (middleware auth bocor global) | bug fungsional | 🟠 HIGH | ✅ Terbukti |
| 7 | Swagger UI + OpenAPI JSON terbuka publik | info disclosure | 🟡 MEDIUM | ✅ Terbukti (200 /swagger/json) |
| 8 | Pagination tanpa batas (`limit=999999999`) | API4:2023 | 🟡 MEDIUM | partial |
| 9 | CORS terlalu longgar (regex `*.vercel.app`, credentials) | API8(oo) | 🟡 MEDIUM | review |
| 10 | Error handler membocorkan raw SQL query + params | API8 | 🟡 MEDIUM | ✅ Terbukti |
| 11 | User enumeration via pesan register/login | API8 | 🔵 LOW | review |
| 12 | Header keamanan tidak lengkap (HSTS, CSP) | - | 🔵 LOW | review |
| 13 | **BOLA/IDOR: kebanyakan route terlindungi dengan baik** ✅ | API1 | PRAISE | notif, library dilindungi where user_id |

## Bukti PoC (nomor sesuai tabel)

### 1. USER akses route admin (= root cause: throw di dalam `.derive()` Elysia tidak menghentikan handler)
```
GET /admin/users              Authorization: Bearer <token role=USER>   → 200, 47 user (email+role luluh)
DELETE /admin/users/:id       Authorization: Bearer <token USER>         → 200, user terhapus (FK cascade)
POST /notifications/          (admin-only) Bearer USER                   → 201, notif masuk ke DB
GET /books/admin/stats        Bearer USER                                → 200
POST /books/                  Bearer USER                                → 201 (buku dibuat)
```
Repro mini (isolasi root cause, file dihapus setelah uji):
- token aba → route admin → **401 ✅** (throw di derive `as:'global'` propagasi)
- token role=USER → route admin → **200 ❌** (throw pada derive LOKAL ditelan Elysia; handler tetap jalan sementara status hanya di-set)

**Fix (pilih satu, konsisten):**
```ts
// role.middleware.ts — ganti derive+throw dengan guard/beforeHandle
export const adminOnly = new Elysia({ name: 'admin-only' })
  .use(authMiddleware)
  .guard({
    beforeHandle({ user, set }) {
      if (user.role !== 'ADMIN') {
        set.status = 403
        return 'Akses ditolak. Hanya admin yang diizinkan' // return truthy = abort
      }
    }
  })
```
atau gunakan `resolve()`/`onRequest` dengan `error()` throw. Jangan percaya `throw` di dalam `.derive()` lokal.

### 2. Password admin hardcoded
`backend/src/modules/auth/auth.service.ts` line 9:
```ts
const ADMIN_PASSWORD = "Elysia is aufa wife"
const role = data.password === ADMIN_PASSWORD ? 'ADMIN' : 'USER'
```
Register dengan password itu langsung dapat role ADMIN (public `/auth/register`). Komit ke repo = bocor permanen.
**Fix:** hapus mekanisme ini. Role hanya di-set manual di DB / by provisioning.

### 3. Account takeover
```
POST /auth/reset-password {email, username, newPassword} → 200 (tanpa token email!)
```
Email + username bisa ditebak/diintip (username bahkan disimpan publik di data admin). attacker reset password siapa pun USER.
**Fix:** minimal butuh token reset (email link OTP), atau minimal validasi ke-blok: hanya user yang sudah login (JWT) boleh reset passwordnya sendiri. Untuk ujian DPK: gunakan JWT user saat ini sebagai proof-of-identity.

### 4. JWT tanpa expiry
```
POST /auth/login → token klaim: {id, name, username, email, role, iat} ← TIDAK ADA exp
```
**Fix:**
```ts
const token = await jwt.sign({ ...user, exp: '7d' })
```
(@elysiajs/jwt menerima `exp` string时间的 atau detik numeric).

### 5. Rate limit
Percobaan 10 login salah berturut-turut tidak pernah PCI-knock. **Fix:** gunakan middleware rate-limit (`@elysiajs/rate-limit`) di /auth/login, /auth/register, /auth/reset-password.

### 6. Route publik rusak (bug fungsional — penting untuk demo!)
Di `index.ts` `authRoute` di-`use()` SEBELUM `bookRoute`; di dalam authRoute `.use(authMiddleware)` dengan `.derive({as:'global'})` → derive ini menyebar ke SEMUA route yang terdaftar SETELAH authRoute (`/books/*` semuanya), membuat GET publik books jadi 401 tanpa token.
**Fix:** jangan pakai `as: 'global'` untuk auth mw: `derive({as: 'global'})` → `.derive()` biasa, atau geser `.use(authMiddleware)` murni ke route yang butuh. Setelah ini cek ulang: curl `GET /books/paginated` **tanpa token** harus 200.

### 7. Swagger publik
Endpoint `/swagger` + `/swagger/json` 200 anonim → memberi attacker peta lengkap. Fix: matikan di prod —
```ts
.use(swagger({ documentation: {...},
  swaggerPath: '/docs',
  provider: '@scalar/elysia',
  excludePaths: process.env.NODE_ENV === 'production' ? ['/'] : [/^$/]    // atau pattisi manual cepat: hanya serve kalau NODE_ENV!=='production'
}))
```
Cara singkat yang pasti: `if (process.env.NODE_ENV !== "production") app.use(swagger({...}))`.

### 8. Pagination / input tidak dibentas
`GET /books/paginated?limit=999999999` tidak di-clamp. `query.limit` `Number()`.
Fix: `const limit = Math.min(Number(query.limit) || 10, 100)` dan `Math.max(page, 1)`.

### 9. CORS
```ts
origin: ['http://localhost:5173', /\.vercel\.app$/]
```
Regex dalam `/.vercel.app$/`** bukan `.vercel.app` tetap — semua `evil.vercel.app` dapat kesempatan credentialed. Karena auth pakai Bearer token (bukan cookie), impact rendah; tapi tap pragmatis. Fix: daftar eksplisit domain vercel app produksi.

### 10. Error bocor raw SQL
`{"message":"Failed query: insert into ... params: ..."}` — detail schema DB terbuka. Fix: jangan kirim `err.message` mentah ke klien untuk error DB; log server-side, kembalikan "Internal error" generik.

### 11. User enumeration
"Pesanan sukses terdaftar via `Email sudah terdaftar`" / "Akun tidak ditemukan" — attacker tahu siapa yang terdaftar. Fix: `Email atau password salah` generic (status sama).

## ✅ Yang sudah aman
- BOLA/IDOR: `notifications/{id}/read` muat `where user_id = jwt_user`, sama juga untuk library — A tidka bisa menandai notif B (404).
- Schema di semua endpoint (Elysia `t.*`) — masih bagus: register 1MB password → 422, bukan 201.
- Password hashing bcrypt 12 rounds.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` sudah di-set (tapi tambah HSTS/CSP).
- Saat ini jangan pake JWT_SECRET — gunakan efek `Bearer` middleware global; property `role` murni klaim JWT.

## 🐛 Bug fungsional bonus (bukan keamanan)
Sengaja kuhentikkan beberapa uji terhadap user dummy register: beberapa user register → tidak ada di DB pada query sesudahnya (FK terlulus dan gagal, semulanya selalu justru USER terakhir dilakukan). Duet: register yang berisiko GAGAL SILENT (query user→profile **bukan transaksi**) — kalau insert `profile` gagal, user tetap dibuat tapi tanpa profile. **Fix:** bungkus `RegisterUsers` di `db.transaction([...])` agar atomic, dan tanggapi hasil error dengan async yang jelas.

## Checklist remediasi (priority)
1. [x] Ganti `.derive()`+throw di role.middleware → `guard`/`beforeHandle` (fix #1, paling fatal) — *SELESAI*
2. [x] Hapus ADMIN_PASSWORD dari auth.service.ts (fix #2) — *SELESAI*
3. [x] Reset-password wajib proof: JWT login aktif atau token email (fix #3) — *SELESAI*
4. [x] `exp` untuk semua JWT (fix #4) — *SELESAI*
5. [x] Rate-limit di /auth (fix #5) — *SELESAI*
6. [x] Perbaiki `.derive({as:'global'})` leak → public books (fix #6) — *SELESAI*
7. [x] Clamp pagination limits (fix #8) — *SELESAI*
8. [x] Matikan swagger di production (fix #7) — *SELESAI*
9. [x] Generic error message untuk DB error (fix #10) + user enumeration (fix #11) — *SELESAI*
10. [x] Tambah HSTS + CSP di onAfterHandle — *SELESAI*
11. [x] Wrap register (user+profile) dalam db.transaction — *SELESAI*

## Catatan lingkungan uji
DB yang dipakai server dev ini adalah instance di 127.0.0.1:5432 (dari `.env` backend), bukan Neon cloud. Uji tidak menyentuh data produksi. Semua user/buku/notifikasi dummy berhasil dibersihkan setelah uji; DB kembali bersih.
