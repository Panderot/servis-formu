// Seller of Fixnote: one place for the legal pages, the footers and the payment page.
// Never add the owner's national ID number (TC kimlik no) here or anywhere else.
export const SATICI = {
  ad: "Baret Güngörmezer",
  marka: "MotiqAI",
  adres: "Mecidiyeköy Mah. Selahattin Pınar Aralığı Sk. Hüseyin Özer İş Merkezi No: 3 İç Kapı No: 8, 34387 Şişli / İstanbul",
  vergiDairesi: "Zincirlikuyu",
  vkn: "4380649547",
  eposta: "info@motiqai.com",
  telefon: "+44 7476 196133",
  web: "https://www.motiqai.com",
} as const;

// The seller block used on the legal pages (a bullet list).
export function saticiSatirlari(dil: "tr" | "en"): string[] {
  const s = SATICI;
  return dil === "en"
    ? [
        `Seller: ${s.ad} (sole proprietorship), brand: ${s.marka}`,
        `Address: ${s.adres}, Türkiye`,
        `Tax office / tax number: ${s.vergiDairesi} / ${s.vkn}`,
        `Email: ${s.eposta}`,
        `Phone / WhatsApp: ${s.telefon}`,
        `Website: ${s.web}`,
      ]
    : [
        `Satıcı: ${s.ad} (şahıs işletmesi), marka: ${s.marka}`,
        `Adres: ${s.adres}`,
        `Vergi dairesi / VKN: ${s.vergiDairesi} / ${s.vkn}`,
        `E-posta: ${s.eposta}`,
        `Telefon / WhatsApp: ${s.telefon}`,
        `Web: ${s.web}`,
      ];
}

// Footer columns (every legal page, app/components/YasalAlt.tsx): "Fixnote" and "Yasal".
export type Baglanti = [href: string, tr: string, en: string];
export const FIXNOTE_LINKLER: Baglanti[] = [
  ["/hakkimizda", "Hakkımızda", "About us"],
  ["/hakkimizda#iletisim", "İletişim", "Contact"],
  ["/app", "Uygulamayı aç", "Open the app"],
];
export const YASAL_LINKLER: Baglanti[] = [
  ["/gizlilik", "Gizlilik Politikası", "Privacy policy"],
  ["/kosullar", "Kullanım ve Abonelik Koşulları", "Terms of use and subscription"],
  ["/mesafeli-satis", "Mesafeli Satış Sözleşmesi", "Distance sales agreement"],
  ["/on-bilgilendirme", "Ön Bilgilendirme Formu", "Pre-information form"],
  ["/teslimat-ve-iade", "Teslimat ve İade", "Delivery and refunds"],
  ["/veri-isleme", "Veri İşleme Sözleşmesi", "Data processing agreement"],
];
