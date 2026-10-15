// Servis Formu motoru: saf mantık (tarayıcı API'si yok, sunucuda da çalışır).
// Rapor modeli, kontrol listesi şablonları, toplam/KDV hesabı, rapor numarası,
// WhatsApp metni, arama ve müşteri geçmişi burada.

export type Musteri = { ad: string; telefon: string; adres: string };
export type Cihaz = { tur: string; marka: string; model: string; seriNo: string };
export type Madde = { ad: string; ok: boolean };
export type Parca = { id: string; ad: string; adet: number; fiyat: number };
export type Foto = { id: string; tur: "once" | "sonra"; src: string };
export type Odeme = "nakit" | "kart" | "havale" | "bekliyor" | "garanti";

export type Rapor = {
  id: string;
  no: string;
  tarih: string; // YYYY-AA-GG (yerel)
  saat: string; // SS:DD
  musteri: Musteri;
  cihaz: Cihaz;
  sablonId: string;
  hizmet: string;
  sikayet: string;
  tespit: string;
  maddeler: Madde[];
  parcalar: Parca[];
  iscilik: number;
  kdv: number; // yüzde
  odeme: Odeme;
  fotolar: Foto[];
  imza: string; // dataURL
  imzalayan: string;
  teknisyen: string;
  not: string;
  sonrakiBakim: string; // YYYY-AA-GG ya da boş
};

export type Firma = {
  ad: string;
  telefon: string;
  eposta: string;
  adres: string;
  vergiDairesi: string;
  vergiNo: string;
  logo: string; // dataURL ya da boş
  kdv: number;
  onek: string;
  teknisyen: string;
  altNot: string;
};

export type Sablon = { id: string; ad: string; cihazTuru: string; maddeler: string[]; ozel?: boolean };

export const SABLONLAR: Sablon[] = [
  {
    id: "kombi",
    ad: "Kombi bakımı",
    cihazTuru: "Kombi",
    maddeler: [
      "Yanma odası ve brülör temizlendi",
      "Eşanjör kontrol edildi, kireç temizlendi",
      "Baca gazı ölçümü yapıldı",
      "Gaz kaçak kontrolü yapıldı",
      "Genleşme tankı basıncı kontrol edildi",
      "Sistem basıncı 1,5 bara ayarlandı",
      "Petek ve tesisat havası alındı",
      "Elektrik bağlantıları ve topraklama kontrol edildi",
      "Cihaz çalışma testi yapıldı",
    ],
  },
  {
    id: "klima",
    ad: "Klima bakımı",
    cihazTuru: "Klima",
    maddeler: [
      "İç ünite filtreleri yıkandı",
      "Evaporatör ilaçlı temizlendi",
      "Drenaj hattı açıldı ve kontrol edildi",
      "Dış ünite kondenseri temizlendi",
      "Gaz basıncı ölçüldü",
      "Üfleme sıcaklığı ölçüldü",
      "Kumanda ve sensör testi yapıldı",
      "Elektrik bağlantıları kontrol edildi",
    ],
  },
  {
    id: "beyaz",
    ad: "Beyaz eşya tamiri",
    cihazTuru: "Çamaşır makinesi",
    maddeler: [
      "Arıza tespiti yapıldı",
      "Arızalı parça değiştirildi",
      "Hortum ve bağlantılar kontrol edildi",
      "Motor ve pompa testi yapıldı",
      "Kapı kilidi ve conta kontrol edildi",
      "Kaçak kontrolü yapıldı",
      "Test programı çalıştırıldı",
    ],
  },
  {
    id: "ilaclama",
    ad: "İlaçlama",
    cihazTuru: "Haşere kontrolü",
    maddeler: [
      "Uygulama alanları belirlendi",
      "Jel yem uygulaması yapıldı",
      "Pülverize ilaçlama yapıldı",
      "Kemirgen istasyonları kontrol edildi",
      "Yuva ve geçiş noktaları için öneri verildi",
      "Bekleme süresi müşteriye bildirildi",
      "Kullanılan ürün ve ruhsat no kaydedildi",
    ],
  },
  {
    id: "elektrik",
    ad: "Elektrik arızası",
    cihazTuru: "Elektrik tesisatı",
    maddeler: [
      "Arıza noktası tespit edildi",
      "Sigorta ve kaçak akım rölesi test edildi",
      "Kablo ve ek yerleri kontrol edildi",
      "Arızalı malzeme değiştirildi",
      "Topraklama ölçümü yapıldı",
      "Gerilim ve yük ölçümü yapıldı",
      "Sistem enerjilendi ve test edildi",
    ],
  },
];

