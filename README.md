# Sehatku Store

Katalog dan layanan konsultasi apotek online (React + Vite + Express, deploy di Vercel). Pemesanan berakhir di WhatsApp.

## Menjalankan lokal
1. `npm install`
2. Salin `.env.example` menjadi `.env.local`, isi `GEMINI_API_KEY` (opsional: `GEMINI_MODEL`).
3. `npm run dev`

## Deploy (Vercel)
Isi `GEMINI_API_KEY` (dan `GEMINI_MODEL` bila perlu) di Environment Variables. Tanpa key, Cek Kebutuhan tetap berjalan dengan hasil berbasis aturan.

## Yang sering diubah
- **Produk dan harga:** `public/csvjson.json` (`nama`, `harga`, `kategori`, `img`). Foto di `public/<kategori>/` dalam format WebP.
- **Artikel edukasi:** `public/data_edukasi.json`. Hanya masukkan tautan artikel yang spesifik dan sudah dicek. Berita terbaru diambil otomatis dari RSS (Antara, detikHealth, Kemenkes).
- **Izin apotek di footer:** konstanta `PHARMACY_INFO` di `src/App.tsx` (nomor SIA, apoteker penanggung jawab, SIPA).
- **Testimoni:** `SHOW_TESTIMONIALS` di `src/App.tsx`. Hanya tampilkan ulasan pelanggan nyata.

## Catatan teknis
- `/api/ai/consult`: rate limit 5 permintaan per IP per 10 menit, disimpan di memori instance. Untuk batas yang ketat di serverless, gunakan Redis/KV.
- `api/index.ts` (Vercel) dan `server.ts` (lokal) memuat logika yang sama; ubah keduanya bersamaan.
