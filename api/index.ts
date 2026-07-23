import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
app.use(express.json());

// Robust backup data embed to ensure zero downtime on serverless environments if file reading is restricted
const FALLBACK_ARTICLES = [
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Headline: Gila! Earbud 2026 Bisa Kontrol HP Pakai Gerakan Rahang, Bye Layar Sentuh!",
    "tanggal": "28 April 2025",
    "desc": "Tahun 2026 membawa tren teknologi gila: earbud pintar yang dikendalikan lewat gerakan rahang! Tanpa sentuhan tangan, kamu cukup mengatupkan gigi untuk ganti lagu atau angkat telepon. #demak #blora #batang #tegal #boyolali.",
    "url": "https://trenggaleknjenggelek.jawapos.com/lifestyle/2603090061/teknologi-gadget-2026-makin-gila-dari-earbud-pengendali-perangkat-pakai-gerakan-rahang-hingga-patch-keringat-pengganti-tes-darah",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Ilmuwan Berhasil Ngobrol dengan Tanaman Lewat HP, Bisa Suruh Nutup Daun!",
    "tanggal": "28 April 2025",
    "desc": "Ilmuwan Singapura menciptakan sejarah dengan mengembangkan perangkat yang mampu mengirim sinyal listrik ke tanaman. Melalui smartphone, tanaman bisa diperintah untuk menutup daunnya secara instan #salatiga #ambarawa #secang #wonosobo #kudus.",
    "url": "https://www.straitstimes.com/singapore/ntu-scientists-develop-device-that-can-send-electrical-signals-to-and-from-plants",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Candu Pornografi, Retas Neurokognisi",
    "tanggal": "28 April 2025",
    "desc": "Banyak anak tidak sedang mencari pornografi. Mereka sering hanya tersandung. Iklan, tautan jebakan, rekomendasi, grup chat, atau satu kata pencarian yang meleset. Internet bukan perpustakaan yang rapi #semarang #ungaran #jateng #solo #kudus.",
    "url": "https://ayosehat.kemkes.go.id/candu-pornografi-retas-neurokognisi",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Harga Obat Terancam Naik Imbas Konflik Global, Ini Penjelasan BPOM",
    "tanggal": "24 April 2025",
    "desc": "Harga obat berpotensi mengalami tekanan kenaikan di tengah konflik global yang sedang berlangsung. Perang antara Iran melawan Amerika Serikat dan Israel dinilai dapat memicu gangguan pasokan. info kesehatan untuk warga cilacap,pemalang,jepara,jateng.",
    "url": "https://health.kompas.com/read/26D21173200368/harga-obat-terancam-naik-imbas-konflik-global-ini-penjelasan-bpom",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Kalau Tak Hati-hati, 7 Buah Ini Bikin Gula Darah Cepat Naik",
    "tanggal": "24 April 2025",
    "desc": "Di tengah konsumsi buah di Indonesia yang masih rendah, munculnya pesan yang terkesan menakut-anakuti justru bisa membuat orang makin ragu untuk makan buah. info kesehatan untuk warga purwodadi,blora,magelang,jateng.",
    "url": "https://health.detik.com/diet/d-8450765/kalau-tak-hati-hati-7-buah-ini-bikin-gula-darah-cepat-naik",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Buah Utuh vs Jus: Apa Bedanya di Tubuh?",
    "tanggal": "24 April 2025",
    "desc": "Sekilas, jus buah dan buah utuh berasal dari bahan yang sama. Tapi di dalam tubuh, efeknya bisa berbeda, terutama pada gula darah.info kesehatan untuk warga salatiga,demak,kudus,pati,kab. semarang,jateng.",
    "url": "https://health.detik.com/diet/d-8451121/kenapa-buah-potong-lebih-sehat-dibanding-jus-begini-teorinya",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Tips Gizi Seimbang & Diet Real Food",
    "tanggal": "24 April 2025",
    "desc": "Portal Detik Health sering membagikan panduan praktis mengenai nutrisi, terutama cara menghindari makanan ultra-proses (UPF) yang sedang menjadi perhatian besar tahun ini. info kesehatan untuk warga semarang, kab. semarang, jateng.",
    "url": "https://health.detik.com/diet",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-spa",
    "bg": "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "category": "Skincare",
    "title": "Panduan Lengkap Skincare Rutin Pagi & Malam untuk Pemula",
    "tanggal": "23 April 2025",
    "desc": "Mulai skincare tidak harus mahal. Pelajari urutan produk yang benar — dari cleanser, toner, moisturizer, hingga sunscreen — agar kulit wajah tetap sehat dan glowing setiap hari.",
    "url": "https://www.halodoc.com/artikel/skincare-routine",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-sun",
    "bg": "linear-gradient(135deg,#f9d423,#ff4e50)",
    "category": "Skincare",
    "title": "Sunscreen: Kenapa Wajib Dipakai Setiap Hari Meski di Dalam Rumah?",
    "tanggal": "20 April 2025",
    "desc": "Paparan sinar UV tidak hanya terjadi saat di luar ruangan. Cahaya dari jendela dan layar HP juga memengaruhi kulit. Simak penjelasan lengkap tentang pentingnya sunscreen harian.",
    "url": "https://www.alodokter.com/manfaat-sunscreen",
    "btnLabel": "Baca di Alodokter"
  },
  {
    "type": "yt",
    "typeLabel": "YouTube",
    "icon": "fab fa-youtube",
    "bg": "linear-gradient(135deg,#ff6b6b,#ee0979)",
    "category": "Edukasi Obat",
    "title": "Cara Menggunakan Obat yang Benar dan Aman — Penjelasan Apoteker",
    "tanggal": "17 April 2025",
    "desc": "Banyak orang salah dalam mengonsumsi obat. Video ini menjelaskan aturan minum obat, perbedaan sebelum/sesudah makan, serta bahaya penggunaan obat sembarangan.",
    "url": "https://www.youtube.com/watch?v=-E0Brk3Fy5s",
    "btnLabel": "Tonton di YouTube"
  },
  {
    "type": "web",
    "typeLabel": "Artikel",
    "icon": "fas fa-heartbeat",
    "bg": "linear-gradient(135deg,#43e97b,#38f9d7)",
    "category": "Tips Kesehatan Umum",
    "title": "7 Kebiasaan Sehat Sederhana yang Bisa Dilakukan Setiap Hari",
    "tanggal": "15 April 2025",
    "desc": "Kesehatan bukan soal olahraga berat atau diet ekstrem. Cukup dengan 7 kebiasaan kecil ini — mulai dari minum air putih cukup hingga tidur teratur — tubuh Anda akan terasa lebih bugar.",
    "url": "https://www.halodoc.com/artikel/kebiasaan-hidup-sehat",
    "btnLabel": "Baca Artikel"
  },
  {
    "type": "web",
    "typeLabel": "Berita",
    "icon": "fas fa-newspaper",
    "bg": "linear-gradient(135deg,#0d9488,#0284c7)",
    "category": "Kabar Sehat",
    "title": "Kemenkes Targetkan Pemeriksaan Kesehatan Gratis (Medical Check-up) Bagi Semua Warga Mulai 2026",
    "tanggal": "22 Juni 2026",
    "desc": "Program skrining kesehatan gratis dari Kementerian Kesehatan RI difokuskan untuk mendeteksi dini penyakit kritis seperti kanker, jantung, dan stroke di puskesmas seluruh Indonesia.",
    "url": "https://ayosehat.kemkes.go.id/",
    "btnLabel": "Baca Berita Kemenkes"
  }
];

