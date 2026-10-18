// Fixnote plans. Prices in US dollars, excl. VAT; same in both languages. ay: monthly price;
// yil: yearly, paid up front (20% under 12 months). Used by the landing page, the plan page
// (/abonelik) and the payment API, which checks the Stripe price against these amounts.
export const PAKET = { usta: { ay: 10, yil: 96 }, firma: { ay: 25, yil: 240 } } as const;
export type Plan = keyof typeof PAKET;
export type Donem = "aylik" | "yillik";
export const PLANLAR: Plan[] = ["usta", "firma"];
export const DONEMLER: Donem[] = ["aylik", "yillik"];
export const planMi = (x: unknown): x is Plan => x === "usta" || x === "firma";
export const donemMi = (x: unknown): x is Donem => x === "aylik" || x === "yillik";
export const tutar = (p: Plan, d: Donem) => (d === "aylik" ? PAKET[p].ay : PAKET[p].yil);

// Online payment is switched on with NEXT_PUBLIC_ODEME_ACIK=1. Off, subscriptions are opened by
// email (ABONELIK_EPOSTA) and entered by hand, as before.
export const ODEME_ACIK = process.env.NEXT_PUBLIC_ODEME_ACIK === "1";
