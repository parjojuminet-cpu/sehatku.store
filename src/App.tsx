import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, Search, Phone, Clock, MapPin, Check, Plus, Minus, Trash2, 
  ChevronRight, ArrowRight, ArrowLeft, Star, Heart, Image as ImageIcon,
  Sparkles, Stethoscope, Video, FileText, CheckCircle2, RefreshCw, X, Menu, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ============================================================
   TYPES
   ============================================================ */
const WA_NUM = "62882006729762";

interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  cat: string;
  isBest?: boolean;
  isPromo?: boolean;
}

interface CartItem {
  id: string;
  qty: number;
}

interface Article {
  type: "web" | "yt";
  typeLabel: string;
  icon: string;
  bg: string;
  category: string;
  title: string;
  tanggal: string;
  desc: string;
  url: string;
  btnLabel: string;
}

/* ============================================================
   SIMULATED ORDERS (Social Proof CRO)
   ============================================================ */
const SIMULATED_ORDERS = [
  { name: "Siti Rahma", loc: "Ungaran Barat", item: "Benzolac 2,5%", time: "1 menit yang lalu" },
  { name: "Dewi Setyowati", loc: "Bawen, Semarang", item: "Blackmores Bio C", time: "3 menit yang lalu" },
  { name: "Pak Slamet", loc: "Ambarawa", item: "Kloderma Gel", time: "5 menit yang lalu" },
  { name: "Rina Kartika", loc: "Salatiga", item: "Tolak Angin 1 Box", time: "Baru saja" },
  { name: "Andi Saputra", loc: "Gunungpati", item: "Promag Herbal", time: "8 menit yang lalu" },
  { name: "Ibu Megawati", loc: "Banyumanik", item: "Bodrexin Anak", time: "4 menit yang lalu" },
  { name: "Hendra Wijaya", loc: "Tembalang", item: "Mediklin Sol", time: "6 menit yang lalu" },
  { name: "Sri Lestari", loc: "Boyolali", item: "Vitacid Cream", time: "2 menit yang lalu" },
  { name: "dr. Anwar", loc: "Ungaran Timur", item: "Actifed Merah", time: "9 menit yang lalu" },
  { name: "Yanto K.", loc: "Genuk, Semarang", item: "Koolfever Anak", time: "10 menit yang lalu" }
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function App() {
  // Navigation & Menu States
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showBackTop, setShowBackTop] = useState<boolean>(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Social Proof CRO Notifications State
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [showOrderNotif, setShowOrderNotif] = useState<boolean>(false);

  // Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autocompleteResults, setAutocompleteResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchPopup, setShowSearchPopup] = useState<boolean>(false);

  // Product Filter
  const [currentCat, setCurrentCat] = useState<string>("all");

  // Cart & Drawer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("Transfer");
  
  // Checkout Form
  const [cName, setCName] = useState<string>("");
  const [cWA, setCWA] = useState<string>("");
  const [cKab, setCKab] = useState<string>("");
  const [cKec, setCKec] = useState<string>("");
  const [cAddr, setCAddr] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Captcha
  const [captchaA, setCaptchaA] = useState<number>(0);
  const [captchaB, setCaptchaB] = useState<number>(0);
  const [captchaAns, setCaptchaAns] = useState<string>("");
  const [isCaptchaValid, setIsCaptchaAnsValid] = useState<boolean>(true);

  // Modal / Detail Popups
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductQty, setSelectedProductQty] = useState<number>(1);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<{ src: string; title: string; isVideo?: boolean } | null>(null);

  // Dynamic Data States
  const [allMedicines, setAllMedicines] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeArticleCat, setActiveArticleCat] = useState<string>("Semua");
  const [showAllArticles, setShowAllArticles] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Promo Banner
  const [showPromoPopup, setShowPromoPopup] = useState<boolean>(true);

  // Cek Kebutuhan / Funnel States
  const [isFunnelOpen, setIsFunnelOpen] = useState<boolean>(false);
  const [funnelType, setFunnelType] = useState<"diet" | "kulit" | "">("diet");
  const [funnelStep, setFunnelStep] = useState<number>(1); // 1: bio, 2-N: questions, N+1: analysis
  
  // Funnel Bio
  const [fName, setFName] = useState<string>("");
  const [fAge, setFAge] = useState<string>("");
  const [fGender, setFGender] = useState<string>("Pria");
  const [fJob, setFJob] = useState<string>("");
  
  // Funnel Answers
  const [dietAnswers, setDietAnswers] = useState<Record<string, string>>({ goal: "", habit: "", water: "", weight: "", height: "", activity: "", medical: "" });
  const [kulitAnswers, setSkinAnswers] = useState<Record<string, string>>({ type: "", concern: "", makeup: "", routine: "", outdoor: "", allergy: "" });
  
  // AI Consultation Results
  const [isConsulting, setIsConsulting] = useState<boolean>(false);
  const [consultResult, setConsultResult] = useState<{ analysis: string; advice: string; products?: { name: string; reason: string }[] } | null>(null);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ============================================================
     LOCAL DATA (Backup & Fast Catalog)
     ============================================================ */
  const FAST_PRODUCTS: Product[] = [
    { id: 'k1', name: 'Benzolac 2,5%', price: 25000, img: '/kecantikan/benzolac2.jpg', cat: 'kecantikan', isBest: true },
    { id: 'k2', name: 'Benzolac 5%', price: 31000, img: '/kecantikan/BENZOLAC-5.jpg', cat: 'kecantikan', isBest: true },
    { id: 'k3', name: 'Benzolac CL', price: 49000, img: '/kecantikan/benzolac-cl.jpg', cat: 'kecantikan', isPromo: true },
    { id: 'k6', name: 'Kloderma Gel', price: 33000, img: '/kecantikan/KLODERMAgel.png', cat: 'kecantikan', isPromo: true },
    { id: 'k7', name: 'Mediklin Sol', price: 60900, img: '/kecantikan/mediklinsol.jpg', cat: 'kecantikan', isPromo: true },
    { id: 'a1', name: 'Anakonidin OBH', price: 21000, img: '/anak/anakonidin.jpg', cat: 'anak' },
    { id: 'a2', name: 'Bodrexin', price: 10000, img: '/anak/bodrexin.png', cat: 'anak', isBest: true },
    { id: 'a6', name: 'Koolfever', price: 13000, img: '/anak/koolfever.jpg', cat: 'anak', isBest: true },
    { id: 'd1', name: 'Actifed Merah', price: 70500, img: '/dewasa/ACTIFED.jpg', cat: 'dewasa', isBest: true },
    { id: 'd2', name: 'Andalan FE', price: 35000, img: '/dewasa/ANDALAN-FE.png', cat: 'dewasa' },
    { id: 'v1', name: 'Blackmores Bio C', price: 95000, img: '/vitamin/blackmores-1.jpg', cat: 'vitamin', isBest: true },
    { id: 'v2', name: 'Blackmores Multivitamin', price: 165000, img: '/vitamin/Blackmores-multivitamin.jpg', cat: 'vitamin' },
    { id: 'h5', name: 'Promag Herbal', price: 28000, img: '/herbal/promag-herbal.jpg', cat: 'herbal', isBest: true },
    { id: 'h7', name: 'Tolak Angin', price: 32000, img: '/herbal/tolak%20angin%20herbal.jpg', cat: 'herbal', isBest: true },
  ];

  const PROMO_BANNER_PRODUCTS = [
    { name: 'Niacef (Rp 57.000)', img: '/promo/niacef.png' },
    { name: 'Vitacid (Rp 67.000)', img: '/promo/vitacid.jpg' },
    { name: 'Vitacid Cream (Rp 52.500)', img: '/promo/vitacidcrm.jpg' },
    { name: 'Kloderma Cream (Rp 63.500)', img: '/promo/klodermacrm.jpg' },
    { name: 'Kloderma Oint (Rp 63.500)', img: '/promo/klodermaoint.jpg' },
    { name: 'Mediklin (Rp 50.500)', img: '/promo/MEDIKLIN.jpg' },
    { name: 'Ketomed SS (Rp 82.500)', img: '/promo/KETOMEDSS.png' },
    { name: 'Carmed 20 (Rp 74.500)', img: '/promo/CARMED20.jpg' },
  ];

  const GALLERY_ITEMS = [
    { type: 'video', src: '/galeri/1.mp4', title: 'Aktivitas Apotek Sehatku', desc: 'Pelayanan ramah & profesional apoteker berlisensi.' },
    { type: 'image', src: 'https://i.imgur.com/ugvBfzN.jpeg', title: 'Apotek Terpercaya', desc: 'Produk farmasi asli, lengkap & berizin resmi.' },
    { type: 'image', src: 'https://i.imgur.com/HfHQ6in.jpeg', title: 'Suplemen & Vitamin', desc: 'Meningkatkan daya tahan tubuh Anda sekeluarga.' },
    { type: 'image', src: 'https://i.imgur.com/ppaMzvs.jpeg', title: 'Konsultasi Apoteker', desc: 'Tanya obat gratis kapan saja lewat WhatsApp.' }
  ];

  const TESTIMONIALS = [
    { name: 'Siti Rahayu', loc: 'Ungaran, Semarang', rating: 5, text: 'Pelayanannya ramah banget, obatnya lengkap dan harganya terjangkau. Udah jadi langganan tetap selama 2 tahun!', init: 'SR', color: '#16a34a' },
    { name: 'Budi Santoso', loc: 'Ambarawa, Semarang', rating: 5, text: 'Cepet banget responnya waktu pesan via WA, dianterin juga nggak lama. Produknya original semua, recommended!', init: 'BS', color: '#0d9488' },
    { name: 'Dewi Anggraini', loc: 'Bawen, Semarang', rating: 5, text: 'Vitamin untuk anak saya selalu beli di sini, terjangkau dan apotekernya helpful banget kasih saran yang tepat.', init: 'DA', color: '#d97706' },
    { name: 'Ahmad Fauzi', loc: 'Tengaran, Semarang', rating: 5, text: 'Apotek yang bisa dipercaya! Pernah konsultasi soal obat diabetes dan dikasih penjelasan lengkap. Terima kasih!', init: 'AF', color: '#7c3aed' },
  ];

  const REGIONS = [
    { id: 'kab_semarang', nama: 'Kabupaten Semarang', kecamatan: ['Ambarawa','Bandungan','Bancak','Banyubiru','Bawen','Bergas','Bringin','Getasan','Jambu','Kaliwungu','Klepu','Pabelan','Pringapus','Suruh','Susukan','Tengaran','Tuntang','Ungaran Barat','Ungaran Timur'] },
    { id: 'kota_semarang', nama: 'Kota Semarang', kecamatan: ['Banyumanik','Candisari','Gajahmungkur','Gayamsari','Genuk','Gunungpati','Mijen','Ngaliyan','Pedurungan','Semarang Barat','Semarang Selatan','Semarang Tengah','Semarang Timur','Semarang Utara','Tembalang','Tugu'] },
    { id: 'kota_salatiga', nama: 'Kota Salatiga', kecamatan: ['Argomulyo','Sidomukti','Sidorejo','Tingkir'] },
    { id: 'kab_boyolali', nama: 'Kabupaten Boyolali', kecamatan: ['Ampel','Andong','Banyudono','Boyolali','Cepogo','Karanggede','Kemusu','Klego','Mojosongo','Musuk','Ngemplak','Nogosari','Sambi','Sawit','Selo','Simo','Teras','Wonosegoro'] }
  ];

  /* ============================================================
     EFFECTS & LOADER
     ============================================================ */
  useEffect(() => {
    // Generate captcha
    resetCaptcha();

    // Scroll listener for Back to Top
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);

    // Click outside handler for search dropdown
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    // Fetch dynamic medicines & articles from JSON database and live feed API
    const loadStoreData = async () => {
      try {
        const [medRes, eduRes] = await Promise.all([
          fetch("/csvjson.json"),
          fetch("/api/articles").catch(() => fetch("/data_edukasi.json"))
        ]);

        if (medRes.ok) {
          const medData = await medRes.json();
          const parsedMeds = medData.map((p: any, i: number) => ({
            id: 'med_' + i,
            name: p.nama || p.name || "Produk",
            price: parseInt(p.harga || p.price || 0) || 0,
            img: p.img || p.image || "https://placehold.co/150",
            cat: p.kategori || p.category || "dewasa"
          }));
          setAllMedicines(parsedMeds);
        } else {
          setAllMedicines(FAST_PRODUCTS);
        }

        if (eduRes.ok) {
          const eduData = await eduRes.json();
          setArticles(eduData);
        } else {
          // Fallback if API is totally unreachable
          const fbEduRes = await fetch("/data_edukasi.json");
          if (fbEduRes.ok) {
            const eduData = await fbEduRes.json();
            setArticles(eduData);
          }
        }
      } catch (err) {
        console.warn("Store data fetch failed, using fallback:", err);
        setAllMedicines(FAST_PRODUCTS);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadStoreData();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Periodic simulated live purchase notifications for high trust & social proof
  useEffect(() => {
    let index = 0;
    // Initial delay of 12 seconds before the first popup
    const startTimeout = setTimeout(() => {
      setRecentOrder(SIMULATED_ORDERS[index]);
      setShowOrderNotif(true);
      
      const hideTimeout = setTimeout(() => {
        setShowOrderNotif(false);
      }, 6500);

      index = (index + 1) % SIMULATED_ORDERS.length;

      const interval = setInterval(() => {
        setRecentOrder(SIMULATED_ORDERS[index]);
        setShowOrderNotif(true);
        
        const nextHideTimeout = setTimeout(() => {
          setShowOrderNotif(false);
        }, 6500);

        index = (index + 1) % SIMULATED_ORDERS.length;

        return () => clearTimeout(nextHideTimeout);
      }, 26000); // Trigger every 26 seconds

      return () => {
        clearTimeout(hideTimeout);
        clearInterval(interval);
      };
    }, 12000);

    return () => clearTimeout(startTimeout);
  }, []);

  /* ============================================================
     HANDLERS & UTILITIES
     ============================================================ */
  const formatRupiah = (num: number) => {
    return 'Rp' + num.toLocaleString('id-ID');
  };

  const handleProductImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.onerror = null; // Prevent infinite loops
    const name = target.alt || "Produk";
    target.src = `https://placehold.co/400x400/059669/ffffff?text=${encodeURIComponent(name)}`;
  };

  const resetCaptcha = () => {
    setCaptchaA(Math.floor(Math.random() * 9) + 1);
    setCaptchaB(Math.floor(Math.random() * 9) + 1);
    setCaptchaAns("");
    setIsCaptchaAnsValid(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim().length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }

    const source = allMedicines.length > 0 ? allMedicines : FAST_PRODUCTS;
    const filtered = source.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 7);
    setAutocompleteResults(filtered);
    setShowDropdown(true);
  };

  const triggerSearch = () => {
    if (searchQuery.trim().length < 2) return;
    const source = allMedicines.length > 0 ? allMedicines : FAST_PRODUCTS;
    const matched = source.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(matched);
    setShowDropdown(false);
    setShowSearchPopup(true);
  };

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { id: product.id, qty }];
    });
    showToastNotification(`${product.name} dimasukkan ke keranjang`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, qty: newQty } : i);
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const p = allMedicines.find(med => med.id === item.id) || FAST_PRODUCTS.find(med => med.id === item.id);
      return total + (p ? p.price * item.qty : 0);
    }, 0);
  };

  const showToastNotification = (msg: string) => {
    const notif = document.getElementById('cartAddNotif');
    const text = document.getElementById('cartAddNotifText');
    if (notif && text) {
      text.textContent = msg;
      notif.classList.add('show');
      setTimeout(() => notif.classList.remove('show'), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  const selectPaymentMethod = (method: string) => {
    setSelectedPayment(method);
  };

  /* ============================================================
     FUNNEL / CEK KEBUTUHAN LOGIC
     ============================================================ */
  const openFunnel = (type: "diet" | "kulit") => {
    setFunnelType(type);
    setFunnelStep(1);
    setFName("");
    setFAge("");
    setFJob("");
    setDietAnswers({ goal: "", habit: "", water: "", weight: "", height: "", activity: "", medical: "" });
    setSkinAnswers({ type: "", concern: "", makeup: "", routine: "", outdoor: "", allergy: "" });
    setConsultResult(null);
    setIsFunnelOpen(true);
  };

  const submitFunnelBio = () => {
    if (!fName.trim() || !fAge.trim() || !fJob.trim()) {
      alert("Mohon lengkapi semua biodata!");
      return;
    }
    setFunnelStep(2);
  };

  const handleConsultation = async () => {
    setIsConsulting(true);
    setFunnelStep(3); // Menuju halaman hasil analisa & saran apoteker
    try {
      const answers = funnelType === "diet" ? dietAnswers : kulitAnswers;
      const res = await fetch("/api/ai/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: funnelType,
          biodata: { nama: fName, umur: fAge, jenkel: fGender, pekerjaan: fJob },
          answers: answers
        })
      });

      if (res.ok) {
        const data = await res.json();
        setConsultResult(data);
      } else {
        throw new Error("Gagal mengambil respon AI");
      }
    } catch (err) {
      console.error(err);
      // Detailed dynamic fallback on frontend if fetch/backend fails entirely
      const weightVal = parseFloat(dietAnswers.weight) || 0;
      const heightVal = parseFloat(dietAnswers.height) || 0;
      let imtText = "";
      if (weightVal > 0 && heightVal > 0) {
        const heightM = heightVal / 100;
        const imtNum = parseFloat((weightVal / (heightM * heightM)).toFixed(1));
        let imtCat = "";
        if (imtNum < 18.5) imtCat = "Kekurangan Berat Badan (Underweight)";
        else if (imtNum < 25) imtCat = "Berat Badan Normal (Ideal)";
        else if (imtNum < 30) imtCat = "Kelebihan Berat Badan (Overweight)";
        else imtCat = "Obesitas (Obesity)";
        imtText = `Indeks Massa Tubuh (IMT) Anda saat ini adalah ${imtNum} kg/m² (${imtCat}). `;
      }

      if (funnelType === "diet") {
        const goalStr = dietAnswers.goal || "kesehatan umum";
        const habitStr = dietAnswers.habit || "makan kurang teratur";
        const waterStr = dietAnswers.water || "kurang minum";
        const activityStr = dietAnswers.activity || "sedentary";
        const medicalStr = dietAnswers.medical || "tidak ada riwayat";

        setConsultResult({
          analysis: `Berdasarkan data kuesioner medis, Kak ${fName} (${fAge} tahun, ${fGender}) memiliki tujuan utama untuk "${goalStr}". ${imtText}Aktivitas fisik Anda berada pada level "${activityStr}" dengan kebiasaan makan berupa "${habitStr}". \n\nKombinasi pola makan ini jika dipadukan dengan asupan air yang "${waterStr}" dapat memperlambat laju metabolisme basal (BMR) Anda dan menyebabkan penumpukan lemak visceral di area perut. Jika Anda memiliki riwayat keluhan medis "${medicalStr}", sangat penting untuk memilih suplemen makanan yang aman dan tidak memicu efek samping negatif pada lambung atau tekanan darah Anda. Kami menyarankan untuk fokus pada konsumsi nutrisi seimbang untuk menyehatkan tubuh secara menyeluruh.`,
          advice: `1. Atur pola makan dengan porsi seimbang, perbanyak asupan protein nabati/hewani, dan batasi karbohidrat sederhana serta gula tambahan.\n2. Tingkatkan konsumsi air putih harian minimal 2.5 liter per hari untuk memperlancar metabolisme tubuh dan membantu detoksifikasi alami.\n3. Usahakan melakukan aktivitas fisik ringan seperti jalan kaki 30 menit sehari atau olahraga kardio intensitas sedang 3 kali seminggu.\n4. Jangan melewatkan waktu makan terutama sarapan pagi untuk menjaga kestabilan kadar gula darah dan mencegah nafsu makan berlebih di malam hari.`,
          products: medicalStr.toLowerCase().includes("maag") || medicalStr.toLowerCase().includes("lambung") ? [
            { name: "Madu Herbal Maag & Asam Lambung", reason: "Membantu menenangkan dinding lambung yang meradang selama program penyesuaian diet harian." },
            { name: "Blackmores Multivitamin Active", reason: "Memenuhi kebutuhan vitamin esensial harian tanpa memicu asam lambung berlebih." }
          ] : (goalStr.toLowerCase().includes("turun") || goalStr.toLowerCase().includes("perut") ? [
            { name: "Herbilogy Slimming Tea / Senna Leaf", reason: "Membantu melancarkan pencernaan, mengurangi lemak berlebih, dan mendetoksifikasi tubuh secara alami." },
            { name: "Fibre Slim Drink", reason: "Minuman serat tinggi yang membuat kenyang lebih lama sehingga menekan keinginan ngemil berlebih." }
          ] : [
            { name: "Curcuma Plus / Penambah Berat Badan", reason: "Membantu memperbaiki nafsu makan dan penyerapan gizi pada usus secara optimal." },
            { name: "Blackmores Multivitamin & Mineral", reason: "Menjaga stamina, energi, serta vitalitas tubuh sepanjang hari." }
          ])
        });
      } else {
        const skinType = kulitAnswers.type || "kombinasi";
        const concernStr = kulitAnswers.concern || "kulit kusam";
        const makeupStr = kulitAnswers.makeup || "jarang pakai";
        const routineStr = kulitAnswers.routine || "basic";
        const outdoorStr = kulitAnswers.outdoor || "indoor";
        const allergyStr = kulitAnswers.allergy || "tidak ada";

        setConsultResult({
          analysis: `Berdasarkan kuesioner kesehatan kulit, Kak ${fName} berusia ${fAge} tahun memiliki jenis kulit "${skinType}" dengan keluhan utama "${concernStr}". Rutinitas perawatan wajah saat ini dinilai "${routineStr}" dengan paparan aktivitas harian mayoritas di area "${outdoorStr}". \n\nPenggunaan sunscreen Anda yang masuk dalam kategori "${makeupStr}" sangat mempengaruhi kondisi kulit saat ini. Kurangnya proteksi dari sinar UV dapat mempercepat kerusakan kolagen, memperparah noda hitam, memicu bruntusan, serta membuat jerawat lebih mudah meradang. Selain itu, adanya riwayat "${allergyStr}" menuntut pemilihan produk bebas parfum dan paraben agar tidak memicu reaksi negatif.`,
          advice: `1. Terapkan 'Double Cleansing' di malam hari terutama jika sering terpapar polusi atau menggunakan riasan wajah agar tidak menyumbat pori-pori.\n2. Gunakan pelembab (moisturizer) yang cocok dengan jenis kulit untuk memperbaiki skin barrier yang rusak akibat dehidrasi.\n3. Wajib gunakan Sunscreen minimal SPF 30++ setiap pagi hari secara merata dan lakukan reapply setiap 3-4 jam apabila beraktivitas luar ruangan.\n4. Hindari memencet jerawat atau komedo secara mandiri untuk menghindari infeksi sekunder dan bopeng bekas luka yang permanen.`,
          products: concernStr.toLowerCase().includes("jerawat") ? [
            { name: "Sariayu Acne Care Facial Foam / Benzolac 2.5%", reason: "Mengandung bahan aktif sulfur dan asam salisilat untuk mengeringkan jerawat aktif dan meredakan peradangan." },
            { name: "Centella Asiatica Soothing Gel", reason: "Menenangkan kulit kemerahan (PIE/PIH) dan mempercepat penyembuhan kulit sensitif." }
          ] : (concernStr.toLowerCase().includes("kusam") || concernStr.toLowerCase().includes("flek") ? [
            { name: "Serum Vitamin C / Niacinamide 5%", reason: "Kombinasi pencerah kulit yang ampuh menyamarkan noda hitam bekas jerawat serta mencerahkan kulit kusam." },
            { name: "Sunscreen SPF 50 PA++++ Physical", reason: "Melindungi kulit dari radikal bebas dan paparan sinar UV agar hiperpigmentasi tidak bertambah parah." }
          ] : [
            { name: "Serum Retinol 1% / Hyaluronic Acid", reason: "Mendorong regenerasi sel kulit baru, menyamarkan kerutan halus, serta mengembalikan elastisitas kulit." },
            { name: "Ceramide Moisture Barrier Gel", reason: "Memperkuat lapisan pelindung kulit (skin barrier) agar senantiasa lembab, kenyal, dan awet muda." }
          ])
        });
      }
    } finally {
      setIsConsulting(false);
    }
  };

  const sendFunnelToWA = () => {
    if (!consultResult) return;
    const answers = funnelType === "diet" ? dietAnswers : kulitAnswers;
    const text = `Halo Sehatku Store 🏥, saya ingin berkonsultasi mengenai hasil kuis *Cek Kebutuhan Sehatku*.\n\n` +
      `👤 *Data Diri*:\n` +
      `- Nama: ${fName}\n` +
      `- Usia: ${fAge} tahun\n` +
      `- Gender: ${fGender}\n` +
      `- Pekerjaan: ${fJob}\n\n` +
      `📝 *Hasil Analisa AI*:\n` +
      `- Analisa: ${consultResult.analysis}\n` +
      `- Saran: ${consultResult.advice}\n\n` +
      `Mohon rekomendasi produk atau obat terbaik yang ready di apotek sehatku ya kak. Terima kasih! 🙏`;

    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(text)}`, "_blank");
  };

  /* ============================================================
     CHECKOUT WHATSAPP
     ============================================================ */
  const handleCheckout = () => {
    const errorState: Record<string, boolean> = {};
    if (!cName.trim()) errorState.name = true;
    if (cWA.trim().length < 10) errorState.wa = true;
    if (!cKab) errorState.kab = true;
    if (!cKec) errorState.kec = true;
    if (!cAddr.trim()) errorState.addr = true;

    // Captcha validation
    const expected = captchaA + captchaB;
    if (parseInt(captchaAns) !== expected) {
      setIsCaptchaAnsValid(false);
      errorState.captcha = true;
    } else {
      setIsCaptchaAnsValid(true);
    }

    setFormErrors(errorState);

    if (Object.keys(errorState).length > 0) {
      alert("Mohon lengkapi seluruh isian data pengiriman dengan benar!");
      return;
    }

    // Hitung order id & total harga aman dari server-side database
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const subtotal = calculateSubtotal();
    const uniqueCode = Math.floor(Math.random() * 400) + 100;
    const finalTotal = subtotal + uniqueCode;

    // Susun pesan belanja
    const listProducts = cart.map((item, index) => {
      const p = allMedicines.find(med => med.id === item.id) || FAST_PRODUCTS.find(med => med.id === item.id);
      return `${index + 1}. ${p?.name} x${item.qty} (${formatRupiah(p ? p.price * item.qty : 0)})`;
    }).join("\n");

    const messageText = `Halo Sehatku Store, saya ingin memesan obat berikut:\n\n` +
      `🧾 *ID ORDER: ${orderId}*\n\n` +
      `👤 *Data Pemesan*:\n` +
      `- Nama: ${cName}\n` +
      `- WA: ${cWA}\n` +
      `- Kabupaten: ${cKab}\n` +
      `- Kecamatan: ${cKec}\n` +
      `- Alamat Lengkap: ${cAddr}\n\n` +
      `📦 *Produk Belanjaan*:\n` +
      `${listProducts}\n\n` +
      `💵 *Rincian Pembayaran*:\n` +
      `- Subtotal: ${formatRupiah(subtotal)}\n` +
      `- Kode Unik: ${uniqueCode}\n` +
      `- *Total Pembayaran: ${formatRupiah(finalTotal)}*\n` +
      `- Metode: ${selectedPayment}\n\n` +
      `Mohon diproses untuk pengiriman barang dan perhitungan ongkirnya ya kak. Terima kasih!`;

    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(messageText)}`, "_blank");
    setCart([]);
    setIsCartOpen(false);
    resetCaptcha();
  };

  // Quick Checkout Bypass (No Form Filling) for conversion optimization (CRO)
  const handleQuickCheckout = () => {
    if (cart.length === 0) return;
    
    const subtotal = calculateSubtotal();
    const orderId = `QCK-${Date.now().toString().slice(-6)}`;
    
    const listProducts = cart.map((item, index) => {
      const p = allMedicines.find(med => med.id === item.id) || FAST_PRODUCTS.find(med => med.id === item.id);
      return `${index + 1}. ${p?.name} x${item.qty} (${formatRupiah(p ? p.price * item.qty : 0)})`;
    }).join("\n");

    const messageText = `Halo Sehatku Store 🏥, saya ingin melakukan *Pemesanan Kilat* (Tanpa Isi Form) untuk produk berikut:\n\n` +
      `🧾 *ID ORDER KILAT: ${orderId}*\n\n` +
      `📦 *Produk Belanjaan*:\n` +
      `${listProducts}\n\n` +
      `💵 *Estimasi Subtotal: ${formatRupiah(subtotal)}*\n\n` +
      `Saya akan mengirimkan alamat lengkap & nama saya langsung di chat ini ya kak. Mohon segera dipandu untuk total ongkirnya! 🙏`;

    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(messageText)}`, "_blank");
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
      {/* ===== HEADER / NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm backdrop-blur-md bg-white/95">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-2 text-center text-xs font-semibold text-white tracking-wide flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto md:px-8">
          <div className="flex items-center gap-1.5 justify-center md:justify-start">
            <Phone size={13} />
            <span>0882-0067-29762</span>
            <span className="hidden md:inline">|</span>
            <MapPin size={13} className="hidden md:inline" />
            <span className="hidden md:inline">Jawa Tengah</span>
          </div>
          <div className="flex items-center gap-1 justify-center mt-1 md:mt-0">
            <Clock size={13} />
            <span>Buka Setiap Hari 08.00 - 21.00 WIB</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("home")}>
            <img src="/mitra.png" alt="Sehatku Logo" className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/10" />
            <div>
              <span className="font-display font-extrabold text-xl text-emerald-700 tracking-tight leading-none block">SEHATKU</span>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">STORE APOTEK</span>
            </div>
          </div>

          {/* Autocomplete Bilah Pencarian */}
          <div className="flex-1 max-w-md relative hidden md:block" ref={dropdownRef}>
            <div className="flex items-center border-2 border-emerald-500 rounded-2xl bg-white overflow-hidden shadow-sm focus-within:shadow-md transition-all">
              <input 
                type="text" 
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
                placeholder="Cari obat, vitamin, kosmetik dsb..." 
                className="w-full px-4 py-2.5 outline-none text-sm text-gray-800"
              />
              <button onClick={triggerSearch} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-2.5 px-5 hover:opacity-90 transition-opacity">
                <Search size={18} />
              </button>
            </div>
            
            <AnimatePresence>
              {showDropdown && autocompleteResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
                >
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hasil Autocomplete</div>
                  {autocompleteResults.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setSelectedProduct(p);
                        setSelectedProductQty(1);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-3 flex items-center justify-between hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">💊</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-none">{p.name}</p>
                          <p className="text-xs text-emerald-600 font-bold mt-1">{formatRupiah(p.price)}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  ))}
                  <div 
                    onClick={triggerSearch}
                    className="p-3 bg-emerald-50 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-100/80 transition-colors cursor-pointer"
                  >
                    Lihat Hasil Pencarian Lengkap untuk "{searchQuery}"
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Keranjang</span>
              <span className="bg-white text-emerald-700 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-600 md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop Menu Link Bar */}
        <div className="hidden md:flex items-center gap-2 border-t border-gray-100 max-w-7xl mx-auto px-8 py-1 bg-gray-50/50">
          <button onClick={() => scrollToSection("home")} className={`px-4 py-2 text-xs font-bold transition-all hover:text-emerald-700 ${activeTab === "home" ? "text-emerald-600" : "text-gray-500"}`}>HOME</button>
          <button onClick={() => scrollToSection("products-section")} className="px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:text-emerald-700">KATALOG PRODUK</button>
          <button onClick={() => scrollToSection("galeri")} className="px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:text-emerald-700">GALERI MOMEN</button>
          <button onClick={() => scrollToSection("health-info")} className="px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:text-emerald-700">INFO KESEHATAN</button>
          <button onClick={() => scrollToSection("testimoni")} className="px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:text-emerald-700">TESTIMONI</button>
          <button onClick={() => scrollToSection("contact")} className="px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:text-emerald-700">KONTAK KAMI</button>
          <button onClick={() => scrollToSection("cek-kebutuhan")} className="px-4 py-2 text-xs font-extrabold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-200/50 rounded-lg transition-all flex items-center gap-1">
            <Stethoscope size={13} />
            <span>CEK KEBUTUHAN KONDISI</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }} 
            className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-2 z-40 relative shadow-inner"
          >
            {/* Mobile Search Bar */}
            <div className="relative mb-3">
              <div className="flex items-center border border-emerald-500 rounded-xl bg-white overflow-hidden">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
                  placeholder="Cari obat..." 
                  className="w-full px-3 py-2 text-xs text-gray-800"
                />
                <button onClick={triggerSearch} className="bg-emerald-600 text-white p-2">
                  <Search size={14} />
                </button>
              </div>
            </div>

            <button onClick={() => scrollToSection("home")} className="text-left py-3 font-semibold text-gray-700 border-b border-gray-50">Home</button>
            <button onClick={() => scrollToSection("products-section")} className="text-left py-3 font-semibold text-gray-700 border-b border-gray-50">Katalog Produk</button>
            <button onClick={() => scrollToSection("galeri")} className="text-left py-3 font-semibold text-gray-700 border-b border-gray-50">Galeri</button>
            <button onClick={() => scrollToSection("health-info")} className="text-left py-3 font-semibold text-gray-700 border-b border-gray-50">Info Kesehatan</button>
            <button onClick={() => scrollToSection("testimoni")} className="text-left py-3 font-semibold text-gray-700 border-b border-gray-50">Testimoni</button>
            <button onClick={() => scrollToSection("contact")} className="text-left py-3 font-semibold text-gray-700 border-b border-gray-50">Kontak</button>
            <button onClick={() => scrollToSection("cek-kebutuhan")} className="text-left py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl mt-2 flex items-center gap-1.5">
              <Stethoscope size={16} />
              <span>Cek Kebutuhan &amp; Konsultasi Dokter AI</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO SECTION ===== */}
      <section className="bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 py-16 px-4 relative overflow-hidden text-white" id="home">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold border border-white/15 backdrop-blur-md mb-4 shadow-sm animate-pulse-dot">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Apotek Online Tepercaya Jawa Tengah
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-4 tracking-tight">
              Pesan Obat Dari Rumah <br />
              <span className="text-emerald-300 italic">Semudah Chat WhatsApp!</span>
            </h1>
            <p className="text-base text-gray-100/90 leading-relaxed max-w-xl mb-8">
              Tidak perlu antre atau daftar akun rumit. Kami jembatani Anda langsung dengan apotek berlisensi resmi. 
              Dapatkan <strong>konsultasi gratis dengan apoteker profesional</strong> langsung melalui obrolan pesan privat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={`https://wa.me/${WA_NUM}?text=Halo%20Sehatku%20Store%2C%20saya%20ingin%20berkonsultasi%20mengenai%20keluhan%20kesehatan%20saya.`}
                target="_blank" 
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-black/20 hover:scale-[1.03] transition-all cursor-pointer"
              >
                <Phone size={18} />
                Hubungi Apoteker WA
              </a>
              <button 
                onClick={() => scrollToSection("cek-kebutuhan")}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600/35 border border-white/20 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-2xl hover:bg-emerald-600/50 transition-all cursor-pointer"
              >
                <Stethoscope size={18} />
                Cek Kebutuhan Kondisi
              </button>
            </div>

            <div className="grid grid-columns-4 gap-4 mt-10 max-w-lg border-t border-white/10 pt-8">
              <div>
                <span className="font-display font-black text-2xl block text-emerald-300">500+</span>
                <span className="text-xs text-gray-300">Produk Resmi</span>
              </div>
              <div>
                <span className="font-display font-black text-2xl block text-emerald-300">1.000+</span>
                <span className="text-xs text-gray-300">Pelanggan Puas</span>
              </div>
              <div>
                <span className="font-display font-black text-2xl block text-emerald-300">⭐ 4.9</span>
                <span className="text-xs text-gray-300">Rating Google</span>
              </div>
              <div>
                <span className="font-display font-black text-2xl block text-emerald-300">Fast</span>
                <span className="text-xs text-gray-300">Response WA</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col md:flex-row lg:flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 w-64 shadow-2xl animate-float">
              <span className="text-3xl block mb-2">💊</span>
              <h4 className="font-bold text-sm text-white">Layanan Resep Dokter</h4>
              <p className="text-xs text-gray-200 mt-1">Kirim resep dokter via WA, apoteker kami siapkan obat aslinya.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 w-64 shadow-2xl animate-float" style={{ animationDelay: '1.5s' }}>
              <span className="text-3xl block mb-2">🚀</span>
              <h4 className="font-bold text-sm text-white">Same-Day Delivery</h4>
              <p className="text-xs text-gray-200 mt-1">Order hari ini di area sekitar Kab. Semarang, dikirim di hari yang sama.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPUP PROMO BANNER (Limited Time Only) ===== */}
      <AnimatePresence>
        {showPromoPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative border border-gray-100"
            >
              <button 
                onClick={() => setShowPromoPopup(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X size={18} />
              </button>
              <img 
                src="/promo-banner.jpg" 
                alt="Promo Banner Sehatku Store" 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "https://placehold.co/400x500/10b981/ffffff?text=Promo+Spesial+Apotek") {
                    target.src = "https://placehold.co/400x500/10b981/ffffff?text=Promo+Spesial+Apotek";
                  }
                }}
              />
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 text-center">
                <h4 className="font-display font-black text-emerald-800 text-lg">PROMO SPESIAL HARI INI</h4>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Subsidi Ongkos Kirim Se-Pulau Jawa</p>
                <button 
                  onClick={() => {
                    setShowPromoPopup(false);
                    scrollToSection("products-section");
                  }} 
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-6 rounded-xl w-full cursor-pointer"
                >
                  Belanja Produk Promo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CEK KEBUTUHAN MODAL / FUNNEL ===== */}
      <AnimatePresence>
        {isFunnelOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-gray-100"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">🏥</div>
                  <h3 className="font-display font-black text-gray-900 text-base">Cek Kebutuhan - Sehatku AI</h3>
                </div>
                <button onClick={() => setIsFunnelOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                {/* STEP 1: BIODATA */}
                {funnelStep === 1 && (
                  <div>
                    <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-2xl mb-5 leading-relaxed">
                      💡 <strong>Isi data diri Anda terlebih dahulu.</strong> Informasi ini membantu apoteker memberikan saran obat atau suplemen kesehatan yang aman dan pas dengan tubuh Anda.
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Nama Lengkap Pasien *</label>
                        <input type="text" placeholder="Masukkan nama Anda" value={fName} onChange={(e) => setFName(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Usia (Tahun) *</label>
                          <input type="number" placeholder="Contoh: 25" value={fAge} onChange={(e) => setFAge(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Jenis Kelamin *</label>
                          <select value={fGender} onChange={(e) => setFGender(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                            <option value="Perempuan">Perempuan</option>
                            <option value="Laki-laki">Laki-laki</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Pekerjaan / Aktivitas Utama *</label>
                        <input type="text" placeholder="Contoh: Mahasiswa, Ibu Rumah Tangga dsb" value={fJob} onChange={(e) => setFJob(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl text-sm" />
                      </div>
                      <button onClick={submitFunnelBio} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm mt-3 flex items-center justify-center gap-1 cursor-pointer">
                        Mulai Analisis
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: QUESTIONS */}
                {funnelStep === 2 && funnelType === "diet" && (
                  <div className="space-y-4">
                    <h4 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider text-emerald-600 mb-4">Formulir Diet &amp; Berat Badan</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Apa tujuan utama program diet Anda? *</label>
                      <select value={dietAnswers.goal} onChange={(e) => setDietAnswers({ ...dietAnswers, goal: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Turun BB">Menurunkan Berat Badan (Fat Loss)</option>
                        <option value="Mengecilkan Perut">Mengecilkan Perut Buncit &amp; Detoks</option>
                        <option value="Menjaga BB">Menjaga Berat Badan Ideal &amp; Jantung Sehat</option>
                        <option value="Massa Otot">Membentuk Massa Otot &amp; Stamina</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Bagaimana kebiasaan makan harian Anda? *</label>
                      <select value={dietAnswers.habit} onChange={(e) => setDietAnswers({ ...dietAnswers, habit: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Sering ngemil manis">Sering ngemil gorengan / makanan manis / teh boba</option>
                        <option value="Porsi makan besar">Porsi makan selalu besar &amp; porsi nasi banyak</option>
                        <option value="Jarang makan berat">Sering skip makan utama tetapi sering jajan kalori tinggi</option>
                        <option value="Makan teratur">Pola makan bersih &amp; teratur namun berat badan stagnan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Rata-rata konsumsi air putih harian? *</label>
                      <select value={dietAnswers.water} onChange={(e) => setDietAnswers({ ...dietAnswers, water: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Kurang dari 1 liter">Sangat kurang (&lt; 1 Liter / 4 gelas)</option>
                        <option value="Sekitar 1-2 liter">Cukup (sekitar 1.5 - 2 Liter)</option>
                        <option value="Lebih dari 2 liter">Bagus sekali (&gt; 2 Liter / 8 gelas)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Berat Badan (kg) *</label>
                        <input type="number" placeholder="Contoh: 70" value={dietAnswers.weight || ""} onChange={(e) => setDietAnswers({ ...dietAnswers, weight: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Tinggi Badan (cm) *</label>
                        <input type="number" placeholder="Contoh: 170" value={dietAnswers.height || ""} onChange={(e) => setDietAnswers({ ...dietAnswers, height: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Tingkat aktivitas fisik harian Anda? *</label>
                      <select value={dietAnswers.activity || ""} onChange={(e) => setDietAnswers({ ...dietAnswers, activity: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Sangat jarang olahraga">Sangat jarang olahraga (banyak duduk/kerja meja)</option>
                        <option value="Olahraga ringan">Olahraga ringan (1-2x seminggu, jalan kaki/sepeda santai)</option>
                        <option value="Olahraga aktif">Olahraga aktif (3-5x seminggu, gym/cardio/futsal intensif)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Apakah Anda memiliki riwayat keluhan medis? *</label>
                      <select value={dietAnswers.medical || ""} onChange={(e) => setDietAnswers({ ...dietAnswers, medical: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Tidak ada riwayat">Tidak ada riwayat penyakit serius</option>
                        <option value="Maag / Asam lambung">Maag / Asam lambung tinggi (GERD)</option>
                        <option value="Kolesterol tinggi / Hipertensi">Kolesterol tinggi atau Hipertensi</option>
                        <option value="Diabetes / Gula tinggi">Diabetes / Kadar gula darah tinggi</option>
                      </select>
                    </div>
                    <div className="flex gap-2.5 pt-4">
                      <button onClick={() => setFunnelStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer">
                        <ArrowLeft size={16} /> Kembali
                      </button>
                      <button onClick={handleConsultation} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer">
                        Analisis Kondisi <Sparkles size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* SKIN QUESTIONS */}
                {funnelStep === 2 && funnelType === "kulit" && (
                  <div className="space-y-4">
                    <h4 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider text-emerald-600 mb-4">Formulir Kesehatan Kulit</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Jenis kulit wajah Anda secara umum? *</label>
                      <select value={kulitAnswers.type} onChange={(e) => setSkinAnswers({ ...kulitAnswers, type: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Berminyak">Berminyak (T-Zone selalu berkilau &amp; mudah komedo)</option>
                        <option value="Kering">Kering &amp; kencang (kulit bersisik / dehidrasi)</option>
                        <option value="Kombinasi">Kombinasi (berminyak di dahi/hidung, kering di pipi)</option>
                        <option value="Sensitif">Sensitif (mudah merah, gatal, bruntusan perih)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Apa masalah utama kulit yang paling mengganggu? *</label>
                      <select value={kulitAnswers.concern} onChange={(e) => setSkinAnswers({ ...kulitAnswers, concern: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Jerawat parah">Jerawat membandel / bruntusan bernanah parah</option>
                        <option value="Kusam & flek hitam">Kusam, flek hitam, bekas jerawat kehitaman (PIH)</option>
                        <option value="Garis halus/keriput">Kerutan halus, kendur (penuaan dini &amp; garis tawa)</option>
                        <option value="Pori besar">Pori-pori tampak besar &amp; komedo membandel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Seberapa sering Anda memakai sunscreen harian? *</label>
                      <select value={kulitAnswers.makeup} onChange={(e) => setSkinAnswers({ ...kulitAnswers, makeup: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Rutin setiap hari">Selalu pakai tiap pagi &amp; reapply siang hari</option>
                        <option value="Hanya jika keluar rumah">Pakai jika hanya beraktivitas keluar rumah</option>
                        <option value="Jarang sekali">Sangat jarang / tidak pernah memakai sunscreen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Tahapan skincare rutin Anda saat ini? *</label>
                      <select value={kulitAnswers.routine || ""} onChange={(e) => setSkinAnswers({ ...kulitAnswers, routine: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Basic saja">Hanya cuci muka dengan sabun biasa</option>
                        <option value="Menengah">Lengkap basic (sabun cuci muka + pelembab + sunscreen)</option>
                        <option value="Lengkap">Advance (double cleansing, toner, serum, pelembab, dll)</option>
                        <option value="Tidak ada">Sama sekali belum pernah memakai skincare</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Bagaimana aktivitas harian Anda? *</label>
                      <select value={kulitAnswers.outdoor || ""} onChange={(e) => setSkinAnswers({ ...kulitAnswers, outdoor: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Mayoritas indoor">Mayoritas di ruangan ber-AC (indoor)</option>
                        <option value="Outdoor terpapar langsung">Sering terpapar debu, polusi, dan matahari langsung (outdoor)</option>
                        <option value="Seimbang">Seimbang antara aktivitas indoor dan outdoor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Apakah Anda memiliki riwayat alergi kosmetik? *</label>
                      <select value={kulitAnswers.allergy || ""} onChange={(e) => setSkinAnswers({ ...kulitAnswers, allergy: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl text-sm">
                        <option value="">-- Pilih --</option>
                        <option value="Tidak ada alergi">Tidak ada alergi kosmetik/skincare</option>
                        <option value="Alergi fragrance/parfum">Mudah bruntusan / gatal jika memakai produk berparfum (fragrance)</option>
                        <option value="Sensitif eksfoliator keras">Kulit perih/mengelupas jika memakai eksfoliator (AHA/BHA) konsentrasi tinggi</option>
                      </select>
                    </div>
                    <div className="flex gap-2.5 pt-4">
                      <button onClick={() => setFunnelStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer">
                        <ArrowLeft size={16} /> Kembali
                      </button>
                      <button onClick={handleConsultation} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer">
                        Analisis Kondisi <Sparkles size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: RESULT & AI ANALYSIS */}
                {funnelStep === 3 && (
                  <div className="space-y-5">
                    {isConsulting ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-semibold text-gray-600 animate-pulse">Apoteker AI Sehatku sedang menganalisis kondisi Anda...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow-lg">
                          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md text-white uppercase tracking-wider">Hasil Diagnosis Awal</span>
                          <h4 className="font-display font-black text-xl mt-1">Halo, Kak {fName}! 👋</h4>
                          <p className="text-xs text-emerald-100 mt-0.5">Usia: {fAge} tahun | Pekerjaan: {fJob}</p>
                        </div>

                        <div className="border border-gray-100 rounded-2xl p-4.5 bg-gray-50/50">
                          <h5 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> Analisis Gejala &amp; Kondisi</h5>
                          <p className="text-sm text-gray-700 leading-relaxed font-semibold">{consultResult?.analysis}</p>
                        </div>

                        <div className="border border-gray-100 rounded-2xl p-4.5 bg-gray-50/50">
                          <h5 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><FileText size={13} className="text-emerald-500" /> Saran Gaya Hidup Apoteker</h5>
                          <p className="text-sm text-gray-600 leading-relaxed">{consultResult?.advice}</p>
                        </div>

                        {consultResult?.products && consultResult.products.length > 0 && (
                          <div className="border border-gray-100 rounded-2xl p-4.5 bg-emerald-50/30">
                            <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1"><ShoppingBag size={13} className="text-emerald-600" /> Rekomendasi Kandungan / Produk</h5>
                            <div className="space-y-2.5">
                              {consultResult.products.map((item, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                                  <p className="text-xs font-black text-emerald-800">{item.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button 
                          onClick={sendFunnelToWA}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
                        >
                          <Phone size={18} />
                          Konsultasikan Lanjut via WhatsApp Gratis
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CATALOG SECTIONS (Kategori obat) ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12" id="products-section">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Katalog Resmi</span>
            <h2 className="font-display font-black text-3xl text-gray-900 mt-2">Daftar Produk <span>Apotek Sehatku</span></h2>
            <p className="text-xs text-gray-500 mt-1">Daftar produk tepercaya, original, terdaftar BPOM dan langsung dari apotek berlisensi.</p>
          </div>
          {/* Swipe indicator */}
          <div className="bg-teal-50 border border-teal-100/70 text-teal-800 text-xs px-4 py-2 rounded-xl flex items-center gap-1 font-semibold md:hidden">
            <span>Geser ke kanan untuk melihat produk</span>
            <ArrowRight size={14} className="animate-pulse" />
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none scroll-smooth">
          {[
            { id: "all", label: "Semua Kategori" },
            { id: "kecantikan", label: "Kecantikan & Acne" },
            { id: "anak", label: "Kesehatan Anak" },
            { id: "dewasa", label: "Kebutuhan Dewasa" },
            { id: "vitamin", label: "Vitamin & Suplemen" },
            { id: "herbal", label: "Minyak & Herbal" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentCat(tab.id)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs shrink-0 border transition-all cursor-pointer ${currentCat === tab.id ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {FAST_PRODUCTS.filter(p => currentCat === "all" || p.cat === currentCat).map((p) => (
            <motion.div 
              key={p.id}
              onClick={() => {
                setSelectedProduct(p);
                setSelectedProductQty(1);
              }}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group cursor-pointer relative"
            >
              <div className="relative">
                {p.isBest && <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-md">Best</span>}
                {p.isPromo && <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-md">Promo</span>}
                <div className="bg-gray-50/70 p-4 aspect-square flex items-center justify-center overflow-hidden">
                  <img src={p.img} alt={p.name} onError={handleProductImageError} loading="lazy" decoding="async" className="max-h-36 object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.cat}</span>
                  <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug mt-0.5 group-hover:text-emerald-700 transition-colors">{p.name}</h4>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display font-black text-emerald-600 text-sm">{formatRupiah(p.price)}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p, 1);
                    }}
                    className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CEK KEBUTUHAN CARD FUNNEL SECTION ===== */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50/50 py-14 px-4 border-y border-emerald-100" id="cek-kebutuhan">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Diagnosis Interaktif</span>
          <h2 className="font-display font-black text-3xl text-gray-900 mt-2">Cek Kebutuhan Sehat &amp; Kulit Anda</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-lg mx-auto">Butuh diet sehat terarah atau bingung merawat jerawat/kulit kusam? Konsultasikan kondisi Anda pada asisten apoteker medis kami secara instan.</p>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-white border border-gray-100 p-6 rounded-3xl text-left shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-3xl block mb-2">🥗</span>
                <h4 className="font-display font-black text-lg text-gray-800">Program Diet &amp; Berat Badan</h4>
                <p className="text-xs text-gray-500 mt-1">Cari tahu Indeks Massa Tubuh (IMT) ideal serta rekomendasi suplemen alami penurun nafsu makan atau penambah kalori sehat.</p>
              </div>
              <button onClick={() => openFunnel("diet")} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10">
                <Stethoscope size={15} /> Mulai Cek Diet
              </button>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl text-left shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-3xl block mb-2">✨</span>
                <h4 className="font-display font-black text-lg text-gray-800">Skincare &amp; Kesehatan Kulit</h4>
                <p className="text-xs text-gray-500 mt-1">Analisis jenis kulit berminyak, kering, atau sensitif Anda, dan pilih kandungan aktif anti-jerawat atau anti-aging yang aman.</p>
              </div>
              <button onClick={() => openFunnel("kulit")} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10">
                <Stethoscope size={15} /> Mulai Cek Kulit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNER PRODUCTS (Slider) ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12" id="promo">
        <span className="bg-red-100 text-red-600 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Penawaran Menarik</span>
        <h2 className="font-display font-black text-2xl text-gray-900 mt-2">Daftar Produk Tepercaya Terlaris</h2>
        <p className="text-xs text-gray-500 mt-1">Subsidi ongkir ke seluruh wilayah Jawa Tengah dan respons pesan WhatsApp super cepat.</p>
        
        <div className="flex gap-4 overflow-x-auto pb-4 mt-6 scroll-smooth scrollbar-none">
          {PROMO_BANNER_PRODUCTS.map((p, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                const text = `Halo Sehatku Store 🏥, saya ingin memesan produk promo berikut: ${p.name}. Mohon dikonfirmasi ketersediaan barangnya ya kak.`;
                window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="bg-white border border-gray-100 rounded-2xl p-4 w-44 shrink-0 flex flex-col justify-between cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="bg-gray-50/50 rounded-xl p-2 aspect-square flex items-center justify-center overflow-hidden mb-3">
                <img src={p.img} alt={p.name} onError={handleProductImageError} loading="lazy" decoding="async" className="max-h-24 object-contain" />
              </div>
              <div>
                <span className="bg-red-50 text-red-600 text-[9px] font-black py-0.5 px-2 rounded-md uppercase tracking-wider block w-max mb-1">PROMO</span>
                <h5 className="font-bold text-xs text-gray-800 line-clamp-2 leading-tight">{p.name}</h5>
                <button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer">Pesan Sekarang</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MOMEN GALERI ===== */}
      <section className="bg-gray-900 py-14 text-white" id="galeri">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <span className="bg-white/10 text-emerald-300 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Momen Kami</span>
          <h2 className="font-display font-black text-3xl text-white mt-2">Galeri Kepercayaan Pelanggan</h2>
          <p className="text-xs text-gray-400 mt-1 mb-8">Kondisi apotek resmi sehatku yang nyaman, higienis, bersih, dan profesional.</p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY_ITEMS.map((g, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedGalleryItem({ src: g.src, title: g.title, isVideo: g.type === 'video' })}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-4/3 bg-gray-800 border border-white/5 shadow-lg"
              >
                {g.type === "video" ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-black/40">
                    <Video className="absolute text-white/80 w-12 h-12" />
                    <video src={g.src} className="w-full h-full object-cover opacity-80" muted playsInline />
                  </div>
                ) : (
                  <img src={g.src} alt={g.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <h4 className="font-bold text-sm text-white">{g.title}</h4>
                  <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INFO KESEHATAN & EDUKASI ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-gray-100" id="health-info">
        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Edukasi Farmasi</span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 mb-6">
          <div>
            <h2 className="font-display font-black text-2xl text-gray-900">Informasi Sehat Dari Apoteker</h2>
            <p className="text-xs text-gray-500 mt-1">Artikel edukasi harian terlengkap &amp; berita kesehatan live otomatis agar Anda selalu update.</p>
          </div>
          
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
            {["Semua", "Kabar Sehat", "Skincare", "Edukasi Obat", "Tips Kesehatan Umum"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveArticleCat(cat);
                  setShowAllArticles(false);
                }}
                className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeArticleCat === cat 
                    ? "bg-white text-emerald-700 shadow-sm animate-fade-in" 
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeArticleCat === "Semua" ? articles : articles.filter(a => a.category === activeArticleCat))
            .slice(0, showAllArticles ? undefined : 6)
            .map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-xs text-emerald-600 font-bold uppercase tracking-wide">{item.category}</span>
                    {item.typeLabel === "Berita Otomatis" && (
                      <span className="bg-blue-50 text-blue-700 text-[9px] font-black tracking-wide px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 animate-pulse border border-blue-100">
                        <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                        LIVE UPDATE
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-black text-gray-800 text-base mt-1 leading-snug">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">{item.desc}</p>
                </div>
                <div className="bg-gray-50 p-4 px-5 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold">{item.tanggal}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 font-extrabold flex items-center gap-1 hover:text-emerald-700">
                    {item.btnLabel || "Baca Selengkapnya"}
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))}
        </div>

        {/* Load More Button */}
        {(activeArticleCat === "Semua" ? articles : articles.filter(a => a.category === activeArticleCat)).length > 6 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllArticles(!showAllArticles)}
              className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {showAllArticles ? "Tampilkan Lebih Sedikit" : "Tampilkan Semua Artikel"}
            </button>
          </div>
        )}
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-emerald-50/40 py-14 border-t border-gray-100" id="testimoni">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Ulasan Asli</span>
          <h2 className="font-display font-black text-3xl text-gray-900 mt-2 text-center md:text-left">Kisah Sukses Sembuh Pelanggan Kami</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between relative hover:shadow-md transition-all">
                <span className="absolute top-4 right-4 text-emerald-100 font-display font-black text-5xl select-none leading-none">“</span>
                <div>
                  <div className="flex gap-1 text-amber-500 mb-3">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full text-white font-extrabold flex items-center justify-center text-xs" style={{ backgroundColor: t.color }}>{t.init}</div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-800">{t.name}</h5>
                    <p className="text-[10px] text-gray-400 font-semibold">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ & LOCAL SEO INFO SECTION (SEO & Trust Booster) ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 border-t border-gray-100" id="faq-seo">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Tanya Jawab</span>
            <h2 className="font-display font-black text-3xl text-gray-900 mt-2 leading-tight">Pertanyaan Populer Sehatku</h2>
            <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
              Temukan informasi lengkap mengenai pembelian obat, pengiriman same-day se-Kabupaten Semarang, keaslian produk BPOM, dan tata cara konsultasi resep dokter secara online di Jawa Tengah.
            </p>
            <div className="mt-6 p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100">
              <h5 className="font-bold text-xs text-emerald-800">Butuh Informasi Lebih Lanjut?</h5>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Layanan konsultasi kesehatan kami terbuka gratis lewat pesan WhatsApp dengan apoteker kami.</p>
              <a 
                href={`https://wa.me/${WA_NUM}?text=Halo%20Sehatku%20Store%2C%20saya%20mau%20tanya-tanya%20mengenai%20layanan%20apotek`} 
                target="_blank" 
                rel="noopener"
                className="mt-3.5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer transition-all active:scale-95"
              >
                Tanya Apoteker Sekarang <ChevronRight size={13} />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-3.5">
            {/* Accordion 1 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs">
              <button 
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full flex justify-between items-center text-left cursor-pointer"
              >
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 pr-4">Apakah seluruh obat dan skincare di Sehatku Store berizin resmi BPOM?</h4>
                <ChevronRight className={`text-emerald-600 transform transition-transform shrink-0 ${openFaq === 1 ? "rotate-90" : ""}`} size={16} />
              </button>
              <AnimatePresence>
                {openFaq === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">
                      Ya, 100% produk obat, multivitamin, jamu herbal, kosmetik, serta produk bayi yang kami sediakan di Sehatku Store dijamin asli dan memiliki izin edar resmi dari BPOM (Badan Pengawas Obat dan Makanan). Kami mengambil pasokan obat langsung dari distributor farmasi resmi demi menjaga orisinalitas dan keamanan Anda.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 2 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs">
              <button 
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full flex justify-between items-center text-left cursor-pointer"
              >
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 pr-4">Apakah melayani pengiriman COD di wilayah Kabupaten Semarang?</h4>
                <ChevronRight className={`text-emerald-600 transform transition-transform shrink-0 ${openFaq === 2 ? "rotate-90" : ""}`} size={16} />
              </button>
              <AnimatePresence>
                {openFaq === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">
                      Betul sekali. Kami menyediakan layanan Bayar di Tempat (COD) khusus untuk area Kabupaten Semarang (termasuk Ungaran Barat, Ungaran Timur, Ambarawa, Bergas, Bawen, Bandungan, Tuntang, Salatiga, Kaliwungu, Klepu, Pringapus, Suruh, Susukan, Tengaran) serta wilayah Kota Semarang lainnya. Anda dapat membayar pesanan tunai ke kurir kami saat obat sampai di rumah.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 3 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs">
              <button 
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full flex justify-between items-center text-left cursor-pointer"
              >
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 pr-4">Bagaimana cara mengirim resep dokter dan membeli obat resep secara online?</h4>
                <ChevronRight className={`text-emerald-600 transform transition-transform shrink-0 ${openFaq === 3 ? "rotate-90" : ""}`} size={16} />
              </button>
              <AnimatePresence>
                {openFaq === 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">
                      Sangat mudah! Anda hanya perlu menekan tombol WhatsApp atau menu Hubungi Apoteker, kemudian foto lembaran resep dokter Anda secara jelas. Apoteker kami akan menganalisis resep tersebut, melakukan konfirmasi dosis &amp; harga, dan menyiapkan obatnya untuk langsung dikirim ke alamat rumah Anda.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 4 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs">
              <button 
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full flex justify-between items-center text-left cursor-pointer"
              >
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 pr-4">Berapa lama estimasi pengiriman pesanan obat di Sehatku Store?</h4>
                <ChevronRight className={`text-emerald-600 transform transition-transform shrink-0 ${openFaq === 4 ? "rotate-90" : ""}`} size={16} />
              </button>
              <AnimatePresence>
                {openFaq === 4 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">
                      Untuk wilayah jangkauan kiriman express (Kota Semarang, Salatiga, Ungaran, Ambarawa, Bawen), obat dapat sampai pada hari yang sama (Same-Day Delivery) antara 1 hingga 4 jam setelah pesanan terkonfirmasi. Sedangkan untuk pengiriman reguler se-Jawa Tengah dikirim melalui ekspedisi kilat (J&amp;T, JNE, POS) dengan estimasi 1-2 hari kerja.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KONTAK & MAP ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14" id="contact">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">Hubungi Kami</span>
            <h2 className="font-display font-black text-3xl text-gray-900 mt-2">Punya Pertanyaan Medis?</h2>
            <p className="text-xs text-gray-500 mt-1.5 mb-6">Hubungi admin atau datang langsung ke apotek rekanan resmi kami di Jawa Tengah.</p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin size={20} /></div>
                <div>
                  <h5 className="font-bold text-sm text-gray-800">Alamat Apotek Rekanan</h5>
                  <p className="text-xs text-gray-500 leading-normal mt-0.5">Kabupaten Semarang, Jawa Tengah</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><Phone size={20} /></div>
                <div>
                  <h5 className="font-bold text-sm text-gray-800">WhatsApp Resmi</h5>
                  <p className="text-xs text-gray-500 leading-normal mt-0.5">0882-0067-29762</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><Clock size={20} /></div>
                <div>
                  <h5 className="font-bold text-sm text-gray-800">Jam Layanan Pesan</h5>
                  <p className="text-xs text-gray-500 leading-normal mt-0.5">Setiap Hari, 08.00 - 21.00 WIB</p>
                </div>
              </div>
            </div>
            
            <a 
              href={`https://wa.me/${WA_NUM}?text=Halo%20Sehatku%20Store%2C%20saya%20butuh%20bantuan%20obat%20sekarang`} 
              target="_blank" 
              rel="noopener"
              className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-4 rounded-2xl inline-flex items-center gap-2 shadow-xl shadow-emerald-600/10 cursor-pointer text-sm"
            >
              <Phone size={18} />
              Chat Admin WhatsApp
            </a>
          </div>
          <div className="h-72 sm:h-96 rounded-3xl overflow-hidden border border-gray-100 shadow-lg">
            <iframe 
              src="https://maps.google.com/maps?q=Kabupaten+Semarang+Jawa+Tengah&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              className="w-full h-full border-none"
              allowFullScreen
              loading="lazy" 
              title="Peta Sehatku"
            />
          </div>
        </div>
      </section>

      {/* ===== PRODUCT DETAIL POPUP ===== */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative border border-gray-100"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
              >
                <X size={16} />
              </button>
              <div className="bg-gray-50/70 p-6 flex items-center justify-center aspect-square max-h-64">
                <img src={selectedProduct.img} alt={selectedProduct.name} onError={handleProductImageError} className="max-h-48 object-contain" />
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedProduct.cat}</span>
                <h3 className="font-display font-black text-xl text-gray-900 mt-1">{selectedProduct.name}</h3>
                <h4 className="font-display font-black text-emerald-600 text-lg mt-2">{formatRupiah(selectedProduct.price)}</h4>
                
                <p className="text-xs text-gray-500 leading-relaxed mt-3 border-t border-gray-100 pt-3">
                  Kandungan aktif terpilih kualitas premium tepercaya. Diambil langsung dari apotek berlisensi resmi untuk keamanan pasien yang maksimal.
                </p>

                <div className="flex items-center gap-3.5 mt-5">
                  <button 
                    onClick={() => setSelectedProductQty(prev => Math.max(1, prev - 1))} 
                    className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-base font-black text-gray-800 min-w-8 text-center">{selectedProductQty}</span>
                  <button 
                    onClick={() => setSelectedProductQty(prev => prev + 1)} 
                    className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    addToCart(selectedProduct, selectedProductQty);
                    setSelectedProduct(null);
                  }}
                  className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-xl shadow-emerald-600/10 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={16} /> Tambah ke Keranjang Belanja
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== GALLERY MODAL POPUP ===== */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setSelectedGalleryItem(null)}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white w-11 h-11 rounded-full flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
            <div className="max-w-3xl w-full">
              {selectedGalleryItem.isVideo ? (
                <video src={selectedGalleryItem.src} controls autoPlay className="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl" />
              ) : (
                <img src={selectedGalleryItem.src} alt={selectedGalleryItem.title} className="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl" />
              )}
              <div className="mt-4 text-center">
                <h4 className="text-white font-bold text-base">{selectedGalleryItem.title}</h4>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CART DRAWER ===== */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" size={20} />
                  <h3 className="font-display font-black text-gray-900 text-base">Keranjang Belanja</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <ShoppingBag size={56} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm">Keranjang belanja kosong</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const p = allMedicines.find(med => med.id === item.id) || FAST_PRODUCTS.find(med => med.id === item.id);
                    if (!p) return null;
                    return (
                      <div key={item.id} className="bg-gray-50 rounded-2xl p-4 flex gap-3.5 border border-gray-100 shadow-xs relative">
                        <img src={p.img} alt={p.name} onError={handleProductImageError} className="w-14 h-14 rounded-lg object-contain bg-white p-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-xs text-gray-800 line-clamp-2 leading-tight">{p.name}</h4>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">{formatRupiah(p.price)} / pcs</p>
                          <div className="flex items-center gap-2.5 mt-2.5">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer shadow-xs"><Minus size={11} /></button>
                            <span className="text-xs font-black text-gray-800 min-w-5 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer shadow-xs"><Plus size={11} /></button>
                            <span className="text-xs font-black text-emerald-600 ml-auto">{formatRupiah(p.price * item.qty)}</span>
                          </div>
                        </div>
                        <button onClick={() => updateCartQty(item.id, -item.qty)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}

                {/* Checkout Form */}
                {cart.length > 0 && (
                  <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                      <Stethoscope size={16} className="text-emerald-600" />
                      <h4 className="font-display font-black text-xs text-gray-800 uppercase tracking-widest">Informasi Pengiriman Alamat</h4>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Lengkap Pemesan *</label>
                      <input 
                        type="text" 
                        value={cName} 
                        onChange={(e) => setCName(e.target.value)} 
                        placeholder="Contoh: Siti Aminah" 
                        className={`w-full p-3 border rounded-xl text-xs outline-none bg-gray-50 focus:bg-white transition-all ${formErrors.name ? "border-red-400 focus:border-red-400" : "border-gray-200"}`} 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">No. WhatsApp Aktif *</label>
                      <input 
                        type="tel" 
                        value={cWA} 
                        onChange={(e) => setCWA(e.target.value)} 
                        placeholder="Contoh: 081234567890" 
                        className={`w-full p-3 border rounded-xl text-xs outline-none bg-gray-50 focus:bg-white transition-all ${formErrors.wa ? "border-red-400 focus:border-red-400" : "border-gray-200"}`} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kabupaten *</label>
                        <select 
                          value={cKab} 
                          onChange={(e) => {
                            setCKab(e.target.value);
                            setCKec("");
                          }}
                          className={`w-full p-3 border rounded-xl text-xs bg-gray-50 ${formErrors.kab ? "border-red-400" : "border-gray-200"}`}
                        >
                          <option value="">Pilih</option>
                          {REGIONS.map(reg => <option key={reg.id} value={reg.nama}>{reg.nama}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kecamatan *</label>
                        <select 
                          value={cKec} 
                          disabled={!cKab}
                          onChange={(e) => setCKec(e.target.value)} 
                          className={`w-full p-3 border rounded-xl text-xs bg-gray-50 ${formErrors.kec ? "border-red-400" : "border-gray-200"}`}
                        >
                          <option value="">Pilih</option>
                          {REGIONS.find(reg => reg.nama === cKab)?.kecamatan.map(kec => (
                            <option key={kec} value={kec}>{kec}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Alamat Lengkap Rinci *</label>
                      <textarea 
                        value={cAddr} 
                        onChange={(e) => setCAddr(e.target.value)} 
                        placeholder="Masukkan nama jalan, No. rumah dsb" 
                        rows={2} 
                        className={`w-full p-3 border rounded-xl text-xs outline-none bg-gray-50 focus:bg-white transition-all ${formErrors.addr ? "border-red-400 focus:border-red-400" : "border-gray-200"}`} 
                      />
                    </div>

                    {/* Payment Opt */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Metode Pembayaran *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => selectPaymentMethod("Transfer")}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedPayment === "Transfer" ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs" : "bg-white text-gray-500 border-gray-200"}`}
                        >
                          🏦 Transfer Bank
                        </button>
                        <button 
                          onClick={() => selectPaymentMethod("COD")}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedPayment === "COD" ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs" : "bg-white text-gray-500 border-gray-200"}`}
                        >
                          💵 Bayar di Tempat (COD)
                        </button>
                      </div>
                    </div>

                    {/* Verification Captcha */}
                    <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                      <label className="block text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-1">Verifikasi Captcha Anti-Bot *</label>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-emerald-700 text-lg leading-none">{captchaA} + {captchaB} =</span>
                        <input 
                          type="number" 
                          value={captchaAns} 
                          onChange={(e) => setCaptchaAns(e.target.value)} 
                          placeholder="?" 
                          className={`w-16 p-2 text-center border rounded-lg text-sm bg-white font-bold outline-none ${!isCaptchaValid ? "border-red-400 bg-red-50" : "border-gray-200"}`} 
                        />
                        <button onClick={resetCaptcha} className="text-emerald-600 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-white"><RefreshCw size={15} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Footer Drawer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-500">Estimasi Tagihan:</span>
                    <span className="font-display font-black text-xl text-emerald-600">{formatRupiah(calculateSubtotal())}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                  >
                    <ShoppingBag size={18} />
                    Pesan via Form WhatsApp
                  </button>
                  
                  <div className="relative flex items-center justify-center my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative px-3 text-[9px] font-black text-gray-400 bg-[#fbfbfb] uppercase tracking-wider">Atau Pesan Lebih Cepat</span>
                  </div>

                  <button 
                    onClick={handleQuickCheckout}
                    className="w-full bg-white hover:bg-emerald-50 text-emerald-700 font-extrabold py-3 rounded-2xl border-2 border-dashed border-emerald-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all hover:scale-[1.01]"
                  >
                    ⚡ Pesan Kilat Tanpa Isi Formulir
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-3.5 leading-relaxed">
                    Apoteker kami akan mengonfirmasi total tagihan akhir &amp; ongkir via WhatsApp.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== SEARCH RESULT POPUP ===== */}
      <AnimatePresence>
        {showSearchPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col justify-between shadow-2xl relative border border-gray-100"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                <h3 className="font-display font-black text-gray-900 text-base">Hasil Pencarian: "{searchQuery}"</h3>
                <button onClick={() => setShowSearchPopup(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {searchResults.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    <Search size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm">Produk tidak ditemukan</p>
                  </div>
                ) : (
                  searchResults.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSelectedProductQty(1);
                        setShowSearchPopup(false);
                      }}
                      className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all shadow-xs"
                    >
                      <div className="bg-white rounded-xl p-2 aspect-square flex items-center justify-center mb-3">
                        <img src={p.img} alt={p.name} onError={handleProductImageError} className="max-h-24 object-contain" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.cat}</span>
                        <h4 className="font-semibold text-xs text-gray-800 line-clamp-2 leading-tight mt-0.5">{p.name}</h4>
                        <h5 className="font-display font-black text-emerald-600 text-xs mt-2">{formatRupiah(p.price)}</h5>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SIMULATED LIVE PURCHASE FEED (Social Proof CRO) ===== */}
      <AnimatePresence>
        {showOrderNotif && recentOrder && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-40 bg-white border border-gray-100 p-3.5 rounded-2xl shadow-2xl max-w-xs sm:max-w-sm flex items-center gap-3.5 cursor-pointer hover:border-emerald-300 transition-all"
            onClick={() => {
              scrollToSection("products-section");
              setShowOrderNotif(false);
            }}
          >
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag size={18} />
            </div>
            <div className="flex-1 pr-3">
              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-xs font-black uppercase tracking-wider">PESANAN VIA WA</span>
              <p className="text-xs text-gray-800 font-bold leading-tight mt-1">
                {recentOrder.name} ({recentOrder.loc})
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Membeli <span className="font-extrabold text-emerald-600">{recentOrder.item}</span>
              </p>
              <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{recentOrder.time}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowOrderNotif(false);
              }}
              className="text-gray-300 hover:text-gray-500 p-1 self-start"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== GLOBAL TOAST NOTIFICATION STYLING ===== */}
      <div className="toast-container" id="toastContainer"></div>

      <div className="cart-add-notif" id="cartAddNotif">
        <CheckCircle2 size={16} className="text-emerald-400" />
        <span id="cartAddNotifText">Produk ditambahkan ke keranjang</span>
      </div>

      {/* ===== FLOATING WHATSAPP CHAT BUTTON ===== */}
      <a 
        href={`https://wa.me/${WA_NUM}?text=Halo%20Sehatku%20Store%2C%20saya%20ingin%20berkonsultasi%20mengenai%20kesehatan%20saya`} 
        target="_blank" 
        rel="noopener"
        className="fixed bottom-24 md:bottom-8 right-6 z-40 bg-gradient-to-r from-emerald-500 to-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all animate-float cursor-pointer"
        aria-label="Hubungi WhatsApp"
      >
        <Phone size={24} />
      </a>

      {/* ===== BACK TO TOP BUTTON ===== */}
      {showBackTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 md:bottom-8 left-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="rotate-90" size={18} />
        </button>
      )}

      {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 p-2 py-3 shadow-inner md:hidden flex justify-around items-center">
        <button onClick={() => scrollToSection("home")} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-600 font-semibold text-[10px] cursor-pointer">
          <Stethoscope size={18} />
          <span>Home</span>
        </button>
        <button onClick={() => scrollToSection("products-section")} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-600 font-semibold text-[10px] cursor-pointer">
          <ShoppingBag size={18} />
          <span>Katalog</span>
        </button>
        <button onClick={() => {
          scrollToSection("home");
          setTimeout(() => searchInputRef.current?.focus(), 300);
        }} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-600 font-semibold text-[10px] cursor-pointer">
          <Search size={18} />
          <span>Cari</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-600 font-semibold text-[10px] cursor-pointer relative">
          <ShoppingBag size={18} />
          <span className="absolute -top-1 right-2 bg-emerald-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
            {cart.reduce((s, i) => s + i.qty, 0)}
          </span>
          <span>Keranjang</span>
        </button>
        <button onClick={() => scrollToSection("contact")} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-600 font-semibold text-[10px] cursor-pointer">
          <Phone size={18} />
          <span>Kontak</span>
        </button>
      </div>

      {/* ===== FOOTER BRANDING ===== */}
      <footer className="bg-gray-900 py-12 border-t border-white/5 text-white/95">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="font-display font-black text-xl text-emerald-400 tracking-tight">sehatku <span className="text-teal-400">store</span></h4>
            <p className="text-xs text-gray-400 leading-relaxed mt-4">
              Platform layanan kesehatan online Jawa Tengah yang menghubungkan Anda dengan apotek berlisensi resmi. 
              Original, berizin BPOM, aman &amp; tepercaya sejak 2021.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-300 uppercase tracking-widest mb-4">Kategori Produk</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><button onClick={() => filterAndScroll("kecantikan")} className="hover:text-white transition-colors cursor-pointer">Kecantikan &amp; Jerawat</button></li>
              <li><button onClick={() => filterAndScroll("anak")} className="hover:text-white transition-colors cursor-pointer">Kesehatan Anak &amp; Bayi</button></li>
              <li><button onClick={() => filterAndScroll("dewasa")} className="hover:text-white transition-colors cursor-pointer">Layanan Dewasa</button></li>
              <li><button onClick={() => filterAndScroll("vitamin")} className="hover:text-white transition-colors cursor-pointer">Vitamin &amp; Suplemen</button></li>
              <li><button onClick={() => filterAndScroll("herbal")} className="hover:text-white transition-colors cursor-pointer">Jamu &amp; Herbal</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-300 uppercase tracking-widest mb-4">Informasi</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><button onClick={() => scrollToSection("galeri")} className="hover:text-white transition-colors cursor-pointer">Galeri Momen</button></li>
              <li><button onClick={() => scrollToSection("health-info")} className="hover:text-white transition-colors cursor-pointer">Info Kesehatan</button></li>
              <li><button onClick={() => scrollToSection("testimoni")} className="hover:text-white transition-colors cursor-pointer">Ulasan Pelanggan</button></li>
              <li><button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors cursor-pointer">Kontak &amp; Alamat</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-300 uppercase tracking-widest mb-4">Masyok Digital</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              © 2026 Sehatku Store. Dikembangkan dengan sepenuh hati oleh MASYOK DIGITAL untuk kemaslahatan kesehatan Jawa Tengah.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  function filterAndScroll(cat: string) {
    setCurrentCat(cat);
    scrollToSection("products-section");
  }
}
