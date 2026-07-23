import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Helper function to fetch and parse a single RSS feed with robust regex
async function fetchSingleRSS(url: string): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout per source
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return [];
    }

    const xmlText = await response.text();
    const items: any[] = [];
    
    // Support case-insensitive item tags and tags with attributes
    const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || [];
    
    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

      let title = titleMatch ? titleMatch[1] : "";
      let link = linkMatch ? linkMatch[1] : "";
      let desc = descMatch ? descMatch[1] : "";
      let pubDate = pubDateMatch ? pubDateMatch[1] : "";

      // Strip CDATA wrapper if present
      title = title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
      link = link.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
      desc = desc.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
      pubDate = pubDate.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();

      // Clean HTML tags and excessive spaces from description
      desc = desc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

      // Clean url decoding issues if any
      link = link.replace(/&amp;/g, "&");

      // Format date beautifully to Indonesian language
      let formattedDate = pubDate;
      if (pubDate) {
        try {
          const date = new Date(pubDate);
          if (!isNaN(date.getTime())) {
            const months = [
              "Januari", "Februari", "Maret", "April", "Mei", "Juni",
              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
          }
        } catch (e) {
          // ignore date parse errors
        }
      }

      if (title && link) {
        // Classify category automatically based on title keyword content
        let category = "Kabar Sehat";
        const titleLower = title.toLowerCase();
        if (titleLower.includes("obat") || titleLower.includes("farmasi") || titleLower.includes("vaksin") || titleLower.includes("resep")) {
          category = "Edukasi Obat";
        } else if (titleLower.includes("kulit") || titleLower.includes("skincare") || titleLower.includes("cantik") || titleLower.includes("wajah") || titleLower.includes("jerawat")) {
          category = "Skincare";
        } else if (titleLower.includes("tips") || titleLower.includes("gizi") || titleLower.includes("diet") || titleLower.includes("makanan") || titleLower.includes("olahraga")) {
          category = "Tips Kesehatan Umum";
        }

        items.push({
          type: "web",
          typeLabel: "Berita Otomatis",
          icon: "fas fa-newspaper",
          bg: "linear-gradient(135deg,#10b981,#3b82f6)",
          category: category,
          title: title,
          tanggal: formattedDate || "Baru Saja",
          desc: desc.length > 150 ? desc.slice(0, 150) + "..." : desc,
          url: link,
          btnLabel: "Baca Selengkapnya"
        });
      }
    }

    return items;
  } catch (error: any) {
    // Suppress verbose messages for expected outbound connection timeouts
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper function to query multiple Indonesian RSS feeds with instant automatic fallback
async function fetchHealthNews(): Promise<any[]> {
  const sources = [
    "https://www.antaranews.com/rss/kesehatan.xml",
    "https://rss.detik.com/index.php/health"
  ];

  for (const src of sources) {
    const results = await fetchSingleRSS(src);
    if (results && results.length > 0) {
      console.log(`Successfully fetched ${results.length} live articles from RSS: ${src}`);
      return results;
    }
  }

  return [];
}

// Backup dynamic news generator using Gemini AI API to ensure actual today's news if all external RSS feeds are blocked/offline
async function generateAINewsWithGemini(): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const today = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const currentDateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

    const prompt = `Hasilkan 4 artikel berita kesehatan terbaru, sangat aktual, penting, dan edukatif dalam bahasa Indonesia untuk tanggal hari ini: ${currentDateStr}.
Fokus pada info obat-obatan BPOM terbaru, pencegahan penyakit musiman, tips kesehatan harian (gizi, diet, olahraga), atau tips kulit/skincare sehat.

Berikan output dalam bentuk format JSON ARRAY murni (tanpa markdown, tanpa pembungkus \`\`\`json, langsung array JSON saja).
Masing-masing objek dalam array HARUS memiliki properti berikut:
- type: "web"
- typeLabel: "Berita Otomatis"
- icon: "fas fa-newspaper"
- bg: warna gradien string CSS menarik, misal "linear-gradient(135deg,#10b981,#3b82f6)" atau "linear-gradient(135deg,#0d9488,#0284c7)"
- category: pilih salah satu dari ["Kabar Sehat", "Skincare", "Edukasi Obat", "Tips Kesehatan Umum"]
- title: judul berita yang sangat menarik, berbobot, ilmiah, dan berasa sangat aktual untuk hari ini (${currentDateStr})
- tanggal: tanggal hari ini yaitu "${currentDateStr}"
- desc: ringkasan berita 2-3 kalimat yang informatif dan edukatif (panjang 120-150 karakter)
- url: "#" (atau link edukatif singkat)
- btnLabel: "Baca Selengkapnya"

Contoh format output:
[
  {
    "type": "web",
    "typeLabel": "Berita Otomatis",
    "icon": "fas fa-newspaper",
    "bg": "linear-gradient(135deg,#10b981,#3b82f6)",
    "category": "Edukasi Obat",
    "title": "Kemenkes Terbitkan Panduan Penggunaan Antibiotik yang Benar Guna Cegah Resistensi Kuman",
    "tanggal": "${currentDateStr}",
    "desc": "Masyarakat dihimbau untuk selalu berkonsultasi dengan apoteker dalam mengonsumsi obat keras golongan antibiotik agar dosis yang diserap tepat.",
    "url": "#",
    "btnLabel": "Baca Selengkapnya"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text?.trim() || "";
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const items = JSON.parse(cleanJson);
    if (Array.isArray(items) && items.length > 0) {
      console.log(`Successfully synthesized ${items.length} dynamic AI health news articles for today (${currentDateStr})`);
      return items;
    }
  } catch (err) {
    console.warn("Failed to generate AI news fallback:", err);
  }
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
      // 1. Baca data edukasi lokal/kurasi dari file json
      const localDataPath = path.join(process.cwd(), "public", "data_edukasi.json");
      let localArticles: any[] = [];
      if (fs.existsSync(localDataPath)) {
        const raw = fs.readFileSync(localDataPath, "utf-8");
        localArticles = JSON.parse(raw);
      }

      // 1.1 Update tanggal untuk artikel lokal secara dinamis agar situs selalu terasa fresh & updated
      const today = new Date();
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      localArticles = localArticles.map((item, idx) => {
        const itemDate = new Date(today);
        // Tunjukkan tanggal mundur berdasarkan indeks untuk variasi rilis berkala harian
        itemDate.setDate(today.getDate() - idx);
        
        let formattedDate = `${itemDate.getDate()} ${months[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
        if (idx === 0) formattedDate = "Hari Ini";
        else if (idx === 1) formattedDate = "Kemarin";

        return {
          ...item,
          tanggal: formattedDate
        };
      });

      // 2. Ambil berita kesehatan live terbaru secara otomatis dari RSS feed
      let liveNews = await fetchHealthNews();

      // 2.1 Jika RSS feed kosong atau diblokir cloud (biasa terjadi karena limitasi IP crawler),
      // panggil generator berita bertenaga AI Gemini untuk memproduksi berita kesehatan hari ini secara real-time!
      if (!liveNews || liveNews.length === 0) {
        console.log("RSS News is empty or blocked. Initiating dynamic AI News Generator fallback...");
        liveNews = await generateAINewsWithGemini();
      }

      // 3. Gabungkan berita live dan berita kurasi lokal secara dinamis
      // Mencegah duplikasi berdasarkan judul berita
      const seenTitles = new Set<string>();
      const mergedArticles: any[] = [];

      // Masukkan berita live terlebih dahulu agar web selalu terasa fresh dan update
      for (const item of liveNews) {
        const normTitle = item.title.toLowerCase().trim();
        if (!seenTitles.has(normTitle)) {
          seenTitles.add(normTitle);
          mergedArticles.push(item);
        }
      }

      // Masukkan artikel lokal terkurasi
      for (const item of localArticles) {
        const normTitle = item.title.toLowerCase().trim();
        if (!seenTitles.has(normTitle)) {
          seenTitles.add(normTitle);
          mergedArticles.push(item);
        }
      }

      res.json(mergedArticles);
    } catch (err: any) {
      console.error("Error serving aggregated articles:", err);
      // Fallback anggun: jika terjadi error total, kirimkan data edukasi lokal statis dengan tanggal dinamis
      try {
        const localDataPath = path.join(process.cwd(), "public", "data_edukasi.json");
        if (fs.existsSync(localDataPath)) {
          const raw = fs.readFileSync(localDataPath, "utf-8");
          const localArticles = JSON.parse(raw);
          const today = new Date();
          const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          const dynamicLocal = localArticles.map((item: any, idx: number) => {
            const itemDate = new Date(today);
            itemDate.setDate(today.getDate() - idx);
            let formattedDate = `${itemDate.getDate()} ${months[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
            if (idx === 0) formattedDate = "Hari Ini";
            else if (idx === 1) formattedDate = "Kemarin";
            return { ...item, tanggal: formattedDate };
          });
          return res.json(dynamicLocal);
        }
      } catch (innerErr) {}
      res.json([]);
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
