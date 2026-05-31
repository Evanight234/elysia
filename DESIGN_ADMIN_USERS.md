# ElysiaApp — Design Document: Admin & Users Pages

> **Project**: ElysiaApp — Aplikasi baca novel/manga online  
> **Tech Stack**: React + TypeScript (Frontend), Elysia + Bun (Backend), PostgreSQL (Drizzle ORM)

---

## 1. Color System (Pink Theme)

Seluruh aplikasi menggunakan tema pink dengan variabel CSS berikut:

| Token        | Value     | Usage              |
| ------------ | --------- | ------------------ |
| `--pink-50`  | `#fff0f6` | Hover ringan       |
| `--pink-100` | `#fce7f3` | Badge, icon bg     |
| `--pink-300` | `#f9a8d4` | Border hover       |
| `--pink-400` | `#f472b6` | Text sekunder      |
| `--pink-500` | `#ec4899` | Primary accent     |
| `--pink-600` | `#db2777` | Hover primary      |
| `--pink-700` | `#be185d` | Text utama         |
| `--pink-800` | `#9d174d` | Heading            |
| `--pink-900` | `#1a0010` | Dark text          |
| `--border`   | `#fce7f3` | Border default     |
| `--text`     | `#2d2020` | Body text          |

---

## 2. Layout Architecture

### 2.1 Admin Layout (`AdminLayout.tsx`)

```
┌──────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌────────────────────────────┐ │
│ │   Sidebar     │  │      Topbar (mobile only)  │ │
│ │  (280px)      │  ├────────────────────────────┤ │
│ │               │  │                            │ │
│ │  Logo         │  │    ┌─ Blob blur ─────────┐ │ │
│ │               │  │    │   Content (scroll)   │ │ │
│ │  Nav Links    │  │    │                     │ │ │
│ │  • Dashboard  │  │    │                     │ │ │
│ │  • Users      │  │    └─────────────────────┘ │ │
│ │  • Books      │  │                            │ │
│ │  • Chapters   │  │                            │ │
│ │  • Notif      │  │                            │ │
│ │  • Profile    │  │                            │ │
│ │               │  │                            │ │
│ │  Lang Switch  │  │                            │ │
│ │  Logout       │  │                            │ │
│ └──────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- **Desktop**: Sidebar fixed kiri 280px, content di kanan dengan `padding-left: 280px`
- **Mobile**: Sidebar disembunyikan, muncul via hamburger menu (drawer), topbar sticky di atas
- **Sidebar collapsible**: Tombol `×` di pojok sidebar untuk collapse, floating `☰` muncul saat collapsed
- **Background**: Wallpaper dinamis (Cloudinary), glassmorphism di cards/tables, animated pink blob + crystal shards

### 2.2 User Layout (`UserLayout.tsx`)

```
┌──────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌────────────────────────────┐ │
│ │ Sidebar (260px) │  │    Topbar (mobile)       │ │
│ │ (desktop only)  │  ├──────────────────────────┤ │
│ │                 │  │                          │ │
│ │  Logo           │  │   ┌─ Blob blur ────────┐ │ │
│ │  • Home         │  │   │   Content (scroll) │ │ │
│ │  • Search       │  │   │                    │ │ │
│ │  • Library      │  │   └────────────────────┘ │ │
│ │  • Notif        │  │                          │ │
│ │  • Profile      │  │                          │ │
│ │  • Lang Switch  │  │                          │ │
│ │  • Logout       │  │                          │ │
│ └──────────────┘  └────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │         Bottom Nav (mobile only)            │ │
│  │  [Home] [Search] [Library] [Notif] [Profile]│ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- **Desktop**: Sidebar fixed kiri 260px, collapsible, content dengan `padding-left: 260px`
- **Mobile**: Bottom navigation bar fixed, hamburger drawer untuk logout & language
- **Background**: Sama seperti admin — wallpaper dinamis + glassmorphism + blob animations

---

## 3. Admin Pages

