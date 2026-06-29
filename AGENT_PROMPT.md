# SYSTEM PROMPT / PERINTAH UNTUK AI AGENT: REPLIKASI MASTER 10000000% ARCHITECTURE, DATABASE & INTEGRASI GOOGLE STITCH UI

> **Instruksi untuk Pengguna:**
> Salin seluruh isi dokumen ini dan berikan kepada AI Agent (misalnya Antigravity, Claude, ChatGPT, Cursor, dll.) ketika Anda ingin membuat project baru dengan **arsitektur backend, database schema, domain business logic, integrasi payment/storage/notification, dan aturan kode yang 100% IDENTIK** seperti project *Seniman Kamera*, namun menggunakan desain UI baru berbasis **Google Stitch**.

---

## 🎯 TUJUAN UTAMA
Anda adalah seorang Senior Full-Stack Architect. Tugas Anda adalah membangun/mereplikasi aplikasi web berbasis **Next.js 15+** dengan **arsitektur backend, database schema (Prisma), domain business logic, service integrations, dan aturan kode 10000000% identik** dengan standar project referensi (*Seniman Kamera*).

**Satu-satunya perbedaan utama adalah pada lapisan antarmuka pengguna (UI/UX)**. Desain UI menggunakan komponen/desain yang disediakan oleh pengguna yang dibuat melalui **Google Stitch**.

---

## 📑 1. ATURAN ARSITEKTUR KODE (MANDATORY & STRICT)

Project ini mengikuti **Feature-Driven Clean Architecture** dengan aturan ketat berikut:

### Core Principles
1. **1 File = 1 Responsibility**
   - 1 Use Case per file
   - 1 Repository per file
   - 1 Action per file
   - 1 Schema per file
   - 1 Component per file
2. **Standard Folder Structure (`src/`)**
   ```txt
   src/
   ├── app/             # Hanya untuk Routing, Layouts, Page Composition, Route Handlers (< 150 baris)
   ├── modules/         # Tempat seluruh Business Logic berdasarkan Fitur Domain
   ├── common/          # Shared components, hooks, utils, validators
   ├── infrastructure/  # External integrations (Prisma Client, Supabase, DOKU, Telegram)
   └── types/           # Global TypeScript types
   ```
3. **Struktur Modul Fitur (`src/modules/[feature-name]/`)**
   Setiap fitur (contoh: `booking`, `auth`, `customer`, `calendar`, `gallery`, `admin-management`) wajib memiliki struktur berikut:
   ```txt
   [feature-name]/
   ├── actions/       # Server Actions (Orchestration Layer)
   ├── use-cases/     # Business Logic Layer (1 use-case per file, expose execute())
   ├── repositories/  # Database Access Layer (Prisma query HANYA boleh di sini)
   ├── services/      # Reusable domain services
   ├── schemas/       # Zod validation schemas (1 schema per use-case)
   ├── components/    # Presentational UI Components (Komponen Google Stitch diadaptasi di sini)
   ├── hooks/         # Client-side custom hooks
   └── types/         # Feature-specific types
   ```

### Alur Ketergantungan (Dependency Flow)
```txt
Page (App Router) / Route Handler
  ↓
Server Action (Validation & Orchestration)
  ↓
Use Case (Business Logic)
  ↓
Repository (Database / Prisma) & External Services (DOKU/Telegram/Supabase)
  ↓
Database (PostgreSQL)
```
❌ **DILARANG HARAM:**
- Memanggil Prisma atau Query DB langsung di dalam Page, Component, Action, atau Route Handler.
- Menaruh Business Logic di dalam Server Action, Page, atau Component.
- Menjadikan seluruh Page sebagai Client Component (`"use client"`).

---

## 📊 2. FULL DATABASE SCHEMA (`prisma/schema.prisma`)

Berikut adalah 100% skema database resmi yang wajib diimplementasikan di PostgreSQL menggunakan Prisma:

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

