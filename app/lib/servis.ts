// Servis Formu motoru: saf mantık (tarayıcı API'si yok, sunucuda da çalışır).
// Rapor modeli, kontrol listesi şablonları, toplam/KDV hesabı, rapor numarası,
// WhatsApp metni, arama ve müşteri geçmişi burada.

export type Musteri = { ad: string; telefon: string; adres: string };
export type Cihaz = { tur: string; marka: string; model: string; seriNo: string };
export type Madde = { ad: string; ok: boolean };
export type Parca = { id: string; ad: string; adet: number; fiyat: number };
export type Foto = { id: string; tur: "once" | "sonra"; src: string };
export type Odeme = "nakit" | "kart" | "havale" | "bekliyor" | "garanti";
export type Dil = "tr" | "en";
export type ParaBirimi = "TL" | "USD" | "EUR" | "GBP";
export const PARA_BIRIMLERI: ParaBirimi[] = ["TL", "USD", "EUR", "GBP"];

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
  dil?: Dil; // report language, fixed when the report is created (older reports: Turkish)
  para?: ParaBirimi; // currency, fixed when the report is created (older reports: TL)
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
  kvkkNot?: boolean; // short data protection note under reports (app/lib/kvkk.ts)
  raporDili?: Dil; // language of new reports and WhatsApp messages
  paraBirimi?: ParaBirimi; // currency of new reports
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

// Same ids as SABLONLAR, so filters and the "sablonId" of a report work in both languages.
export const SABLONLAR_EN: Sablon[] = [
  {
    id: "kombi",
    ad: "Boiler service",
    cihazTuru: "Boiler",
    maddeler: [
      "Combustion chamber and burner cleaned",
      "Heat exchanger checked and descaled",
      "Flue gas analysis carried out",
      "Gas leak check carried out",
      "Expansion vessel pressure checked",
      "System pressure set to 1.5 bar",
      "Radiators and pipework bled",
      "Electrical connections and earthing checked",
      "Appliance test run completed",
    ],
  },
  {
    id: "klima",
    ad: "Air conditioner service",
    cihazTuru: "Air conditioner",
    maddeler: [
      "Indoor unit filters washed",
      "Evaporator cleaned with coil cleaner",
      "Condensate drain cleared and checked",
      "Outdoor unit condenser cleaned",
      "Refrigerant pressure measured",
      "Supply air temperature measured",
      "Remote control and sensors tested",
      "Electrical connections checked",
    ],
  },
  {
    id: "beyaz",
    ad: "Appliance repair",
    cihazTuru: "Washing machine",
    maddeler: [
      "Fault diagnosed",
      "Faulty part replaced",
      "Hoses and connections checked",
      "Motor and pump tested",
      "Door lock and seal checked",
      "Leak check carried out",
      "Test cycle run",
    ],
  },
  {
    id: "ilaclama",
    ad: "Pest control",
    cihazTuru: "Pest control",
    maddeler: [
      "Treatment areas identified",
      "Gel bait applied",
      "Spray treatment applied",
      "Rodent bait stations checked",
      "Advice given on nests and entry points",
      "Re-entry time explained to the customer",
      "Products used and licence numbers recorded",
    ],
  },
  {
    id: "elektrik",
    ad: "Electrical fault",
    cihazTuru: "Electrical installation",
    maddeler: [
      "Fault located",
      "Fuses and RCD tested",
      "Cables and joints checked",
      "Faulty component replaced",
      "Earth continuity tested",
      "Voltage and load measured",
      "Circuit re-energised and tested",
    ],
  },
];
export const sablonlarDil = (dil: Dil) => (dil === "en" ? SABLONLAR_EN : SABLONLAR);

