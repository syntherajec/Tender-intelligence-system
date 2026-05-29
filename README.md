# Tender Intelligence System (TIS) v2.4.1

Platform Analitik Tender Profesional untuk Kontraktor Indonesia.

---

## 🚀 Deploy ke Cloudflare Pages (Tanpa Terminal)

### Step 1 — Upload ke GitHub lewat browser

1. Buka **github.com** → login
2. Klik **"+"** → **New repository**
3. Kasih nama repo → klik **Create repository**
4. Di halaman repo → klik **"uploading an existing file"**
5. **Drag semua isi folder** `tender-intelligence` ke browser
6. Klik **Commit changes**

### Step 2 — Sambungkan ke Cloudflare Pages

1. Buka **pages.cloudflare.com** → login
2. Klik **Create a project** → **Connect to Git**
3. Pilih repo yang baru dibuat
4. Isi pengaturan build:

| Setting | Value |
|---|---|
| Framework preset | **Next.js** |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |

5. Scroll ke **Environment Variables**, tambahkan:

| Name | Value |
|---|---|
| `NEXTAUTH_SECRET` | random string 32+ karakter bebas |
| `NEXTAUTH_URL` | `https://nama-proyek.pages.dev` |
| `NODE_VERSION` | `18` |

6. Klik **Save and Deploy** → tunggu 2-3 menit

---

## Login Default

| Role | Email | Password |
|---|---|---|
| Admin | admin@tendersystem.id | password |
| Analyst | analyst@tendersystem.id | password |

> ⚠️ Ganti password di production lewat environment variable `ADMIN_PASSWORD`

---

## Environment Variables

```env
NEXTAUTH_SECRET=   # wajib, min 32 karakter
NEXTAUTH_URL=      # wajib, URL domain Cloudflare Pages
OPENROUTER_API_KEY=  # opsional, untuk AI enhancement
ADMIN_PASSWORD=    # opsional, password admin custom
```

---

## Deploy ke Vercel (Alternatif, Lebih Mudah)

1. Buka **vercel.com** → login
2. Klik **Add New Project** → Import dari GitHub
3. Isi environment variables yang sama
4. Klik **Deploy**

---

© 2025 PT. Tender Intelligence Indonesia
