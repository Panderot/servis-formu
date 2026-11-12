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