export const ODEME: Record<Odeme, string> = {
  nakit: "Ödendi (nakit)",
  kart: "Ödendi (kart)",
  havale: "Ödendi (havale/EFT)",
  bekliyor: "Ödeme bekliyor",
  garanti: "Garanti kapsamında",
};

export const KDV_ORANLARI = [20, 10, 1, 0];

// ---------- yardımcılar ----------

export const uid = () => Math.random().toString(36).slice(2, 10);

const iki = (n: number) => String(n).padStart(2, "0");

export function bugun(d = new Date()) {
  return { tarih: `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`, saat: `${iki(d.getHours())}:${iki(d.getMinutes())}` };
}

export function tarihTR(iso: string) {
  if (!iso) return "";
  const [y, m, g] = iso.split("-");
  return `${g}.${m}.${y}`;
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
export function tarihUzun(iso: string) {
  if (!iso) return "";
  const [y, m, g] = iso.split("-").map(Number);
  return `${g} ${AYLAR[m - 1]} ${y}`;
}

// Intl farklarına takılmamak için elle biçimlendirme: 1.250,00 TL
export function tl(n: number, birim = true) {
  const neg = n < 0;
  const [tam, kur] = Math.abs(n).toFixed(2).split(".");
  const noktali = tam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${neg ? "-" : ""}${noktali},${kur}${birim ? " TL" : ""}`;
}

export function sayi(s: string) {
  const t = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

export function hesapla(r: Pick<Rapor, "parcalar" | "iscilik" | "kdv" | "odeme">) {
  const parca = r.parcalar.reduce((s, p) => s + (p.adet || 0) * (p.fiyat || 0), 0);
  const ara = r.odeme === "garanti" ? 0 : parca + (r.iscilik || 0);
  const kdv = Math.round(ara * r.kdv) / 100;
  return { parca, iscilik: r.odeme === "garanti" ? 0 : r.iscilik || 0, ara, kdv, toplam: ara + kdv };
}

export function yeniNo(raporlar: Rapor[], onek: string, yil: number) {
  const bas = `${(onek || "SR").toUpperCase()}-${yil}-`;
  const max = raporlar
    .filter((r) => r.no.startsWith(bas))
    .reduce((m, r) => Math.max(m, parseInt(r.no.slice(bas.length), 10) || 0), 0);
  return bas + String(max + 1).padStart(4, "0");
}

export function bosRapor(firma: Firma, raporlar: Rapor[], simdi = new Date()): Rapor {
  const { tarih, saat } = bugun(simdi);
  return {
    id: uid(),
    no: yeniNo(raporlar, firma.onek, simdi.getFullYear()),
    tarih,
    saat,
    musteri: { ad: "", telefon: "", adres: "" },
    cihaz: { tur: "", marka: "", model: "", seriNo: "" },
    sablonId: "",
    hizmet: "",
    sikayet: "",
    tespit: "",
    maddeler: [],
    parcalar: [],
    iscilik: 0,
    kdv: firma.kdv,
    odeme: "nakit",
    fotolar: [],
    imza: "",
    imzalayan: "",
    teknisyen: firma.teknisyen,
    not: "",
    sonrakiBakim: "",
  };
}

export function sablonUygula(r: Rapor, s: Sablon): Rapor {
  return {
    ...r,
    sablonId: s.id,
    hizmet: s.ad,
    cihaz: { ...r.cihaz, tur: r.cihaz.tur || s.cihazTuru },
    maddeler: s.maddeler.map((ad) => ({ ad, ok: true })),
  };
}

export function eksikler(r: Rapor): string[] {
  const e: string[] = [];
  if (!r.musteri.ad.trim()) e.push("Müşteri adı");
  if (telefonRakam(r.musteri.telefon).length < 10) e.push("Müşteri telefonu");
  if (!r.hizmet.trim()) e.push("Hizmet türü");
  if (!r.teknisyen.trim()) e.push("Teknisyen adı");
  if (!r.imza) e.push("Müşteri imzası");
  return e;
}

// ---------- telefon + WhatsApp ----------

export const telefonRakam = (t: string) => t.replace(/\D/g, "");

export function waNumara(tel: string) {
  let d = telefonRakam(tel);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "90" + d.slice(1);
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return d;
}

export function telefonGoster(tel: string) {
  const d = waNumara(tel);
  if (d.length === 12 && d.startsWith("90")) return `0${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  return tel;
}

export function waMetin(r: Rapor, f: Firma) {
  const h = hesapla(r);
  const yapilan = r.maddeler.filter((m) => m.ok).map((m) => m.ad);
  const cihaz = [r.cihaz.tur, r.cihaz.marka, r.cihaz.model].filter(Boolean).join(" ");
  const satirlar = [
    `Sayın ${r.musteri.ad},`,
    `${f.ad || "Servisimiz"} servis raporunuz hazır.`,
    "",
    `Rapor no: ${r.no} (${tarihTR(r.tarih)})`,
    `Hizmet: ${r.hizmet}${cihaz ? `, ${cihaz}` : ""}`,
  ];
  if (r.sikayet) satirlar.push(`Şikayet: ${r.sikayet}`);
  if (yapilan.length) satirlar.push(`Yapılan işlemler (${yapilan.length}): ${yapilan.slice(0, 4).join("; ")}${yapilan.length > 4 ? "; ..." : ""}`);
  if (r.parcalar.length) satirlar.push(`Değişen parça: ${r.parcalar.map((p) => `${p.ad}${p.adet > 1 ? ` x${p.adet}` : ""}`).join(", ")}`);
  if (r.odeme === "garanti") satirlar.push("Ücret: Garanti kapsamında, ücret alınmadı.");
  else satirlar.push(`Toplam: ${tl(h.toplam)} (KDV dahil), ${ODEME[r.odeme]}`);
  if (r.sonrakiBakim) satirlar.push(`Sonraki bakım: ${tarihTR(r.sonrakiBakim)}`);
  satirlar.push(`Teknisyen: ${r.teknisyen}`);
  satirlar.push("");
  satirlar.push("İmzalı PDF raporunuz ayrıca iletilecektir. Bizi tercih ettiğiniz için teşekkür ederiz.");
  if (f.telefon) satirlar.push(`${f.ad} · ${f.telefon}`);
  return satirlar.join("\n");
}

export function waLink(r: Rapor, f: Firma) {
  const n = waNumara(r.musteri.telefon);
  return `https://wa.me/${n}?text=${encodeURIComponent(waMetin(r, f))}`;
}

// ---------- arama + müşteri geçmişi ----------

const kucuk = (s: string) => s.toLocaleLowerCase("tr-TR");

export function ara(raporlar: Rapor[], q: string, hizmet = "") {
  const t = kucuk(q.trim());
  const tr = telefonRakam(q);
  return raporlar
    .filter((r) => !hizmet || r.sablonId === hizmet)
    .filter((r) => {
      if (!t) return true;
      const alan = kucuk([r.no, r.musteri.ad, r.musteri.adres, r.hizmet, r.cihaz.tur, r.cihaz.marka, r.cihaz.model, r.cihaz.seriNo, r.teknisyen, r.sikayet].join(" "));
      if (alan.includes(t)) return true;
      return tr.length >= 3 && telefonRakam(r.musteri.telefon).includes(tr);
    })
    .sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
}

export type MusteriOzet = {
  anahtar: string;
  ad: string;
  telefon: string;
  adres: string;
  sayi: number;
  toplam: number;
  son: string;
  cihazlar: Cihaz[];
  bekleyen: number;
};

export const musteriAnahtar = (m: Musteri) => waNumara(m.telefon) || kucuk(m.ad.trim());

export function musteriler(raporlar: Rapor[]): MusteriOzet[] {
  const map = new Map<string, MusteriOzet>();
  const sirali = [...raporlar].sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
  for (const r of sirali) {
    const k = musteriAnahtar(r.musteri);
    if (!k) continue;
    const h = hesapla(r);
    const m = map.get(k) || { anahtar: k, ad: r.musteri.ad, telefon: r.musteri.telefon, adres: r.musteri.adres, sayi: 0, toplam: 0, son: r.tarih, cihazlar: [], bekleyen: 0 };
    m.sayi += 1;
    m.toplam += h.toplam;
    if (r.odeme === "bekliyor") m.bekleyen += h.toplam;
    const ck = (c: Cihaz) => kucuk(`${c.tur}|${c.marka}|${c.model}|${c.seriNo}`);
    if ((r.cihaz.marka || r.cihaz.model) && !m.cihazlar.some((c) => ck(c) === ck(r.cihaz))) m.cihazlar.push(r.cihaz);
    map.set(k, m);
  }
  return [...map.values()].sort((a, b) => b.son.localeCompare(a.son));
}

export function gecmis(raporlar: Rapor[], anahtar: string) {
  return raporlar.filter((r) => musteriAnahtar(r.musteri) === anahtar).sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
}

export function ozet(raporlar: Rapor[], ay: string) {
  const buAy = raporlar.filter((r) => r.tarih.startsWith(ay));
  const ciro = buAy.reduce((s, r) => s + hesapla(r).toplam, 0);
  const bekleyen = raporlar.filter((r) => r.odeme === "bekliyor").reduce((s, r) => s + hesapla(r).toplam, 0);
  const imzali = raporlar.length ? Math.round((raporlar.filter((r) => r.imza).length / raporlar.length) * 100) : 0;
  return { adet: buAy.length, ciro, bekleyen, imzali };
}

// ---------- demo verisi ----------

export const DEMO_FIRMA: Firma = {
  ad: "Akyol Isı ve Klima Teknik Servis",
  telefon: "0232 461 27 90",
  eposta: "servis@akyolteknik.com.tr",
  adres: "Kazımdirik Mah. 372. Sok. No: 14, Bornova / İzmir",
  vergiDairesi: "Bornova",
  vergiNo: "0123456789",
  logo: "",
  kdv: 20,
  onek: "SR",
  teknisyen: "Emre Şahin",
  altNot: "Değiştirilen parçalar 1 yıl, işçilik 6 ay garantilidir. Garanti, cihaza yetkisiz müdahale edilmemesi şartıyla geçerlidir.",
};

// Elle çizilmiş gibi duran demo imza (SVG, dataURL)
export function demoImza(tohum: number) {
  let s = tohum;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let x = 18;
  let d = `M ${x} ${60 + r() * 10}`;
  for (let i = 0; i < 7; i++) {
    const nx = x + 26 + r() * 18;
    d += ` C ${x + 8} ${10 + r() * 20}, ${nx - 10} ${70 + r() * 20}, ${nx} ${35 + r() * 25}`;
    x = nx;
  }
  d += ` M 30 ${78 + r() * 6} Q ${x / 2} ${66 + r() * 8} ${x + 12} ${72 + r() * 6}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><path d="${d}" fill="none" stroke="#14213d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Demo kaydı için çizim: klima filtresi önce (kirli) / sonra (temiz). Gerçek fotoğraf değil, illüstrasyon.
export function demoFoto(tur: "once" | "sonra") {
  const kirli = tur === "once";
  let s = 7;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let lekeler = "";
  if (kirli) for (let i = 0; i < 55; i++) lekeler += `<circle cx="${30 + r() * 260}" cy="${30 + r() * 160}" r="${2 + r() * 9}" fill="#6b5a3e" opacity="${0.25 + r() * 0.45}"/>`;
  let izgara = "";
  for (let i = 0; i <= 26; i++) izgara += `<line x1="${30 + i * 10}" y1="30" x2="${30 + i * 10}" y2="190" stroke="${kirli ? "#8a7a5c" : "#9aa7b4"}" stroke-width="1"/>`;
  for (let i = 0; i <= 16; i++) izgara += `<line x1="30" y1="${30 + i * 10}" x2="290" y2="${30 + i * 10}" stroke="${kirli ? "#8a7a5c" : "#9aa7b4"}" stroke-width="1"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220"><rect width="320" height="220" fill="${kirli ? "#d8cfbd" : "#e9eef2"}"/><rect x="22" y="22" width="276" height="176" rx="6" fill="${kirli ? "#c7b998" : "#f7fafc"}" stroke="#55606b" stroke-width="4"/>${izgara}${lekeler}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type DemoGirdi = Omit<Rapor, "id" | "imza" | "fotolar" | "kdv" | "not"> & { kdv?: number; not?: string; foto?: boolean; imzasiz?: boolean };

const sab = (id: string) => SABLONLAR.find((s) => s.id === id)!;
const mad = (id: string, atla: number[] = []) => sab(id).maddeler.map((ad, i) => ({ ad, ok: !atla.includes(i) }));

const DEMO_GIRDI: DemoGirdi[] = [
  {
    no: "SR-2026-0048", tarih: "2026-10-03", saat: "15:40",
    musteri: { ad: "Ayşe Kaplan", telefon: "0532 418 63 07", adres: "Erzene Mah. 85/7 Sok. No: 3 D: 6, Bornova / İzmir" },
    cihaz: { tur: "Kombi", marka: "Vaillant", model: "ecoTEC pro 24", seriNo: "21184500100245" },
    sablonId: "kombi", hizmet: "Kombi bakımı",
    sikayet: "Sıcak su geç geliyor, basınç sık sık düşüyor.",
    tespit: "Eşanjörde kireçlenme ve genleşme tankında basınç kaybı tespit edildi. Tank basıncı 1 bara tamamlandı, emniyet ventili yenilendi.",
    maddeler: mad("kombi"),
    parcalar: [{ id: "p1", ad: "Emniyet ventili 3 bar", adet: 1, fiyat: 450 }, { id: "p2", ad: "Conta seti", adet: 1, fiyat: 180 }],
    iscilik: 1200, odeme: "kart", imzalayan: "Ayşe Kaplan", teknisyen: "Emre Şahin", sonrakiBakim: "2027-09-15",
  },
  {
    no: "SR-2026-0047", tarih: "2026-10-03", saat: "11:05",
    musteri: { ad: "Kordon Kahve Evi (Murat Er)", telefon: "0544 207 91 32", adres: "Atatürk Cad. No: 212, Alsancak, Konak / İzmir" },
    cihaz: { tur: "Klima", marka: "Mitsubishi Electric", model: "MSZ-HR35", seriNo: "4002317T" },
    sablonId: "klima", hizmet: "Klima bakımı",
    sikayet: "Klima su damlatıyor ve kötü koku yapıyor.",
    tespit: "Drenaj hattı tıkalı, filtreler aşırı kirli. Hat açıldı, evaporatör ilaçlı yıkandı.",
    maddeler: mad("klima"), parcalar: [], iscilik: 950, odeme: "havale",
    imzalayan: "Murat Er", teknisyen: "Emre Şahin", sonrakiBakim: "2027-04-01", foto: true,
  },
  {
    no: "SR-2026-0046", tarih: "2026-10-02", saat: "17:20",
    musteri: { ad: "Hakan Özbek", telefon: "0505 336 12 48", adres: "Kuruçeşme Mah. 6/12 Sok. No: 9, Buca / İzmir" },
    cihaz: { tur: "Çamaşır makinesi", marka: "Arçelik", model: "9100 M", seriNo: "7110541300-4471" },
    sablonId: "beyaz", hizmet: "Beyaz eşya tamiri",
    sikayet: "Makine su boşaltmıyor, program yarıda kalıyor.",
    tespit: "Tahliye pompası arızalı. Pompa değiştirildi, filtre temizlendi.",
    maddeler: mad("beyaz", [4]),
    parcalar: [{ id: "p3", ad: "Tahliye pompası", adet: 1, fiyat: 1150 }],
    iscilik: 750, odeme: "bekliyor", imzalayan: "Hakan Özbek", teknisyen: "Murat Kılıç", sonrakiBakim: "",
  },
  {
    no: "SR-2026-0045", tarih: "2026-10-01", saat: "09:30",
    musteri: { ad: "Zeynep Aral", telefon: "0533 902 44 15", adres: "Bostanlı Mah. 1808 Sok. No: 21, Karşıyaka / İzmir" },
    cihaz: { tur: "Elektrik tesisatı", marka: "", model: "Daire tablosu", seriNo: "" },
    sablonId: "elektrik", hizmet: "Elektrik arızası",
    sikayet: "Mutfak hattında sigorta sürekli atıyor.",
    tespit: "Fırın prizinde yanık ek yeri bulundu. Priz ve 2,5 mm kablo yenilendi, kaçak akım rölesi test edildi.",
    maddeler: mad("elektrik"),
    parcalar: [{ id: "p4", ad: "Topraklı priz (sıva altı)", adet: 2, fiyat: 140 }, { id: "p5", ad: "NYA 2,5 mm kablo (m)", adet: 6, fiyat: 28 }],
    iscilik: 900, odeme: "nakit", imzalayan: "Zeynep Aral", teknisyen: "Murat Kılıç", sonrakiBakim: "",
  },
  {
    no: "SR-2026-0044", tarih: "2026-09-29", saat: "14:15",
    musteri: { ad: "Yeşilvadi Sitesi Yönetimi", telefon: "0232 375 08 66", adres: "Çamlıkule Mah. 2. Sok. No: 4, Bornova / İzmir" },
    cihaz: { tur: "Haşere kontrolü", marka: "", model: "Bodrum kat + çöp odası", seriNo: "" },
    sablonId: "ilaclama", hizmet: "İlaçlama",
    sikayet: "Bodrum katta hamamböceği ve fare izi.",
    tespit: "Çöp odası ve sığınakta yoğun hamamböceği. 6 kemirgen istasyonu kuruldu.",
    maddeler: mad("ilaclama"),
    parcalar: [{ id: "p6", ad: "Kemirgen yem istasyonu", adet: 6, fiyat: 160 }],
    iscilik: 2400, odeme: "havale", imzalayan: "Serkan Uysal", teknisyen: "Emre Şahin", sonrakiBakim: "2026-10-29",
  },
  {
    no: "SR-2026-0043", tarih: "2026-09-26", saat: "10:45",
    musteri: { ad: "Ayşe Kaplan", telefon: "0532 418 63 07", adres: "Erzene Mah. 85/7 Sok. No: 3 D: 6, Bornova / İzmir" },
    cihaz: { tur: "Klima", marka: "Daikin", model: "FTXM35R", seriNo: "E004871" },
    sablonId: "klima", hizmet: "Klima bakımı",
    sikayet: "Sezon sonu bakım.",
    tespit: "Gaz basıncı normal, filtreler yıkandı.",
    maddeler: mad("klima", [4]), parcalar: [], iscilik: 850, odeme: "nakit",
    imzalayan: "Ayşe Kaplan", teknisyen: "Murat Kılıç", sonrakiBakim: "2027-05-01",
  },
  {
    no: "SR-2026-0042", tarih: "2026-09-24", saat: "16:00",
    musteri: { ad: "Selim Turan", telefon: "0542 611 70 29", adres: "Mavişehir Mah. 2042 Sok. No: 7, Karşıyaka / İzmir" },
    cihaz: { tur: "Kombi", marka: "Baymak", model: "Lectus 24", seriNo: "BL24-0091735" },
    sablonId: "kombi", hizmet: "Kombi bakımı",
    sikayet: "Kombi F28 hatası veriyor, ateşleme yapmıyor.",
    tespit: "Ateşleme elektrodu aşınmış, değiştirildi. Gaz valfi ayarı kontrol edildi.",
    maddeler: mad("kombi", [2]),
    parcalar: [{ id: "p7", ad: "Ateşleme elektrodu", adet: 1, fiyat: 520 }],
    iscilik: 0, odeme: "garanti", imzalayan: "Selim Turan", teknisyen: "Emre Şahin", sonrakiBakim: "",
  },
  {
    no: "SR-2026-0041", tarih: "2026-09-22", saat: "13:10",
    musteri: { ad: "Derya Koç", telefon: "0536 284 19 50", adres: "Göztepe Mah. Mithatpaşa Cad. No: 980, Konak / İzmir" },
    cihaz: { tur: "Bulaşık makinesi", marka: "Bosch", model: "SMS4HVI33E", seriNo: "FD9811-00342" },
    sablonId: "beyaz", hizmet: "Beyaz eşya tamiri",
    sikayet: "Makine suyu ısıtmıyor.",
    tespit: "Rezistans arızalı, değiştirildi.",
    maddeler: mad("beyaz", [4, 5]),
    parcalar: [{ id: "p8", ad: "Isıtıcı pompa (rezistanslı)", adet: 1, fiyat: 2350 }],
    iscilik: 800, odeme: "kart", imzalayan: "Derya Koç", teknisyen: "Murat Kılıç", sonrakiBakim: "",
  },
];

export const DEMO_RAPORLAR: Rapor[] = DEMO_GIRDI.map((g, i) => {
  const { foto, imzasiz, ...rest } = g;
  return {
    ...rest,
    id: `demo${i + 1}`,
    kdv: g.kdv ?? 20,
    not: g.not ?? "",
    imza: imzasiz ? "" : demoImza(31 + i * 17),
    fotolar: foto ? [{ id: "f1", tur: "once", src: demoFoto("once") }, { id: "f2", tur: "sonra", src: demoFoto("sonra") }] : [],
  } as Rapor;
});