export const ODEME: Record<Odeme, string> = {
  nakit: "Ödendi (nakit)",
  kart: "Ödendi (kart)",
  havale: "Ödendi (havale/EFT)",
  bekliyor: "Ödeme bekliyor",
  garanti: "Garanti kapsamında",
};
export const ODEME_EN: Record<Odeme, string> = {
  nakit: "Paid (cash)",
  kart: "Paid (card)",
  havale: "Paid (bank transfer)",
  bekliyor: "Payment pending",
  garanti: "Under warranty",
};
export const odemeAd = (o: Odeme, dil: Dil = "tr") => (dil === "en" ? ODEME_EN : ODEME)[o];
// Sales tax name: KDV in Turkish, VAT in English.
export const vergiAd = (dil: Dil = "tr") => (dil === "en" ? "VAT" : "KDV");

export const KDV_ORANLARI = [20, 10, 1, 0];

// ---------- yardımcılar ----------

export const uid = () => Math.random().toString(36).slice(2, 10);

const iki = (n: number) => String(n).padStart(2, "0");

export function bugun(d = new Date()) {
  return { tarih: `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`, saat: `${iki(d.getHours())}:${iki(d.getMinutes())}` };
}

const AYLAR_EN_KISA = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Turkish: 03.10.2026. English: 3 Oct 2026 (day first, month as a word, so it is never misread).
export function tarihTR(iso: string, dil: Dil = "tr") {
  if (!iso) return "";
  const [y, m, g] = iso.split("-");
  if (dil === "en") return `${Number(g)} ${AYLAR_EN_KISA[Number(m) - 1]} ${y}`;
  return `${g}.${m}.${y}`;
}
// Day and month only: 03.10 / 3 Oct
export function tarihGunAy(iso: string, dil: Dil = "tr") {
  if (!iso) return "";
  const [, m, g] = iso.split("-");
  return dil === "en" ? `${Number(g)} ${AYLAR_EN_KISA[Number(m) - 1]}` : `${g}.${m}`;
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const AYLAR_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function tarihUzun(iso: string, dil: Dil = "tr") {
  if (!iso) return "";
  const [y, m, g] = iso.split("-").map(Number);
  return `${g} ${(dil === "en" ? AYLAR_EN : AYLAR)[m - 1]} ${y}`;
}
export const GUN_KISA: Record<Dil, string[]> = {
  tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

// Intl farklarına takılmamak için elle biçimlendirme: 1.250,00 TL
export function tl(n: number, birim = true) {
  const neg = n < 0;
  const [tam, kur] = Math.abs(n).toFixed(2).split(".");
  const noktali = tam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${neg ? "-" : ""}${noktali},${kur}${birim ? " TL" : ""}`;
}

// Money in any currency. Grouping follows the language (tr 1.250,00 / en 1,250.00);
// TL is written after the number, $ € £ before it. kurussuz drops ",00" / ".00".
const SEMBOL: Record<ParaBirimi, string> = { TL: "TL", USD: "$", EUR: "€", GBP: "£" };
export function para(n: number, birim: ParaBirimi = "TL", dil: Dil = "tr", kurussuz = false) {
  const neg = n < 0;
  const [tam, kur] = Math.abs(n).toFixed(2).split(".");
  const grup = tam.replace(/\B(?=(\d{3})+(?!\d))/g, dil === "en" ? "," : ".");
  const sayi = kurussuz && kur === "00" ? grup : `${grup}${dil === "en" ? "." : ","}${kur}`;
  return `${neg ? "-" : ""}${birim === "TL" ? `${sayi} TL` : `${SEMBOL[birim]}${sayi}`}`;
}
export const paraSembol = (b: ParaBirimi) => SEMBOL[b];

// Language and currency of a report. A report keeps the values it was created with; older reports
// have none and are Turkish / TL. New reports take the firm's setting; a firm that has not chosen
// yet (new account, no firm name) follows the app language, an existing firm stays Turkish / TL.
export function raporAyari(f: Firma, uiDil: Dil): { dil: Dil; para: ParaBirimi } {
  const yeni = !f.ad.trim();
  const dil: Dil = f.raporDili || (yeni ? uiDil : "tr");
  return { dil, para: f.paraBirimi || (yeni && dil === "en" ? "USD" : "TL") };
}
export const raporDili = (r: Pick<Rapor, "dil">): Dil => r.dil || "tr";
export const raporPara = (r: Pick<Rapor, "para">): ParaBirimi => r.para || "TL";
export const buyukHarf = (s: string, dil: Dil = "tr") => s.toLocaleUpperCase(dil === "en" ? "en-US" : "tr-TR");

// Parses a typed amount. Turkish: 1.250,50 (dot groups, comma decimals). English: 1,250.50.
export function sayi(s: string, dil: Dil = "tr") {
  const t = dil === "en" ? s.replace(/[\s,]/g, "") : s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
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

export function bosRapor(firma: Firma, raporlar: Rapor[], simdi = new Date(), uiDil: Dil = "tr"): Rapor {
  const { tarih, saat } = bugun(simdi);
  const ayar = raporAyari(firma, uiDil);
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
    dil: ayar.dil,
    para: ayar.para,
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

export function eksikler(r: Rapor, dil: Dil = "tr"): string[] {
  const e: string[] = [];
  const en = dil === "en";
  if (!r.musteri.ad.trim()) e.push(en ? "Customer name" : "Müşteri adı");
  if (telefonRakam(r.musteri.telefon).length < 10) e.push(en ? "Customer phone" : "Müşteri telefonu");
  if (!r.hizmet.trim()) e.push(en ? "Service type" : "Hizmet türü");
  if (!r.teknisyen.trim()) e.push(en ? "Technician name" : "Teknisyen adı");
  if (!r.imza) e.push(en ? "Customer signature" : "Müşteri imzası");
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
  if (raporDili(r) === "en") return waMetinEn(r, f);
  const h = hesapla(r);
  const yapilan = r.maddeler.filter((m) => m.ok).map((m) => m.ad);
  const markaModel = [r.cihaz.marka, r.cihaz.model].filter(Boolean).join(" ");
  const cihaz = [r.cihaz.tur, markaModel].filter(Boolean).join(", ");
  const ad = r.musteri.ad.trim();
  // WhatsApp shows text between asterisks in bold.
  const satirlar = [
    ad ? `Sayın ${ad},` : "Merhaba,",
    `${tarihTR(r.tarih)} tarihli servis işleminiz tamamlandı. Rapor özetiniz aşağıdadır.`,
    "",
    `*Rapor no:* ${r.no}`,
  ];
  if (r.hizmet) satirlar.push(`*Hizmet:* ${r.hizmet}`);
  if (cihaz) satirlar.push(`*Cihaz:* ${cihaz}`);
  if (r.sikayet) satirlar.push(`*Bildirilen sorun:* ${r.sikayet}`);
  if (yapilan.length) {
    satirlar.push("*Yapılan işlemler:*");
    yapilan.slice(0, 4).forEach((m) => satirlar.push(`• ${m}`));
    if (yapilan.length > 4) satirlar.push(`• ve ${yapilan.length - 4} işlem daha (tamamı raporda)`);
  }
  if (r.parcalar.length) satirlar.push(`*Değişen parçalar:* ${r.parcalar.map((p) => `${p.ad}${p.adet > 1 ? ` x${p.adet}` : ""}`).join(", ")}`);
  if (r.odeme === "garanti") satirlar.push("*Ücret:* Garanti kapsamında, ücret alınmadı.");
  else satirlar.push(`*Toplam:* ${para(h.toplam, raporPara(r), "tr")} (KDV dahil), ${ODEME[r.odeme]}`);
  if (r.sonrakiBakim) satirlar.push(`*Sonraki bakım:* ${tarihTR(r.sonrakiBakim)}`);
  if (r.teknisyen) satirlar.push(`*Teknisyen:* ${r.teknisyen}`);
  satirlar.push("");
  satirlar.push("İmzalı servis raporunuz PDF olarak bu mesajın ardından iletilecektir. Bizi tercih ettiğiniz için teşekkür ederiz.");
  if (f.ad || f.telefon) satirlar.push("");
  if (f.ad) satirlar.push(`*${f.ad}*`);
  if (f.telefon) satirlar.push(f.telefon);
  return satirlar.join("\n");
}

function waMetinEn(r: Rapor, f: Firma) {
  const h = hesapla(r);
  const yapilan = r.maddeler.filter((m) => m.ok).map((m) => m.ad);
  const markaModel = [r.cihaz.marka, r.cihaz.model].filter(Boolean).join(" ");
  const cihaz = [r.cihaz.tur, markaModel].filter(Boolean).join(", ");
  const ad = r.musteri.ad.trim();
  const satirlar = [
    ad ? `Dear ${ad},` : "Hello,",
    `Your service visit on ${tarihTR(r.tarih, "en")} is complete. Here is your report summary.`,
    "",
    `*Report no:* ${r.no}`,
  ];
  if (r.hizmet) satirlar.push(`*Service:* ${r.hizmet}`);
  if (cihaz) satirlar.push(`*Appliance:* ${cihaz}`);
  if (r.sikayet) satirlar.push(`*Reported problem:* ${r.sikayet}`);
  if (yapilan.length) {
    satirlar.push("*Work carried out:*");
    yapilan.slice(0, 4).forEach((m) => satirlar.push(`• ${m}`));
    if (yapilan.length > 4) satirlar.push(`• and ${yapilan.length - 4} more (full list in the report)`);
  }
  if (r.parcalar.length) satirlar.push(`*Parts replaced:* ${r.parcalar.map((p) => `${p.ad}${p.adet > 1 ? ` x${p.adet}` : ""}`).join(", ")}`);
  if (r.odeme === "garanti") satirlar.push("*Charge:* Covered by warranty, no charge.");
  else satirlar.push(`*Total:* ${para(h.toplam, raporPara(r), "en")} (incl. VAT), ${ODEME_EN[r.odeme]}`);
  if (r.sonrakiBakim) satirlar.push(`*Next service:* ${tarihTR(r.sonrakiBakim, "en")}`);
  if (r.teknisyen) satirlar.push(`*Technician:* ${r.teknisyen}`);
  satirlar.push("");
  satirlar.push("Your signed service report will follow this message as a PDF. Thank you for choosing us.");
  if (f.ad || f.telefon) satirlar.push("");
  if (f.ad) satirlar.push(`*${f.ad}*`);
  if (f.telefon) satirlar.push(f.telefon);
  return satirlar.join("\n");
}

export function waLink(r: Rapor, f: Firma) {
  const n = waNumara(r.musteri.telefon);
  return `https://wa.me/${n}?text=${encodeURIComponent(waMetin(r, f))}`;
}

// ---------- arama + müşteri geçmişi ----------

// Turkish lowercase, with dotless ı folded into i so "Ian" and "ian" match in both languages.
export const kucuk = (s: string) => s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i");

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

// ---------- English demo (a fictional London firm; phone numbers from Ofcom's drama ranges) ----------

export const DEMO_FIRMA_EN: Firma = {
  ad: "Brightline Heating & Cooling Ltd",
  telefon: "+44 20 7946 0958",
  eposta: "service@brightline-heating.co.uk",
  adres: "14 Mill Lane, Hackney, London E8 2PQ",
  vergiDairesi: "",
  vergiNo: "GB 284 5617 39",
  logo: "",
  kdv: 20,
  onek: "SR",
  teknisyen: "Daniel Hughes",
  altNot: "Replaced parts are guaranteed for 1 year and labour for 6 months, provided the appliance has not been repaired by anyone else.",
  raporDili: "en",
  paraBirimi: "GBP",
};

const sabEn = (id: string) => SABLONLAR_EN.find((s) => s.id === id)!;
const madEn = (id: string, atla: number[] = []) => sabEn(id).maddeler.map((ad, i) => ({ ad, ok: !atla.includes(i) }));

const DEMO_GIRDI_EN: DemoGirdi[] = [
  {
    no: "SR-2026-0048", tarih: "2026-10-03", saat: "15:40",
    musteri: { ad: "Sarah Collins", telefon: "+44 7700 900417", adres: "Flat 6, 3 Elm Grove, Hackney, London E8 3QX" },
    cihaz: { tur: "Boiler", marka: "Vaillant", model: "ecoTEC pro 24", seriNo: "21184500100245" },
    sablonId: "kombi", hizmet: "Boiler service",
    sikayet: "Hot water takes a long time to come through and the pressure keeps dropping.",
    tespit: "Scale in the heat exchanger and pressure loss in the expansion vessel. Vessel recharged to 1 bar, pressure relief valve replaced.",
    maddeler: madEn("kombi"),
    parcalar: [{ id: "p1", ad: "Pressure relief valve 3 bar", adet: 1, fiyat: 45 }, { id: "p2", ad: "Seal kit", adet: 1, fiyat: 18 }],
    iscilik: 120, odeme: "kart", imzalayan: "Sarah Collins", teknisyen: "Daniel Hughes", sonrakiBakim: "2027-09-15",
  },
  {
    no: "SR-2026-0047", tarih: "2026-10-03", saat: "11:05",
    musteri: { ad: "Corner Café (Mark Ellis)", telefon: "+44 7700 900832", adres: "212 Kingsland Road, Dalston, London E2 8AX" },
    cihaz: { tur: "Air conditioner", marka: "Mitsubishi Electric", model: "MSZ-HR35", seriNo: "4002317T" },
    sablonId: "klima", hizmet: "Air conditioner service",
    sikayet: "The unit is dripping water and smells bad.",
    tespit: "Condensate drain blocked and filters very dirty. Drain cleared, evaporator cleaned with coil cleaner.",
    maddeler: madEn("klima"), parcalar: [], iscilik: 95, odeme: "havale",
    imzalayan: "Mark Ellis", teknisyen: "Daniel Hughes", sonrakiBakim: "2027-04-01", foto: true,
  },
  {
    no: "SR-2026-0046", tarih: "2026-10-02", saat: "17:20",
    musteri: { ad: "Tom Bradley", telefon: "+44 7700 900248", adres: "9 Ashwin Street, Dalston, London E8 3DL" },
    cihaz: { tur: "Washing machine", marka: "Beko", model: "WTL84141W", seriNo: "7110541300-4471" },
    sablonId: "beyaz", hizmet: "Appliance repair",
    sikayet: "The machine won't drain and stops mid-cycle.",
    tespit: "Drain pump faulty. Pump replaced, filter cleaned.",
    maddeler: madEn("beyaz", [4]),
    parcalar: [{ id: "p3", ad: "Drain pump", adet: 1, fiyat: 115 }],
    iscilik: 75, odeme: "bekliyor", imzalayan: "Tom Bradley", teknisyen: "Ryan Patel", sonrakiBakim: "",
  },
  {
    no: "SR-2026-0045", tarih: "2026-10-01", saat: "09:30",
    musteri: { ad: "Emma Wright", telefon: "+44 7700 900515", adres: "21 Clapton Square, London E5 8HP" },
    cihaz: { tur: "Electrical installation", marka: "", model: "Consumer unit", seriNo: "" },
    sablonId: "elektrik", hizmet: "Electrical fault",
    sikayet: "The kitchen circuit keeps tripping.",
    tespit: "Scorched joint found behind the oven socket. Socket and 2.5 mm cable replaced, RCD tested.",
    maddeler: madEn("elektrik"),
    parcalar: [{ id: "p4", ad: "Double socket (flush)", adet: 2, fiyat: 14 }, { id: "p5", ad: "2.5 mm twin and earth cable (m)", adet: 6, fiyat: 2.8 }],
    iscilik: 90, odeme: "nakit", imzalayan: "Emma Wright", teknisyen: "Ryan Patel", sonrakiBakim: "",
  },
  {
    no: "SR-2026-0044", tarih: "2026-09-29", saat: "14:15",
    musteri: { ad: "Greenway Court Management", telefon: "+44 20 7946 0366", adres: "Greenway Court, 2 Mare Street, London E8 4RP" },
    cihaz: { tur: "Pest control", marka: "", model: "Basement + bin store", seriNo: "" },
    sablonId: "ilaclama", hizmet: "Pest control",
    sikayet: "Cockroaches and signs of mice in the basement.",
    tespit: "Heavy cockroach activity in the bin store and basement. 6 rodent bait stations installed.",
    maddeler: madEn("ilaclama"),
    parcalar: [{ id: "p6", ad: "Rodent bait station", adet: 6, fiyat: 16 }],
    iscilik: 240, odeme: "havale", imzalayan: "Steven Lowe", teknisyen: "Daniel Hughes", sonrakiBakim: "2026-10-29",
  },
  {
    no: "SR-2026-0043", tarih: "2026-09-26", saat: "10:45",
    musteri: { ad: "Sarah Collins", telefon: "+44 7700 900417", adres: "Flat 6, 3 Elm Grove, Hackney, London E8 3QX" },
    cihaz: { tur: "Air conditioner", marka: "Daikin", model: "FTXM35R", seriNo: "E004871" },
    sablonId: "klima", hizmet: "Air conditioner service",
    sikayet: "End-of-season service.",
    tespit: "Refrigerant pressure normal, filters washed.",
    maddeler: madEn("klima", [4]), parcalar: [], iscilik: 85, odeme: "nakit",
    imzalayan: "Sarah Collins", teknisyen: "Ryan Patel", sonrakiBakim: "2027-05-01",
  },
  {
    no: "SR-2026-0042", tarih: "2026-09-24", saat: "16:00",
    musteri: { ad: "James Turner", telefon: "+44 7700 900729", adres: "7 Lauriston Road, London E9 7EY" },
    cihaz: { tur: "Boiler", marka: "Worcester Bosch", model: "Greenstar 30i", seriNo: "WB30-0091735" },
    sablonId: "kombi", hizmet: "Boiler service",
    sikayet: "Boiler shows fault code EA and won't light.",
    tespit: "Ignition electrode worn, replaced. Gas valve setting checked.",
    maddeler: madEn("kombi", [2]),
    parcalar: [{ id: "p7", ad: "Ignition electrode", adet: 1, fiyat: 52 }],
    iscilik: 0, odeme: "garanti", imzalayan: "James Turner", teknisyen: "Daniel Hughes", sonrakiBakim: "",
  },
  {
    no: "SR-2026-0041", tarih: "2026-09-22", saat: "13:10",
    musteri: { ad: "Olivia Green", telefon: "+44 7700 900950", adres: "48 Old Ford Road, London E2 9PJ" },
    cihaz: { tur: "Dishwasher", marka: "Bosch", model: "SMS4HVI33E", seriNo: "FD9811-00342" },
    sablonId: "beyaz", hizmet: "Appliance repair",
    sikayet: "The dishwasher doesn't heat the water.",
    tespit: "Heating element faulty, replaced.",
    maddeler: madEn("beyaz", [4, 5]),
    parcalar: [{ id: "p8", ad: "Heat pump with heating element", adet: 1, fiyat: 235 }],
    iscilik: 80, odeme: "kart", imzalayan: "Olivia Green", teknisyen: "Ryan Patel", sonrakiBakim: "",
  },
];

export const DEMO_RAPORLAR_EN: Rapor[] = DEMO_GIRDI_EN.map((g, i) => {
  const { foto, imzasiz, ...rest } = g;
  return {
    ...rest,
    id: `demo${i + 1}`,
    kdv: g.kdv ?? 20,
    not: g.not ?? "",
    imza: imzasiz ? "" : demoImza(31 + i * 17),
    fotolar: foto ? [{ id: "f1", tur: "once", src: demoFoto("once") }, { id: "f2", tur: "sonra", src: demoFoto("sonra") }] : [],
    dil: "en",
    para: "GBP",
  } as Rapor;
});

export const demoFirma = (dil: Dil) => (dil === "en" ? DEMO_FIRMA_EN : DEMO_FIRMA);
export const demoRaporlar = (dil: Dil) => (dil === "en" ? DEMO_RAPORLAR_EN : DEMO_RAPORLAR);
