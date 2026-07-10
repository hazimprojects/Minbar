# Minbar

Aplikasi pentadbiran Biro Pendidikan Masjid + Laporan Bendahari — dipisahkan
daripada Sistem ALC (asalnya modul "tumpang" dalam sistem tuisyen tu).

## Setup

1. **Supabase** — cipta projek baharu, jalankan `supabase/migrations/00000000_skema_asas.sql`
   dalam SQL Editor.
2. **Pengguna admin** — Supabase Dashboard → Authentication → Add user (emel + kata laluan).
   Semua pengguna authenticated ada akses penuh (tiada tier Owner/Admin — sepadan
   dengan penggunaan sebenar: ahli jawatankuasa, semua dipercayai sama rata).
3. **Env** — salin `.env.example` ke `.env`, isi `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
   (Supabase Dashboard → Settings → API).
4. `npm install && npm run dev`

## Portal Awam — Laporan Bendahari

Token dijana automatik semasa migrasi (jadual `tetapan`, lajur `bendahari_token`).
Link kongsi: `https://<domain>/?bendahari=<token>`. Boleh dapatkan link ni dari
dalam app (log masuk admin → Biro Pendidikan → pratonton Bendahari).

## Struktur

- `src/pages/BiroPendidikan.jsx` — skrin utama (jadual bulanan, penceramah, pengisian/kitab)
- `src/pages/LaporanBendahari.jsx` — portal awam (token-gated, tiada log masuk)
- `src/pages/Login.jsx` — log masuk admin (Supabase Auth, emel+kata laluan)
- Storage bucket `penceramah` — gambar penceramah (bacaan awam, tulis admin sahaja)

## Berbeza daripada Sistem ALC

Log masuk guna **Supabase Auth sebenar** (bukan corak RPC + caller_id sistem-alc) —
RLS terus semak `auth.role() = 'authenticated'`, tiada keperluan "kunci" setiap
RPC/jadual satu-satu macam yang terpaksa dibuat untuk sistem-alc (rujuk K6-K8
dalam sejarah git sistem-alc untuk konteks kenapa ni penting).