### 3.1 Dashboard (`AdminHome.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Stat Cards**       | 4 card: Total Users, Total Books, Active Recs, Total Notifs |
| **User Table**       | List semua user dengan avatar huruf, role badge, tanggal join |
| **Mobile View**      | Stat cards 2-col, user list pakai card layout (`mobile-user-cards`) |
| **Pagination**       | `paginationLimit` dari hook, tombol first/prev/numbers/next/last |

**API Calls**:
- `GET /admin/users` → daftar user
- `GET /books` → semua buku
- `GET /recommendations` → semua rekomendasi

### 3.2 User Control (`AdminControl.tsx`) — *Route: `/admin/users`*

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Stat Cards**       | 3 card: User count, Admin count, Total accounts          |
| **Search**           | Search input dengan clear button, filter by name/email   |
| **User Table**       | Kolom: User, Role, Joined, Action (delete only for USER role) |
| **Delete Modal**     | Konfirmasi hapus user dengan warning                     |
| **Pagination**       | Sama seperti dashboard                                   |

**API Calls**:
- `GET /admin/users` → daftar user
- `DELETE /admin/users/:id` → hapus user

### 3.3 Manage Books (`AdminBooks.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Table**            | Cover mini, Title & Author, Category, Views, Likes, Added date, Action (delete) |
| **Add Modal**        | Multi-step form: Cover upload (drag area), Title, Author, Category (dropdown 30+ genre), Description |
| **Delete Modal**     | Konfirmasi hapus buku                                    |
| **Tambah Buku**      | Cover → base64, POST `/books`                            |

**API Calls**:
- `GET /books` → daftar buku
- `POST /books` → tambah buku
- `DELETE /books/:id` → hapus buku

### 3.4 Manage Chapters (`AdminChapters.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Table**            | Chapter ID, Book title, Number, Title, Content preview, Date added, Delete |
| **Add Modal (Step 1)** | Pilih buku dari list dengan cover mini + chapter count |
| **Add Modal (Step 2)** | Auto-generate ID (`ch-{bookNum}-{chapterNum}`), Number, Title, Content textarea |
| **Validation**       | Cek duplicate chapter number per buku                    |

**API Calls**:
- `GET /chapters` + `GET /books` → data
- `POST /chapters` → tambah chapter
- `DELETE /chapters/:id` → hapus chapter

### 3.5 Send Notification (`AdminNotification.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Tabs**             | Send (kirim pesan) / History (riwayat)                   |
| **Send Tab**         | Table semua user (filter USER role), tombol "Send" per user |
| **Send Modal**       | Title input + Message textarea, kirim ke user tertentu   |
| **History Tab**      | Stat cards (Total/Read/Unread), Search + filter (All/Unread/Read), Refresh button |
| **History List**     | Icon status, Title, Message preview, Penerima, Timestamp, Read/Unread badge |

**API Calls**:
- `GET /admin/users` → daftar user
- `POST /notifications` → kirim notif
- `GET /admin/notifications` → history

### 3.6 Profile (`AdminProfile.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Card Center**      | Avatar circle + camera button, upload preview, save/cancel |
| **Identity**         | Name, @username, Admin role badge                        |
| **Details**          | Email, Status (ADMIN), Joined date                       |
| **Upload**           | File → FormData → `PUT /profile/avatar`, localStorage key `avatar_{email}` |

### 3.7 Admin Search (`AdminSearch.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Search Box**       | Input + Search button, search on Enter                   |
| **Results**          | Cover mini, Title, Author, Category, "Detail" button     |

**API**: `GET /books/search?q={query}`

---

## 4. Users Pages

### 4.1 Home (`Home.tsx`)

| Element              | Deskripsi                                                |
| -------------------- | -------------------------------------------------------- |
| **Header**           | Welcome message + subtitle                               |
| **Book Grid**        | Responsive grid: 6/5/4/3/2/1 col tergantung sidebar state & viewport |
| **Book Card**        | Cover image, Title, Author, View count, Chapter badge, "Read" button |
| **Pagination**       | Server-side pagination via `GET /books/paginated?page=&limit=` |
| **Background**       | Animated pink blob + floating crystal shards             |

