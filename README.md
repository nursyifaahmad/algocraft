# ⚡ AlgoCraft: Inovasi Gamifikasi Problem Based Learning (PBL) Kelas X-5

Platform web gamifikasi edukatif yang dirancang secara khusus untuk pembelajaran berpikir komputasional materi **Algoritma dan Pemrograman (Fase E - Kelas X-5)** dengan model **Problem Based Learning (PBL)** dan konteks autentik **"Ekosistem Kantin Digital Pintar"**.

Aplikasi ini responsif multi-perangkat (PC, Laptop, tablet, Android, dan iOS) serta siap di-deploy secara mandiri (*self-hosted*) menggunakan Docker Compose pada mini PC server Anda.

---

## 🎯 6 Indikator Ketercapaian Tujuan Pembelajaran (IKTP)

1. **TP 1 (IPO):** Siswa mampu mengidentifikasi elemen **Input, Proses, dan Output** permasalahan kasir kantin dengan ketepatan $\ge 75\%$.
2. **TP 2 (Langkah Algoritma):** Siswa mampu menyusun langkah algoritma transaksi secara logis dan sistematis dengan skor minimal **3 dari skala 4**.
3. **TP 3 (Logika Percabangan):** Siswa mampu menerapkan logika percabangan kondisi diskon & saldo (`IF-THEN-ELSE`) dengan ketepatan minimal **75%**.
4. **TP 4 (Diagram Alir / Flowchart):** Siswa mampu merepresentasikan diagram alir pada kanvas bebas ramah layar sentuh dengan skor minimal **3 dari skala 4**.
5. **TP 5 (Pseudocode):** Siswa mampu menyusun baris kode semu dan kedalaman indentasi dengan metode **Parson's Problems** (skor minimal **3 dari skala 4**).
6. **TP 6 (Data Uji & Debugging):** Siswa mampu menguji data, menemukan *bug*, dan memperbaiki kode kasir dengan ketepatan minimal **75%**.

---

## 🎮 Fitur Gamifikasi Terpadu

- ❤️ **3 Nyawa (Hearts):** Mendorong siswa berpikir sebelum men-submit (mencegah tebakan asal-asalan).
- 🪙 **Koin Pintar:** Didapat dari setiap misi tuntas, digunakan untuk membuka **Petunjuk Berbayar (Hints)**.
- ⚡ **XP & Level:** Akumulasi poin pengalaman belajar untuk membuka level tantangan berikutnya.
- 🏆 **7 Lencana Prestasi (Badges):** Termasuk *"Logika Presisi"*, *"Arsitek Algoritma"*, *"Master Percabangan"*, hingga *"Grandmaster Kantin Pintar"*.
- 🥇 **Leaderboard Kelas Real-Time:** Membangun antusiasme dan kompetisi sehat antar siswa kelas X-5.

---

## 👨‍🏫 Fitur Dashboard Guru & Asesmen PPG

- 📊 **Monitoring Real-Time:** Memantau kemajuan pengerjaan siswa secara langsung di kelas.
- 📈 **Analisis 6 IKTP Otomatis:** Menghitung persentase ketuntasan kelas ($\ge 75\%$) dan rata-rata rubrik skala 4.
- 📥 **Ekspor Nilai Excel / CSV:** Unduh rekapitulasi nilai untuk portofolio asesmen PPG dengan sekali klik.
- 🖨️ **Cetak Format Laporan:** Siap cetak PDF / kertas A4 untuk bukti lampiran inovasi pembelajaran.

---

## 💻 Menjalankan di Laptop Lokal (Development)

```bash
# 1. Masuk ke folder proyek
cd AlgoCraft

# 2. Sinkronkan database lokal (SQLite)
npx prisma db push

# 3. Masukkan data awal guru & sesi X-5
node scripts/seed.js

# 4. Jalankan server development
npm run dev
```

Buka browser di `http://localhost:3000`.
- **Akses Siswa:** Masukkan Nama, Nomor Absen, dan Kode Sesi `X5-KANTIN`.
- **Akses Guru:** Buka Portal Pengajar, login dengan username: `guru` | password: `guru123`.

---

## 🚀 Alur Sinkronisasi GitHub Otomatis

### Di Komputer Pengembang (Laptop):
Anda dapat mengunggah setiap perubahan ke GitHub dengan satu perintah:
```bash
npm run sync
```
*Atau cukup klik dua kali file `sync.bat` di folder proyek.*

---

## 🌐 Panduan Deployment ke Mini PC Server (`syifaserver`)

### 1. Hubungkan ke Server via Tailscale SSH
```bash
ssh ahmad@100.98.183.112
```

### 2. Siapkan Folder di `/mnt/storage2`
```bash
sudo mkdir -p /mnt/storage2/algocraft
sudo chown -R $USER:$USER /mnt/storage2/algocraft
cd /mnt/storage2/algocraft
```

### 3. Clone Repositori dari GitHub
```bash
git clone https://github.com/nursyifaahmad/algocraft.git .
```

### 4. Konfigurasi File `.env` di Server
Buat file `.env` di `/mnt/storage2/algocraft/.env`:
```env
DATABASE_URL="postgresql://algocraft_user:rahasia_algocraft_123@algocraft-db:5432/algocraft_db"
DB_PASSWORD="rahasia_algocraft_123"
JWT_SECRET="kunci_rahasia_jwt_algocraft_2026_super_aman"
NODE_ENV="production"
PORT=3060
BASE_URL="https://algocraft.ahmadnursyifa.my.id"
```

### 5. Jalankan Docker Compose Pertama Kali
```bash
docker compose up -d --build
```
> Container `algocraft-app` akan berjalan di port **`3060`** dan database PostgreSQL diisolasi di folder `/mnt/storage2/algocraft/postgres_data`.

---

## ⚡ Skrip Pembaruan Satu Perintah di Server (`update.sh`)

Setiap kali Anda selesai melakukan `npm run sync` dari laptop, di server mini PC Anda cukup menjalankan:
```bash
cd /mnt/storage2/algocraft
./update.sh
```
Skrip ini akan otomatis:
1. Menarik kode terbaru dari GitHub (`git pull`).
2. Membangun ulang container (`docker compose up -d --build`).
3. Menjalankan auto-sync migrasi database Prisma.
4. Membersihkan sisa image lama (`docker image prune -f`).
5. Web langsung online kembali di port 3060!

---

## 🌐 Menghubungkan ke Cloudflare Tunnel

1. Buka [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Masuk ke **Networks** > **Tunnels** > Pilih tunnel Anda (`syifaserver`).
3. Di tab **Public Hostnames**, klik **Add a public hostname**:
   - **Subdomain:** `algocraft`
   - **Domain:** `ahmadnursyifa.my.id`
   - **Type:** `HTTP`
   - **URL:** `localhost:3060`
4. Klik **Save hostname**.

Siswa dan pengajar kini dapat mengakses **AlgoCraft** dari mana saja melalui:
👉 **`https://algocraft.ahmadnursyifa.my.id`**