// Helper to fetch and parse a single RSS feed with robust regex
async function fetchSingleRSS(url: string): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });

    if (!response.ok) return [];

    const xmlText = await response.text();
    const items: any[] = [];
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

      title = title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
      link = link.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
      desc = desc.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
      pubDate = pubDate.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();

      desc = desc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      link = link.replace(/&amp;/g, "&");

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
        } catch (e) {}
      }

      if (title && link) {
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
          category,
          title,
          tanggal: formattedDate || "Baru Saja",
          desc: desc.length > 150 ? desc.slice(0, 150) + "..." : desc,
          url: link,
          btnLabel: "Baca Selengkapnya"
        });
      }
    }
    return items;
  } catch (error) {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fetch from multiple live sources
async function fetchHealthNews(): Promise<any[]> {
  const sources = [
    "https://www.antaranews.com/rss/kesehatan.xml",
    "https://rss.detik.com/index.php/health"
  ];
  for (const src of sources) {
    const results = await fetchSingleRSS(src);
    if (results && results.length > 0) {
      return results;
    }
  }
  return [];
}

// Generate fallback AI news articles using Gemini API
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
- bg: warna gradien string CSS menarik, misal "linear-gradient(135deg,#10b981,#3b82f6)"
- category: pilih salah satu dari ["Kabar Sehat", "Skincare", "Edukasi Obat", "Tips Kesehatan Umum"]
- title: judul berita menarik dan aktual untuk hari ini (${currentDateStr})
- tanggal: tanggal hari ini yaitu "${currentDateStr}"
- desc: ringkasan berita 2-3 kalimat yang informatif dan edukatif (panjang 120-150 karakter)
- url: "#"
- btnLabel: "Baca Selengkapnya"`;

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
      return items;
    }
  } catch (err) {
    console.warn("Failed to generate AI news fallback inside serverless function:", err);
  }
  return [];
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Sehatku Store Serverless API", platform: "Vercel" });
});

app.get("/api/wilayah", (req, res) => {
  res.json({ status: "success", data: [] });
});

app.get("/api/articles", async (req, res) => {
  try {
    let localArticles: any[] = [];
    const localDataPath = path.join(process.cwd(), "public", "data_edukasi.json");
    
    if (fs.existsSync(localDataPath)) {
      const raw = fs.readFileSync(localDataPath, "utf-8");
      localArticles = JSON.parse(raw);
    } else {
      localArticles = FALLBACK_ARTICLES;
    }

    const today = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    localArticles = localArticles.map((item, idx) => {
      const itemDate = new Date(today);
      itemDate.setDate(today.getDate() - idx);
      let formattedDate = `${itemDate.getDate()} ${months[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
      if (idx === 0) formattedDate = "Hari Ini";
      else if (idx === 1) formattedDate = "Kemarin";

      return {
        ...item,
        tanggal: formattedDate
      };
    });

    let liveNews = await fetchHealthNews();
    if (!liveNews || liveNews.length === 0) {
      liveNews = await generateAINewsWithGemini();
    }

    const seenTitles = new Set<string>();
    const mergedArticles: any[] = [];

    for (const item of liveNews) {
      const normTitle = item.title.toLowerCase().trim();
      if (!seenTitles.has(normTitle)) {
        seenTitles.add(normTitle);
        mergedArticles.push(item);
      }
    }

    for (const item of localArticles) {
      const normTitle = item.title.toLowerCase().trim();
      if (!seenTitles.has(normTitle)) {
        seenTitles.add(normTitle);
        mergedArticles.push(item);
      }
    }

    res.json(mergedArticles);
  } catch (err) {
    res.json(FALLBACK_ARTICLES);
  }
});

