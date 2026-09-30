# Asesmen SMPN 7 Pasuruan - Sistem CBT Ujian Berbasis Komputer

Aplikasi web Computer Based Test (CBT) profesional untuk simulasi dan pelaksanaan asesmen SMPN 7 Pasuruan. Dibangun dengan React 19, TypeScript, Tailwind CSS, serta integrasi penuh ke **Supabase** (PostgreSQL, Auth, Realtime, Storage, dan RLS Policies) dengan fallback engine offline-resilient autosave.

---

## 1. Peran Pengguna (Role-Based Access Control / RBAC)

Aplikasi memiliki 8 jenis peran dengan hak akses terisolasi:

1. **Super Admin**: Konfigurasi global multi-sekolah, audit log, dan skema database.
2. **Admin Sekolah**: Pengelolaan SMPN 7 Pasuruan, rombel kelas, peserta, guru, paket ujian, dan jadwal.
3. **Operator**: Pendaftaran peserta, import data Excel, dan cetak kartu peserta.
4. **Proktor**: Pengawasan realtime, monitoring sisa waktu & progress, reset sesi peserta, perpanjang waktu, force submit, dan aktivasi token ujian.
5. **Teknisi**: Pemantauan kesehatan server (System Health), latensi jaringan, error log console, dan audit perangkat klien.
6. **Guru / Penyusun Soal**: Pengelolaan bank soal (6 tipe soal), kisi-kisi, level kognitif (L1–L3), import soal dari Excel, dan penilaian manual uraian.
7. **Pengawas Ruang**: Monitoring tata tertib ruangan dan presensi kehadiran.
8. **Peserta (Siswa)**: Portal ujian CBT fokus, timer tersinkronisasi, autosave, font size & kontras aksesibilitas, ragu-ragu, dan rekap hasil simulasi.

---

## 2. Kredensial Akun Demo (1-Klik Auto-Fill di UI)

| Peran | Username / Email | Password / PIN | Catatan |
|---|---|---|---|
| **Peserta (Siswa)** | `04-001-001-8` | `123456` | Ahmad Fauzi Rahman (Kelas IX A SMPN 7 Pasuruan) |
| **Peserta (Khusus)** | `04-001-003-6` | `123456` | Bima Satria (+15m Aksesibilitas) |
| **Proktor** | `proktor@smpn7pasuruan.sch.id` | `Proktor123!` | Ruang Monitoring Proktor |
| **Admin Sekolah** | `admin@smpn7pasuruan.sch.id` | `Admin123!` | Manajemen Data & Asesmen |
| **Guru** | `guru.matematika@smpn7pasuruan.sch.id` | `Guru123!` | Bank Soal & Penilaian Uraian |
| **Teknisi** | `teknisi@smpn7pasuruan.sch.id` | `Teknisi123!` | System Health & Diagnostics |
| **Super Admin** | `superadmin@smpn7pasuruan.sch.id` | `Admin123!` | Kendali Sistem Penuh |

*Token Aktif Bawaan*: **`SPANJU1`** (Simulasi 1) atau **`SPANJU26`** (Ujian Utama).

---

## 3. Fitur Utama CBT Peserta

- **Timer Tersinkronisasi**: Countdown waktu dari server, peringatan warna kuning (sisa 15 menit), merah berdenyut (sisa 5 menit), dan auto-submit saat waktu habis.
- **Autosave Idempotent & Offline Sync**: Indikator status `🟢 Tersimpan`, `🟡 Menyimpan...`, dan `🔴 Offline (Tersimpan Lokal)`. Jawaban tetap aman jika browser di-refresh atau koneksi drop.
- **6 Format Soal**:
  1. Pilihan Ganda (PG)
  2. Pilihan Ganda Kompleks (Checkboxes)
  3. Benar / Salah Matrix
  4. Menjodohkan (Matching Pairs)
  5. Isian Singkat
  6. Uraian / Essay (dengan rubrik nilai guru)
- **Aksesibilitas**: Pengaturan ukuran font (Normal, Sedang, Besar) dan tema kontras (Default Terang, Gelap Kontras Tinggi, Sepia).
- **Anti-Cheat Deteksi**: Peringatan saat berpindah tab atau meminimalkan fullscreen, serta pencatatan otomatis ke Audit Log proktor.
- **Kartu Peserta Digital**: Format resmi kartu ujian berfoto, NISN, PIN, nomor peserta, barcode, dan tanda tangan kepala sekolah siap cetak / simpan PDF (`@media print`).

---

## 4. Konfigurasi Supabase & Database PostgreSQL

File skema dan migrasi lengkap tersedia pada menu **Database Supabase SQL** di dalam aplikasi atau dapat disalin dari `/src/data/sqlMigration.ts`.

### Langkah Menjalankan di Supabase:
1. Buka dashboard proyek Supabase Anda.
2. Buka menu **SQL Editor** -> **New Query**.
3. Salin seluruh isi dari `cbt_tka_smp_supabase_migration.sql` dan klik **Run**.
4. Di aplikasi, klik tombol **Supabase DB** pada navbar atas untuk memasukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`, lalu klik **Simpan & Tes Koneksi**.