**Responsive Grid**:
| Condition              | Columns |
| ---------------------- | ------- |
| Sidebar collapsed ≥1400px | 6    |
| Sidebar open ≥1400px      | 5    |
| Collapsed 1100-1400px     | 5    |
| Open 1100-1400px          | 4    |
| Collapsed 768-1100px      | 4    |
| Open 768-1100px           | 3    |
| 481-768px                 | 2    |
| ≤480px                    | 1    |

### 4.2 Book Detail (`BookDetail.tsx`)

| Element                | Deskripsi                                           |
| ---------------------- | --------------------------------------------------- |
| **Top Section**        | Cover besar (220px), Category badge, Title, Author  |
| **Stats**              | Like count + View count + Chapter count             |
| **Description**        | Sinopsis buku                                       |
| **Actions**            | "Read Now" button + Like toggle button              |
| **Chapter List**       | All chapters with read status, click to navigate    |
| **Progress**           | Progress bar + "Continue" badge untuk chapter terakhir dibaca |
| **API**                | `GET /books/:id`, `POST /library` (add to library), `POST /books/:id/like` |

### 4.3 Search (`Search.tsx`)

| Element                | Deskripsi                                           |
| ---------------------- | --------------------------------------------------- |
| **Search Box**         | Large search input + button                         |
| **Category Tags**      | Clickable category pills (active state)             |
| **Results**            | Grid buku atau list dengan search highlight         |
| **Result Count**       | "[n] results found"                                 |

### 4.4 Library (`Library.tsx`)

| Element                | Deskripsi                                           |
| ---------------------- | --------------------------------------------------- |
| **Tabs**               | Reading / Completed / Plan to Read / Favorites      |
| **Book Grid**          | Same card style as Home                             |
| **Status Tracking**    | Track reading progress via API                      |

### 4.5 Notifications (`Notifications.tsx`)

| Element                | Deskripsi                                           |
| ---------------------- | --------------------------------------------------- |
| **Header**             | Title + "Mark All as Read" button                   |
| **Notif List**         | Cards with icon, title, message, timestamp          |
| **Read States**        | Unread (pink left border + dot) vs Read (grayed out) |
| **Unread Badge**       | Circle badge with unread count                      |

### 4.6 Profile (`Profile.tsx`)

| Element                | Deskripsi                                           |
| ---------------------- | --------------------------------------------------- |
| **Avatar**             | Circle avatar with camera button (same as admin)    |
| **Identity**           | Name, @username, role badge                         |
| **Details**            | Email, Status, Joined date                          |
| **Upload**             | Same flow as admin: file → preview → save           |

### 4.7 Read Chapter (`ReadChapter.tsx`)

| Element                | Deskripsi                                           |
| ---------------------- | --------------------------------------------------- |
| **Content**            | Full chapter content display                        |
| **Navigation**         | Next/Prev chapter buttons                           |
| **API**                | `GET /chapters/:id`                                 |

---

## 5. Shared Components

### 5.1 Pagination (used across all tables & lists)

```
[<<] [<] [1] [...] [3] [4] [5] [...] [10] [>] [>>]
```

- Tombol: First (`<<`), Prev (`<`), Number pages, Next (`>`), Last (`>>`)
- Responsive: page numbers compact di mobile (show fewer)
- Class: `pagination-btn` (white/pink), `active` (pink filled)

### 5.2 Modal System

| Modal                | Class                      | Usage                          |
| -------------------- | -------------------------- | ------------------------------ |
| Confirm Delete       | `confirm-overlay`/`confirm-box` | Hapus buku/chapter/user    |
| Add Book             | `add-book-modal`           | Form tambah buku + cover       |
| Add Chapter (Step 1) | `book-select-list`         | Pilih buku                     |
| Add Chapter (Step 2) | `add-book-modal-body`      | Form chapter                   |
| Send Notification    | `notif-send-modal`         | Title + Message                |

### 5.3 Glassmorphism (body class `home-wallpaper-active`)