app.post("/api/ai/consult", async (req, res) => {
  try {
    const { type, answers, biodata } = req.body;
    if (!type || !biodata) {
      return res.status(400).json({ error: "Data biodata dan kuesioner tidak lengkap" });
    }

    // Dynamic rule-based backup response generator to ensure the user ALWAYS gets a complete, extremely detailed explanation
    const weightVal = parseFloat(answers.weight) || 0;
    const heightVal = parseFloat(answers.height) || 0;
    let imtText = "";
    let imtNum = 0;
    if (weightVal > 0 && heightVal > 0) {
      const heightM = heightVal / 100;
      imtNum = parseFloat((weightVal / (heightM * heightM)).toFixed(1));
      let imtCat = "";
      if (imtNum < 18.5) imtCat = "Kekurangan Berat Badan (Underweight)";
      else if (imtNum < 25) imtCat = "Berat Badan Normal (Ideal)";
      else if (imtNum < 30) imtCat = "Kelebihan Berat Badan (Overweight)";
      else imtCat = "Obesitas (Obesity)";
      imtText = `Indeks Massa Tubuh (IMT) Anda saat ini adalah ${imtNum} kg/m² yang dikategorikan sebagai ${imtCat}. `;
    }

    let defaultAnalysis = "";
    let defaultAdvice = "";
    let defaultProducts: { name: string; reason: string }[] = [];

    if (type === "diet") {
      const goalStr = answers.goal || "kesehatan umum";
      const habitStr = answers.habit || "makan kurang teratur";
      const waterStr = answers.water || "kurang minum";
      const activityStr = answers.activity || "sedentary";
      const medicalStr = answers.medical || "tidak ada riwayat";

      defaultAnalysis = `Berdasarkan data kuesioner medis, Kak ${biodata.nama} (${biodata.umur} tahun, ${biodata.jenkel}) memiliki tujuan utama untuk "${goalStr}". ${imtText}Aktivitas fisik Anda berada pada level "${activityStr}" dengan kebiasaan makan berupa "${habitStr}". \n\nKombinasi pola makan ini jika dipadukan dengan asupan air yang "${waterStr}" dapat memperlambat laju metabolisme basal (BMR) Anda dan menyebabkan penumpukan lemak visceral di area perut. Jika Anda memiliki riwayat keluhan medis "${medicalStr}", sangat penting untuk memilih suplemen makanan yang aman dan tidak memicu efek samping negatif pada lambung atau tekanan darah Anda. Kami menyarankan untuk fokus pada konsumsi nutrisi seimbang untuk menyehatkan tubuh secara menyeluruh.`;

      defaultAdvice = `1. Atur pola makan dengan porsi seimbang, perbanyak asupan protein nabati/hewani, dan batasi karbohidrat sederhana serta gula tambahan.\n2. Tingkatkan konsumsi air putih harian minimal 2.5 liter per hari untuk memperlancar metabolisme tubuh dan membantu detoksifikasi alami.\n3. Usahakan melakukan aktivitas fisik ringan seperti jalan kaki 30 menit sehari atau olahraga kardio intensitas sedang 3 kali seminggu.\n4. Jangan melewatkan waktu makan terutama sarapan pagi untuk menjaga kestabilan kadar gula darah dan mencegah nafsu makan berlebih di malam hari.`;

      if (medicalStr.toLowerCase().includes("maag") || medicalStr.toLowerCase().includes("lambung")) {
        defaultProducts = [
          { name: "Madu Herbal Maag & Asam Lambung", reason: "Membantu menenangkan dinding lambung yang meradang selama program penyesuaian diet harian." },
          { name: "Blackmores Multivitamin Active", reason: "Memenuhi kebutuhan vitamin esensial harian tanpa memicu asam lambung berlebih." }
        ];
      } else if (goalStr.toLowerCase().includes("turun") || goalStr.toLowerCase().includes("perut")) {
        defaultProducts = [
          { name: "Herbilogy Slimming Tea / Senna Leaf", reason: "Membantu melancarkan pencernaan, mengurangi lemak berlebih, dan mendetoksifikasi tubuh secara alami." },
          { name: "Fibre Slim Drink", reason: "Minuman serat tinggi yang membuat kenyang lebih lama sehingga menekan keinginan ngemil berlebih." }
        ];
      } else {
        defaultProducts = [
          { name: "Curcuma Plus / Penambah Berat Badan", reason: "Membantu memperbaiki nafsu makan dan penyerapan gizi pada usus secara optimal." },
          { name: "Blackmores Multivitamin & Mineral", reason: "Menjaga stamina, energi, serta vitalitas tubuh sepanjang hari." }
        ];
      }
    } else {
      // kulit
      const skinType = answers.type || "kombinasi";
      const concernStr = answers.concern || "kulit kusam";
      const makeupStr = answers.makeup || "jarang pakai";
      const routineStr = answers.routine || "basic";
      const outdoorStr = answers.outdoor || "indoor";
      const allergyStr = answers.allergy || "tidak ada";

      defaultAnalysis = `Berdasarkan kuesioner kesehatan kulit, Kak ${biodata.nama} berusia ${biodata.umur} tahun memiliki jenis kulit "${skinType}" dengan keluhan utama "${concernStr}". Rutinitas perawatan wajah saat ini dinilai "${routineStr}" dengan paparan aktivitas harian mayoritas di area "${outdoorStr}". \n\nPenggunaan sunscreen Anda yang masuk dalam kategori "${makeupStr}" sangat mempengaruhi kondisi kulit saat ini. Kurangnya proteksi dari sinar UV dapat mempercepat kerusakan kolagen, memperparah noda hitam, memicu bruntusan, serta membuat jerawat lebih mudah meradang. Selain itu, adanya riwayat "${allergyStr}" menuntut pemilihan produk bebas parfum dan paraben agar tidak memicu reaksi negatif.`;

      defaultAdvice = `1. Terapkan 'Double Cleansing' di malam hari terutama jika sering terpapar polusi atau menggunakan riasan wajah agar tidak menyumbat pori-pori.\n2. Gunakan pelembab (moisturizer) yang cocok dengan jenis kulit untuk memperbaiki skin barrier yang rusak akibat dehidrasi.\n3. Wajib gunakan Sunscreen minimal SPF 30++ setiap pagi hari secara merata dan lakukan reapply setiap 3-4 jam apabila beraktivitas luar ruangan.\n4. Hindari memencet jerawat atau komedo secara mandiri untuk menghindari infeksi sekunder dan bopeng bekas luka yang permanen.`;

      if (concernStr.toLowerCase().includes("jerawat")) {
        defaultProducts = [
          { name: "Sariayu Acne Care Facial Foam / Benzolac 2.5%", reason: "Mengandung bahan aktif sulfur dan asam salisilat untuk mengeringkan jerawat aktif dan meredakan peradangan." },
          { name: "Centella Asiatica Soothing Gel", reason: "Menenangkan kulit kemerahan (PIE/PIH) dan mempercepat penyembuhan kulit sensitif." }
        ];
      } else if (concernStr.toLowerCase().includes("kusam") || concernStr.toLowerCase().includes("flek")) {
        defaultProducts = [
          { name: "Serum Vitamin C / Niacinamide 5%", reason: "Kombinasi pencerah kulit yang ampuh menyamarkan noda hitam bekas jerawat serta mencerahkan kulit kusam." },
          { name: "Sunscreen SPF 50 PA++++ Physical", reason: "Melindungi kulit dari radikal bebas dan paparan sinar UV agar hiperpigmentasi tidak bertambah parah." }
        ];
      } else {
        defaultProducts = [
          { name: "Serum Retinol 1% / Hyaluronic Acid", reason: "Mendorong regenerasi sel kulit baru, menyamarkan kerutan halus, serta mengembalikan elastisitas kulit." },
          { name: "Ceramide Moisture Barrier Gel", reason: "Memperkuat lapisan pelindung kulit (skin barrier) agar senantiasa lembab, kenyal, dan awet muda." }
        ];
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        analysis: defaultAnalysis,
        advice: defaultAdvice,
        products: defaultProducts
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah Asisten Apoteker & Dokter Konsultan Ahli dari "Sehatku Store", sebuah apotek online resmi berlisensi di Jawa Tengah.
Tugas Anda adalah menganalisis data kuesioner pengguna dan memberikan rekomendasi medis, pola makan/skincare, serta saran produk kesehatan secara personal, sangat ramah, santun, ilmiah, dan lengkap.

DATA PASIEN:
- Nama: ${biodata.nama || "-"}
- Usia: ${biodata.umur || "-"} tahun
- Jenis Kelamin: ${biodata.jenkel || "-"}
- Pekerjaan: ${biodata.pekerjaan || "-"}

KATEGORI KONSULTASI: ${type === "diet" ? "Diet & Berat Badan" : "Kesehatan Kulit & Skincare"}

JAWABAN KUESIONER LENGKAP:
${JSON.stringify(answers, null, 2)}

BERIKAN TANGGAPAN dalam format JSON dengan struktur persis seperti berikut (jangan gunakan markdown, langsung JSON saja):
{
  "analysis": "Analisis mendalam, sangat lengkap, empatik, dan ilmiah tentang kondisi pasien (berikan minimal 2-3 paragraf penjelasan detail mengenai masalah kesehatan atau kulit mereka berdasarkan semua data input kuesioner harian mereka, hitung atau jelaskan IMT jika ada berat/tinggi badan).",
  "advice": "Langkah konkret yang sangat detail, praktis, terinci nomor demi nomor tentang kebiasaan sehari-hari, pola makan, atau pola hidup sehat spesifik yang harus diterapkan pasien.",
  "products": [
    {
      "name": "Nama produk rekomendasi yang spesifik dan umum (misal: Herbilogy Slimming Tea, Sariayu Acne Cream, Blackmores Multivitamin dsb)",
      "reason": "Penjelasan ilmiah yang lengkap mengapa produk ini sangat cocok untuk memulihkan atau merawat kondisi spesifik mereka."
    }
  ]
}

Pastikan respons Anda murni berupa valid JSON tanpa dibungkus markdown \`\`\`json dsb agar mudah di-parse.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    res.json({
      success: true,
      analysis: parsedData.analysis || defaultAnalysis,
      advice: parsedData.advice || defaultAdvice,
      products: parsedData.products || defaultProducts
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Gagal memproses konsultasi AI",
      details: error.message || "Unknown error"
    });
  }
});

export default app;
