// Fixnote plans. Prices in Turkish lira, VAT included; the same TL prices in both languages.
// ay: monthly price; yil: yearly, paid up front (20% under 12 months). Used by the landing page,
// the plan page (/abonelik) and the payment API, which checks the provider's plan price against these amounts.
export const PAKET = { usta: { ay: 499, yil: 4790 }, firma: { ay: 1249, yil: 11990 } } as const;
export type Plan = keyof typeof PAKET;
export type Donem = "aylik" | "yillik";
export const PLANLAR: Plan[] = ["usta", "firma"];
export const DONEMLER: Donem[] = ["aylik", "yillik"];
export const planMi = (x: unknown): x is Plan => x === "usta" || x === "firma";
export const donemMi = (x: unknown): x is Donem => x === "aylik" || x === "yillik";
export const tutar = (p: Plan, d: Donem) => (d === "aylik" ? PAKET[p].ay : PAKET[p].yil);

// Licences (task 75): one product, three licence types, TL, VAT included. Sold on WhatsApp (LISANS_WHATSAPP);
// the owner opens the licence by hand in public.abonelikler (donem = the type, plan empty; SQL in CLAUDE.md).
// PAKET above stays for the legal pages and the payment API.
// Card payment (task 81) charges the server's own prices: FIYAT in supabase/functions/_shared/iyzico.ts MUST stay equal to LISANS.
export const LISANS = { aylik: 499, yillik: 4790, suresiz: 8990 } as const;
export type LisansTuru = keyof typeof LISANS;
export const LISANS_TURLERI: LisansTuru[] = ["aylik", "yillik", "suresiz"];
export const GUNCELLEME_YILLIK = 690; // optional updates and support after the first year of a lifetime licence
export const LISANS_WHATSAPP = "905369011714";
export const lisansMi = (x: unknown): x is LisansTuru => x === "aylik" || x === "yillik" || x === "suresiz";

// Turkish 03.10.2026, English 3 Oct 2026
export const tarihKisa = (d: Date, dil: "tr" | "en") =>
  dil === "en" ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
// Status line of an active licence (top bar and the licence page). kisa: phones under 380 px.
export function lisansYazisi(donem: string | null | undefined, bitis: Date, dil: "tr" | "en", kisa = false): string {
  const en = dil === "en";
  const t = tarihKisa(bitis, dil);
  if (donem === "suresiz") return en ? "Lifetime licence" : "Süresiz lisans";
  if (kisa) return en ? `Active · ends ${t}` : `Lisans aktif · bitiş ${t}`;
  if (donem === "aylik") return en ? `Monthly licence · ends ${t}` : `Aylık lisans · bitiş ${t}`;
  if (donem === "yillik") return en ? `Yearly licence · ends ${t}` : `Yıllık lisans · bitiş ${t}`;
  return en ? `Licence active · ends ${t}` : `Lisansın aktif · bitiş ${t}`;
}

// Lira amount as text, without the currency: Turkish "4.790" / "399,17", English "4,790" / "399.17".
// Kuruş only when there are any. Written by hand (not toLocaleString) so server and browser always agree.
export function tlSayi(n: number, dil: "tr" | "en" = "tr"): string {
  const k = Math.round(n * 100);
  const tam = String(Math.floor(k / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, dil === "en" ? "," : ".");
  const kurus = k % 100;
  return kurus ? `${tam}${dil === "en" ? "." : ","}${String(kurus).padStart(2, "0")}` : tam;
}
// Shown with "TL", never the ₺ sign (house style): "499 TL".
export const tl = (n: number, dil: "tr" | "en" = "tr") => `${tlSayi(n, dil)} TL`;

// The price list as sentences, for the legal and company pages.
export function fiyatSatirlari(dil: "tr" | "en"): string[] {
  const { usta, firma } = PAKET;
  return dil === "en"
    ? [
        `Solo (1 technician): ${tl(usta.ay, "en")} a month, or ${tl(usta.yil, "en")} a year paid up front`,
        `Team (unlimited technicians): ${tl(firma.ay, "en")} a month, or ${tl(firma.yil, "en")} a year paid up front`,
      ]
    : [
        `Usta (1 teknisyen): aylık ${tl(usta.ay)} ya da yıllık peşin ${tl(usta.yil)}`,
        `Firma (sınırsız teknisyen): aylık ${tl(firma.ay)} ya da yıllık peşin ${tl(firma.yil)}`,
      ];
}

// Online payment is switched on with NEXT_PUBLIC_ODEME_ACIK=1. Off, subscriptions are opened by
// email (ABONELIK_EPOSTA) and entered by hand, as before.
export const ODEME_ACIK = process.env.NEXT_PUBLIC_ODEME_ACIK === "1";