model Gallery {
  id          Int      @id @default(autoincrement())
  title       String
  category    String
  subCategory String
  imageUrl    String
  aspect      String
  description String?
  mediaType   String   @default("image")
  storagePath String?
  fileSize    Int?
  width       Int?
  height      Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Client {
  id          String    @id @default(uuid())
  fullName    String
  email       String    @unique
  phoneNumber String?
  instagram   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[]
}

model Booking {
  id               String        @id @default(uuid())
  clientId         String
  client           Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  packageType      String
  bookingDate      DateTime
  eventDate        DateTime?
  eventTime        String?       // Waktu acara umum (semua tipe)
  eventName        String?
  eventLocation    String?
  notes            String?
  status           String        @default("PENDING")
  paymentStatus    String        @default("PENDING")
  snapToken        String?
  snapUrl          String?
  dpAmount         Float?
  totalAmount      Float?
  source           String        @default("website") // "website" | "manual"
  sessionStartTime String?       // "HH:MM" — jam mulai sesi (TIME_BASED)
  sessionEndTime   String?       // "HH:MM" — jam selesai sesi (TIME_BASED), dihitung dari durasi paket
  calendarSlot     CalendarSlot?
  paymentTransactions PaymentTransaction[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique  // e.g. "Wedding", "Portraits"
  label       String             // e.g. "Pernikahan", "Potret"
  description String?            // Deskripsi singkat untuk halaman booking
  order       Int       @default(0)
  bookingType String    @default("DATE_ONLY") // "DATE_ONLY" | "TIME_BASED"
  packages    Package[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Package {
  id               String   @id @default(uuid())
  name             String
  categoryId       String
  category         Category @relation(fields: [categoryId], references: [id])
  price            Float
  features         String[]
  description      String?
  sessionDuration  Int?     // Durasi sesi dalam menit. Hanya relevan untuk kategori TIME_BASED.
  imageUrl         String?
  imageStoragePath String?
  textColor        String?  @default("DEFAULT")
  buttonColor      String?  @default("DEFAULT")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model CalendarSlot {
  id            String   @id @default(uuid())
  date          DateTime @unique
  status        String   // PENDING, APPROVED, REJECTED, CANCELLED, LUNAS, ManualBooking, ManualBlock
  bookingId     String?  @unique
  booking       Booking? @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  blockedReason String?
  createdBy     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PaymentTransaction {
  id         String   @id @default(uuid())
  bookingId  String
  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  type       String   // "DP" | "FULL"
  amount     Float
  uniqueKey  String   @unique  // "{bookingId}-DP" atau "{bookingId}-FULL"
  createdAt  DateTime @default(now())
}

model SiteSettings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String   @db.Text
  label     String?  // Label deskriptif untuk UI admin
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Testimonial {
  id          String   @id @default(uuid())
  name        String
  role        String?  // e.g. "Klien Prewedding", "Pernikahan Destinasi"
  content     String   @db.Text
  avatarUrl   String?  // Public URL from Supabase Storage
  storagePath String?  // Supabase storage path (for deletion)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BookingDraft {
  id               String   @id @default(uuid())
  fullName         String
  email            String
  phoneNumber      String?
  instagram        String?
  packageType      String
  categoryId       String?
  bookingDate      DateTime
  eventTime        String?
  eventName        String?
  eventLocation    String?
  notes            String?
  sessionStartTime String?
  sessionEndTime   String?
  bookingType      String   @default("DATE_ONLY")
  dpAmount         Float?
  totalAmount      Float?
  snapToken        String?
  snapUrl          String?
  expiresAt        DateTime // TTL: now() + 20 menit
  createdAt        DateTime @default(now())
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN_PESANAN
  ADMIN_CMS
}

model AdminProfile {
  id         String    @id @default(uuid())
  supabaseId String    @unique // UUID dari Supabase Auth
  name       String
  email      String    @unique
  username   String    @unique // Untuk opsi login menggunakan username
  role       AdminRole @default(ADMIN_PESANAN)
  isActive   Boolean   @default(true)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model OtpToken {
  id        String   @id @default(uuid())
  email     String   
  token     String   @unique  // 6-digit OTP
  expiresAt DateTime // OTP valid dalam waktu 5 menit
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🔌 3. INFRASTRUCTURE & ENVIRONMENT VARIABLES

Proyek ini terhubung dengan 4 layanan utama di folder `src/infrastructure/`:
1. **Prisma (PostgreSQL)** (`src/infrastructure/prisma/client.ts`)
2. **Supabase (Auth & Storage)** (`src/infrastructure/supabase/`)
3. **DOKU Payment Gateway** (`src/infrastructure/doku/doku.service.ts`)
4. **Telegram Bot Notification** (`src/infrastructure/telegram/telegram.service.ts`)

### Kebutuhan `.env` (Environment Variables):
```env
# Database PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Supabase Authentication & Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# DOKU Payment Gateway Integration
DOKU_CLIENT_ID="your-doku-client-id"
DOKU_SECRET_KEY="your-doku-secret-key"
NEXT_PUBLIC_DOKU_IS_PRODUCTION="false" # false untuk Sandbox, true untuk Production

# Telegram Bot Notifications
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
```

### Key NPM Packages (`package.json` Dependencies):
`@prisma/client`, `prisma`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`, `@tanstack/react-table`, `recharts`, `sonner`, `tailwindcss`, `clsx`, `tailwind-merge`.

---

## 💡 4. DOMAIN BUSINESS LOGIC & WORKFLOWS

Saat membangun modul-modul fitur di `src/modules/`, pastikan alur bisnis berikut diimplementasikan 100%:

1. **Modul Booking & Calendar:**
   - Mendukung 2 tipe booking berdasarkan kategori: `DATE_ONLY` (sehari penuh) dan `TIME_BASED` (berdasarkan jam sesi).
   - **BookingDraft (TTL 20 Menit):** Sebelum transaksi final, buat draft temporer dengan batas waktu 20 menit (`expiresAt`). Jika tidak dibayar dalam 20 menit, slot dibebaskan.
   - **Sinkronisasi Slot Kalender:** Setiap booking otomatis mencatat / meng-update status `CalendarSlot` (`PENDING`, `APPROVED`, `LUNAS`, `CANCELLED`).
2. **Modul Payment (DOKU Payment Gateway):**
   - Mendukung opsi **Down Payment (DP)** dan **Full Payment**.
   - Menghasilkan URL pembayaran via DOKU API.
   - Menyediakan Route Handler untuk Webhook / Notification Callback dari DOKU untuk meng-update status `Booking` dan `PaymentTransaction` secara otomatis saat pembayaran berhasil/gagal.
3. **Modul Telegram Notification Service:**
   - Setiap kali ada transaksi/booking baru dibuat atau pembayaran sukses, kirimkan pesan notifikasi otomatis ke admin via Telegram Bot (`telegram.service.ts`).
4. **Modul Authentication & Admin Profile:**
   - Login Admin menggunakan Supabase Auth yang terhubung dengan model `AdminProfile` (Role-based: `SUPER_ADMIN`, `ADMIN_PESANAN`, `ADMIN_CMS`).
   - Fitur Reset Password berbasis `OtpToken` (6 digit, expired dalam 5 menit).

---

## 🛠️ 5. PETUNJUK INTEGRASI DESAIN GOOGLE STITCH

Pengguna akan menyediakan kode HTML, Tailwind CSS, SVG, asset, atau struktur komponen yang di-export / di-generate dari **Google Stitch**. Tugas Anda sebagai AI Agent:

1. **Transformasi Komponen Google Stitch:**
   - Ubah HTML/CSS dari Google Stitch menjadi komponen React Next.js berstandar modern (JSX/TSX).
   - Simpan komponen UI tersebut ke dalam folder yang sesuai:
     - Jika komponen spesifik fitur: `src/modules/[feature-name]/components/[component-name].tsx`
     - Jika komponen global/shared (Navbar, Footer, Modal, Sidebar): `src/common/components/[component-name].tsx`
   - Gunakan `"use client";` HANYA pada komponen UI yang membutuhkan interactivity (State, DOM event handlers, onClick, slider, dll).

2. **Menghubungkan UI Stitch dengan Business Logic:**
   - Sambungkan event form submission, button click, atau data fetch pada UI Google Stitch ke **Server Actions** dan **Use Cases** yang ada.
   - Pertahankan validasi form menggunakan **Zod Schema** yang sudah ditentukan di layer `schemas/`.
   - Pastikan loading state, error handling, dan feedback UI (menggunakan Toast/Sonner) dari Google Stitch berfungsi dengan smooth.

3. **Penyusunan Halaman (Page Composition):**
   - Di `src/app/`, buat `page.tsx` sebagai **Server Component** default.
   - Panggil data via Repository / Use Case di Server Component, lalu passing data tersebut sebagai `props` ke komponen UI Google Stitch.

---

## 🚀 6. WORKFLOW EKSEKUSI TAHAP DEMI TAHAP (FOR AI AGENT)

Ketika pengguna memberikan kode / sketsa UI Google Stitch dan meminta pembuatan fitur/aplikasi:

1. **Tahap 1: Setup Infrastructure & Schema**
   - Pasang `schema.prisma` dan jalankan `npx prisma db push` atau `npx prisma migrate dev`.
   - Konfigurasi environment variables di `.env`.
2. **Tahap 2: Buat Repository & Schema Validasi**
   - Buat Zod Schema (`*.schema.ts`) di modul fitur terkait.
   - Implementasikan database query di `*.repository.ts`.
3. **Tahap 3: Buat Use Case & Server Action**
   - Implementasikan logika bisnis di `*.use-case.ts` (menggunakan metode `.execute()`).
   - Buat orchestration layer di `*.action.ts` yang memvalidasi input Zod dan mengeksekusi Use Case.
4. **Tahap 4: Konversi UI Google Stitch**
   - Ambil desain dari Google Stitch dan pecah menjadi komponen React modular (< 200 baris per komponen).
   - Hubungkan tombol/form ke Server Action.
5. **Tahap 5: Komposisi Halaman (`page.tsx`)**
   - Susun komponen di `src/app/[route]/page.tsx` menggunakan Server Component.

---

## 📋 CHEATSHEET ATURAN FORMATTING NAMA FILE
- Gunakan **kebab-case** untuk semua nama file:
  - `create-booking.use-case.ts`
  - `create-booking.schema.ts`
  - `create-booking.action.ts`
  - `booking.repository.ts`
  - `booking-card.tsx`
  - `booking-form.tsx`

---

> **Pesan untuk AI Agent:** Ikuti instruksi ini dengan ketat 10000000%! Jangan pernah memotong jalur (shortcut). Jangan pernah mencampur logika bisnis atau query Prisma langsung di dalam UI Component, Page, atau Server Action!