Semua komponen utama (cards, tables, search box, modals, pagination, tabs) mendapat efek glass:
- `background: rgba(255,255,255,0.42)`
- `backdrop-filter: blur(16px)`
- `border: 1.5px solid rgba(255,255,255,0.6)`
- `box-shadow: 0 8px 32px rgba(219,39,119,0.08)`

---

## 6. Route Map

### Admin Routes (`/admin`)

| Path              | Page Component       | Description          |
| ----------------- | -------------------- | -------------------- |
| `/admin`          | `AdminHome`          | Dashboard            |
| `/admin/users`    | `AdminUserControl`   | User management      |
| `/admin/books`    | `AdminBooks`         | Book management      |
| `/admin/chapters` | `AdminChapters`      | Chapter management   |
| `/admin/notification` | `AdminNotification` | Send & history notif |
| `/admin/profile`  | `AdminProfile`       | Admin profile        |

### User Routes

| Path              | Page Component       | Description          |
| ----------------- | -------------------- | -------------------- |
| `/home`           | `Home`               | Book catalog         |
| `/search`         | `Search`             | Search + categories  |
| `/library`        | `Library`            | User library         |
| `/notifications`  | `Notifications`      | User notifications   |
| `/profile`        | `Profile`            | User profile         |
| `/book/:id`       | `BookDetail`         | Book detail          |
| `/read/:bookId/:chapterId` | `ReadChapter` | Chapter reader |

---

## 7. API Endpoints (Backend Summary)

| Method   | Endpoint                     | Description                    |
| -------- | ---------------------------- | ------------------------------ |
| `GET`    | `/admin/users`               | List all users                 |
| `DELETE` | `/admin/users/:id`           | Delete user                    |
| `GET`    | `/admin/notifications`       | Notification history (admin)   |
| `GET`    | `/books`                     | All books                      |
| `GET`    | `/books/paginated`           | Paginated books                |
| `GET`    | `/books/:id`                 | Book detail                    |
| `POST`   | `/books`                     | Create book                    |
| `DELETE` | `/books/:id`                 | Delete book                    |
| `GET`    | `/books/search`              | Search books                   |
| `POST`   | `/books/:id/like`            | Toggle like                    |
| `GET`    | `/chapters`                  | All chapters                   |
| `POST`   | `/chapters`                  | Create chapter                 |
| `DELETE` | `/chapters/:id`              | Delete chapter                 |
| `POST`   | `/notifications`             | Send notification              |
| `POST`   | `/library`                   | Add to library                 |
| `PUT`    | `/profile/avatar`            | Upload avatar                  |
| `GET`    | `/recommendations`           | Get recommendations            |

---

## 8. File Structure (Frontend)

```
frontend/src/pages/
├── admin/
│   ├── AdminLayout.tsx       # Admin sidebar + layout wrapper
│   ├── AdminLayout.css       # Layout + glassmorphism + animations
│   ├── AdminPage.css         # Shared admin styles (tables, modals, pagination)
│   ├── AdminHome.tsx         # Dashboard
│   ├── AdminControl.tsx      # User control (/admin/users)
│   ├── AdminBooks.tsx        # Book management
│   ├── AdminChapters.tsx     # Chapter management
│   ├── AdminNotification.tsx # Send notification + history
│   ├── AdminProfile.tsx      # Admin profile
│   └── AdminSearch.tsx       # Book search
│
├── users/
│   ├── Home.tsx              # Book catalog
│   ├── BookDetail.tsx        # Book detail + chapters
│   ├── Library.tsx           # User library
│   ├── Notifications.tsx     # User notifications
│   ├── Profile.tsx           # User profile
│   ├── ReadChapter.tsx       # Chapter reader
│   ├── Search.tsx            # Book search
│   ├── UserPages.css         # All user page styles
│   └── ReadChapter.css       # Reader styles
│
└── components/
    └── layout/
        ├── UserLayout.tsx    # User sidebar + bottom nav
        └── UserLayout.css    # User layout styles
```