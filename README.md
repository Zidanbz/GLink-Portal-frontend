# GLink Portal Frontend

Next.js untuk pengajuan izin, cuti, dan perjalanan dinas.

```bash
npm ci
npm run dev
```

Development: http://localhost:3000. Route `/api/*` dan `/uploads/*` diproxy ke backend http://127.0.0.1:5101. Jalankan backend pada port tersebut.

```bash
npm run build
npm start -- --hostname 127.0.0.1 --port 3100
```

Production memakai port 3100 agar tidak bentrok dengan company profile server. Backend dipasang sebagai repository terpisah dengan nama folder `GLink Portal-Backend`, berdampingan dengan folder frontend `GLink Portal-frontend`.

Konfigurasi systemd, script deploy, dan dokumentasi GitHub/server dikelola dalam repository [GLink-Portal-backend](https://github.com/Zidanbz/GLink-Portal-backend), pada folder `deploy/` dan `docs/`. Akses awal melalui SSH tunnel; aplikasi belum memiliki login dan otorisasi per pengguna.

## Backend Firebase di Vercel

Gunakan `.env.example` untuk environment server. `BACKEND_URL` menunjuk deployment backend dan `BACKEND_API_SECRET` harus sama pada kedua project. Akses Vercel memerlukan `APP_ACCESS_USER` dan `APP_ACCESS_PASSWORD`. Semua nilai tetap di server, tanpa prefix `NEXT_PUBLIC_`. Panduan lengkap ada di repository backend, `docs/FIREBASE_VERCEL.md`. Tanpa environment ini, development lokal tetap meneruskan API ke `127.0.0.1:5101`.
