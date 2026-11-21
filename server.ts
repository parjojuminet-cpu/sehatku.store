import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// ===== Berita kesehatan: hanya dari RSS sumber nyata, tanpa konten buatan AI =====
type NewsSource = { name: string; url: string };

const NEWS_SOURCES: NewsSource[] = [
  { name: "Antara News", url: "https://www.antaranews.com/rss/kesehatan.xml" },
  { name: "detikHealth", url: "https://rss.detik.com/index.php/health" },
  { name: "Kemenkes RI", url: "https://kemkes.go.id/id/rss/article/rilis-berita" },
  { name: "Kemenkes RI", url: "https://kemkes.go.id/id/rss/article/tips-kesehatan" },
];
const NEWS_TTL_MS = 30 * 60 * 1000; // cache di memori instance
const NEWS_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // buang berita lebih dari 90 hari
const NEWS_PER_SOURCE = 6;
const NEWS_MAX_ITEMS = 12;
let newsCache: { items: any[]; at: number } | null = null;

const stripCdata = (v: string) => v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
const decodeEntities = (v: string) =>
  v.replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function classifyNews(title: string): string {
  const t = title.toLowerCase();
  if (/(obat|farmasi|vaksin|resep|bpom)/.test(t)) return "Edukasi Obat";
  if (/(kulit|skincare|cantik|wajah|jerawat)/.test(t)) return "Skincare";
  if (/(tips|gizi|diet|makanan|olahraga)/.test(t)) return "Tips Kesehatan Umum";
  return "Kabar Sehat";
}

async function fetchSingleRSS(src: NewsSource): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(src.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SehatkuBot/1.0; +https://sehatku.store)" },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const xml = await response.text();
    const blocks = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || [];
    const items: any[] = [];
    for (const block of blocks) {
      const pick = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
        return m ? stripCdata(m[1]) : "";
      };
      const title = decodeEntities(pick("title"));
      const link = decodeEntities(pick("link"));
      const desc = decodeEntities(pick("description").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
      const date = new Date(pick("pubDate"));
      // hanya tautan http(s) dan tanggal yang valid
      if (!title || !/^https?:\/\//i.test(link) || isNaN(date.getTime())) continue;
      items.push({
        type: "web",
        typeLabel: "Berita",
        sumber: src.name,
        icon: "fas fa-newspaper",
        bg: "linear-gradient(135deg,#10b981,#3b82f6)",
        category: classifyNews(title),
        title,
        tanggal: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }),
        tanggalISO: date.toISOString(),
        desc: desc.length > 150 ? desc.slice(0, 150) + "..." : desc,
        url: link,
        btnLabel: `Baca di ${src.name}`,
      });
      if (items.length >= NEWS_PER_SOURCE) break;
    }
    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// Ambil semua sumber paralel. Jika semua gagal, pakai salinan terakhir yang berhasil (nyata, bukan buatan).
async function getLiveNews(): Promise<any[]> {
  if (newsCache && Date.now() - newsCache.at < NEWS_TTL_MS) return newsCache.items;
  const settled = await Promise.allSettled(NEWS_SOURCES.map(fetchSingleRSS));
  const all = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((it) => Date.now() - Date.parse(it.tanggalISO) < NEWS_MAX_AGE_MS)
    .sort((a, b) => b.tanggalISO.localeCompare(a.tanggalISO));
  const seen = new Set<string>();
  const items: any[] = [];
  for (const it of all) {
    const key = it.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(it);
    if (items.length >= NEWS_MAX_ITEMS) break;
  }
  if (items.length > 0) {
    newsCache = { items, at: Date.now() };
    return items;
  }
  return newsCache ? newsCache.items : [];
}

function mergeArticles(live: any[], curated: any[]): any[] {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const it of [...live, ...curated]) {
    const key = String(it.title || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

async function loadCuratedArticles(): Promise<any[]> {
  try {
    const localDataPath = path.join(process.cwd(), "public", "data_edukasi.json");
    if (fs.existsSync(localDataPath)) return JSON.parse(fs.readFileSync(localDataPath, "utf-8"));
  } catch { /* abaikan */ }
  return [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Sehatku Store API" });
  });

  // API Route: Ambil Data Wilayah (dari WILAYAH_DATA internal untuk kecepatan)
  app.get("/api/wilayah", (req, res) => {
    res.json({ status: "success", data: [] });
  });

  // API Route: Gabungkan Berita Kesehatan Otomatis & Edukasi Lokal
  app.get("/api/articles", async (req, res) => {
    try {
      const [live, curated] = await Promise.all([getLiveNews(), loadCuratedArticles()]);
      res.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
      res.json(mergeArticles(live, curated));
    } catch (err) {
      console.error("Error serving aggregated articles:", err);
      res.json(await loadCuratedArticles());
    }
  });

  // API Route: Konsultasi/Asisten AI Sehatku (Server-side Gemini)
  app.post("/api/ai/consult", async (req, res) => {
    try {
      const { type, answers, biodata } = req.body;
      if (!type || !biodata) {
        return res.status(400).json({ error: "Data biodata dan kuesioner tidak lengkap" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback anggun jika API key belum dikonfigurasi di Settings
        return res.json({
          success: true,
          isPlaceholder: true,
          analysis: "Analisa awal berhasil diproses. Silakan hubungi apoteker kami melalui WhatsApp untuk konsultasi medis mendalam gratis."
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Anda adalah Asisten Apoteker & Dokter Konsultan Ahli dari "Sehatku Store", sebuah apotek online resmi berlisensi di Jawa Tengah.
Tugas Anda adalah menganalisis data kuesioner pengguna dan memberikan rekomendasi medis, pola makan/skincare, serta saran produk kesehatan secara personal, ramah, santun, ilmiah, dan mudah dimengerti.

DATA PASIEN:
- Nama: ${biodata.nama || "-"}
- Usia: ${biodata.umur || "-"} tahun
- Jenis Kelamin: ${biodata.jenkel || "-"}
- Pekerjaan: ${biodata.pekerjaan || "-"}

KATEGORI KONSULTASI: ${type === "diet" ? "Diet & Berat Badan" : "Kesehatan Kulit & Skincare"}

JAWABAN KUESIONER:
${JSON.stringify(answers, null, 2)}

BERIKAN TANGGAPAN dalam format JSON dengan struktur persis seperti berikut:
{
  "analysis": "Analisis mendalam, empatik, dan ilmiah tentang kondisi pasien.",
  "advice": "Langkah konkret, kebiasaan sehari-hari, pola makan, atau pola hidup yang harus diterapkan pasien.",
  "products": [
    {
      "name": "Nama produk rekomendasi yang umum (misal: Blackmores, Vitamin C, Gel Jerawat dsb)",
      "reason": "Mengapa produk ini cocok untuk kondisi mereka."
    }
  ]
}

Pastikan respons Anda murni berupa valid JSON tanpa dibungkus markdown \`\`\`json dsb agar mudah di-parse.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      // Bersihkan kemungkinan pembungkus markdown block
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJson);

      res.json({
        success: true,
        ...parsedData
      });

    } catch (error: any) {
      console.error("Gemini Consultation Error:", error);
      res.status(500).json({
        error: "Gagal memproses konsultasi AI",
        details: error.message || "Unknown error"
      });
    }
  });

  // Serve file statis dan Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
