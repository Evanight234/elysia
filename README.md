<div align="center">

# ElysiaApp

[![Active Development](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge&logo=github)](https://github.com/satriyoo09/ElysiaApp)
[![Bun Version](https://img.shields.io/badge/Bun-v1.1+-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![React Version](https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## About ElysiaApp

<div align="center">
  <img src="https://res.cloudinary.com/dxdon9nfs/image/upload/v1780152558/wallpaperflare.com_wallpaper_kitej3.jpg" width="100%" alt="ElysiaApp Banner" style="border-radius: 12px; border: 2px solid #4a0b17;" />
</div>

<br/>

ElysiaApp is a premium web novel and manga reader application designed for school project DPK (Dasar Program Keahlian). Inspired by beautiful UI designs and gaming character aesthetics, the application combines glassmorphism, dynamic live wallpaper backdrops, and interactive animations with a modular themed system.

---

## The Core Theme System
The UI supports custom character-themed layouts that alter the style, animations, and typography:
- Elysia (Default Pink): Soft cherry-blossom pink with glowing glassmorphism.

---

## Features

### User Portal
- Sidebar & Bottom Nav: Fully responsive layout switcher (desktop sidebar vs mobile bottom navigation).
- Immersive Reader: Flowing reader interface with custom typography, chapter progress tracking, and bookmarking.
- Library Tracking: Categorize reading status into Reading, Completed, Plan to Read, or Favorites.
- Search & Categorization: Fast catalog query with category tags filtering.
- Inbox Notification: Real-time broadcast alerts and updates check with read/unread visual states.

### Admin Dashboard
- Stat Cards: Real-time counter metrics tracking active users, total books, recommendation listings, and notification records.
- User Control: Administration console to query, search, inspect joined dates, and manage account registration.
- Book Manager: Upload and publish book cover art (Base64/Cloudinary), configure genres, title metadata, and description.
- Chapter Manager: Multi-step creation wizard for drafting and indexing novel chapters safely without duplicates.
- Broadcast System: Targeted notification composer to write and publish alerts to single or multiple users.

---

## Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React + TypeScript + CSS3 | Component UI, custom hook layout managers, CSS variables theme tokens. |
| **Backend** | ElysiaJS + Bun | Ultra-fast HTTP backend microservices on Bun runtime. |
| **Database** | PostgreSQL | Drizzle ORM structure, hosting account metadata, library progress, books and chapters. |
| **Assets** | Cloudinary | Cloud hosting system for high-resolution static backgrounds and book covers. |

---

## Meet The Team
A passionate project developed by:

### Fullstack Team
- **Satriyo** (satriyoo09) - Core layout architecture, theme integrations & DB connections [![Satriyo Commits](https://img.shields.io/github/commits-by/satriyoo09/ElysiaApp/satriyoo09?color=ff2a5f&style=flat-square&label=commits)](https://github.com/satriyoo09/ElysiaApp/commits?author=satriyoo09)
- **Aufa** (ashoza) - Application routes, page routing & schema validation [![Aufa Commits](https://img.shields.io/github/commits-by/satriyoo09/ElysiaApp/ashoza?color=ff2a5f&style=flat-square&label=commits)](https://github.com/satriyoo09/ElysiaApp/commits?author=ashoza)

### Frontend Team
- **Allea** (Tazkiainni) - Component design & layouts [![Allea Commits](https://img.shields.io/github/commits-by/satriyoo09/ElysiaApp/Tazkiainni?color=ff2a5f&style=flat-square&label=commits)](https://github.com/satriyoo09/ElysiaApp/commits?author=Tazkiainni)
- **Soren** (sorenthegreat) - Styling tokens & page assets [![Soren Commits](https://img.shields.io/github/commits-by/satriyoo09/ElysiaApp/sorenthegreat?color=ff2a5f&style=flat-square&label=commits)](https://github.com/satriyoo09/ElysiaApp/commits?author=sorenthegreat)

---

## Getting Started

### Prerequisites
Make sure you have Bun installed.

### Installation & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/satriyoo09/ElysiaApp.git
   cd ElysiaApp
   ```

2. **Install all dependencies**
   ```bash
   bun install
   ```

3. **Launch Development Servers**
   ```bash
   # Start the frontend application
   cd frontend
   bun run dev

   # Start the backend server
   cd ../backend
   bun run dev
   ```

---

> [!NOTE]
> ### Message from the Ministry of Fun (Special DPK Award)
> **Great work, Citizen!** Your social credit score has increased by **[100] Integers**.
> You have successfully unlocked:
> - Ability to purchase extra rice
> - 15 minutes of extra gaming time
> - Permission to travel to Shanghai
> 
> *Keep up the good work and glory to the DPK project!*
