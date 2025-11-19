# Fullstack Blog App (Next.js & Express)

Sebuah aplikasi Blog modern yang dibangun menggunakan arsitektur **Monorepo** (Frontend dan Backend terpisah dalam satu repositori). Aplikasi ini mencakup fitur otentikasi lengkap, manajemen pengguna (RBAC), dan manajemen artikel (CRUD) dengan validasi yang ketat.

## 🛠 Tech Stack

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validation:** Zod
* **Authentication:** JWT (JSON Web Token) & Bcrypt

**Frontend:**
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4

---

## 📋 Prasyarat (Prerequisites)

Pastikan komputer Anda telah terinstal:
1.  **Node.js** (v18 ke atas disarankan)
2.  **npm** (Node Package Manager)
3.  **PostgreSQL** (Database server harus berjalan)
4.  **Git**

---

## 🚀 Panduan Instalasi & Setup

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan aplikasi.

### 1. Clone Repository

```bash
git clone [https://github.com/haidarfahmii/blog-app.git](https://github.com/haidarfahmii/blog-app.git)
cd blog-app
````

### 2\. Konfigurasi Backend

Masuk ke direktori backend, instal dependensi, dan hubungkan database.

**a. Masuk ke folder backend:**

```bash
cd backend
```

**b. Instal dependensi:**

```bash
npm install
```

**c. Konfigurasi Environment Variables (.env):**
Buat file `.env` di dalam folder `backend/` dan salin konfigurasi berikut. Sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL lokal Anda.

```env
# Server Configuration
PORT=5000
NODE_ENV=development
# URL Frontend untuk konfigurasi CORS
CLIENT_URL=http://localhost:3000

# Database Connection (PostgreSQL)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog_db?schema=public"

# JWT Configuration
JWT_SECRET="rahasia_jwt_yang_sangat_aman"
```

**d. Setup Database (Migrasi Prisma):**
Jalankan perintah ini untuk membuat tabel di database Anda sesuai skema `schema.prisma`.

```bash
npm run prisma:migrate
```

*Perintah ini akan menjalankan `prisma migrate dev`.*

**e. Jalankan Server Backend:**

```bash
npm run dev
```

*Server backend akan berjalan di `http://localhost:5000`.*

-----

### 3\. Konfigurasi Frontend

Buka terminal baru (biarkan terminal backend tetap berjalan), lalu masuk ke direktori frontend.

**a. Masuk ke folder frontend:**

```bash
cd ../frontend
```

**b. Instal dependensi:**

```bash
npm install
```

**c. Jalankan Server Frontend:**

```bash
npm run dev
```

Buka browser Anda dan akses: **`http://localhost:3000`**

-----

## 🔑 Fitur Utama

  * **Otentikasi & Otorisasi:**
      * Register & Login pengguna.
      * Proteksi menggunakan JWT Access Token.
      * Role-Based Access Control (USER & ADMIN).
  * **Manajemen Artikel:**
      * Create, Read, Update, Delete (CRUD) Artikel.
      * Slug otomatis yang unik (URL Friendly).
      * Validasi input menggunakan Zod.
      * Pencarian dan Filter Kategori.
  * **Manajemen User:**
      * Update profil pengguna.
      * Admin dapat melihat semua pengguna.

-----

## 📂 Struktur Folder

```bash
blog-app/
├── backend/                # Server-side (Express + Prisma)
│   ├── prisma/             # Schema Database & Migrations
│   ├── src/
│   │   ├── config/         # Konfigurasi DB
│   │   ├── controllers/    # Logika Request/Response
│   │   ├── errors/         # Custom Error Handling
│   │   ├── middlewares/    # Auth, Role, Error, Validation Middleware
│   │   ├── routers/        # Definisi Route API
│   │   ├── services/       # Logika Bisnis (Database access)
│   │   ├── utils/          # Helper functions (slug, etc)
│   │   └── validations/    # Schema validasi Zod
│   └── package.json
│
└── frontend/               # Client-side (Next.js)
    ├── public/             # Static assets
    ├── src/
    │   └── app/            # Next.js App Router Pages
    ├── package.json
    └── next.config.ts
```

## 📝 API Endpoints (Contoh)

Berikut adalah beberapa endpoint utama yang tersedia di Backend:

  * **Auth:**

      * `POST /api/auth/register` - Pendaftaran user baru
      * `POST /api/auth/login` - Masuk aplikasi

  * **Articles:**

      * `GET /api/articles` - Mengambil artikel publik
      * `POST /api/articles` - Membuat artikel baru (Perlu Login)
      * `GET /api/articles/search?q=keyword` - Mencari artikel

  * **Users:**

      * `GET /api/users/:id` - Detail user
      * `PATCH /api/users/:id` - Update profil user

## 🤝 Kontribusi

Silakan buat **Pull Request** atau laporkan **Issue** jika Anda menemukan bug atau ingin menambahkan fitur baru.

-----

Happy Coding\! 🚀
