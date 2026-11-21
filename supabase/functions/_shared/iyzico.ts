// Fixnote card payment (task 81): iyzico Checkout Form with plain fetch (no SDK), shared by the Edge Functions.
// Official docs (docs.iyzico.com): IYZWSv2 auth (getting-started/preliminaries/authentication/hmacsha256-auth),
// CF initialize / retrieve (payment-methods/checkoutform/cf-implementation), webhook (advanced/webhook).
// Secrets come from the function environment (supabase secrets set): IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
// (sandbox https://sandbox-api.iyzipay.com, live https://api.iyzipay.com). They are never logged.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.117.2";

export type Donem = "aylik" | "yillik" | "suresiz";
export const DONEMLER: Donem[] = ["aylik", "yillik", "suresiz"];

// PRICES, TL, VAT included. MUST stay equal to LISANS in app/lib/paket.ts (499 / 4790 / 8990). The client never sends a price.
export const FIYAT: Record<Donem, string> = { aylik: "499.00", yillik: "4790.00", suresiz: "8990.00" };
export const URUN_AD: Record<Donem, string> = { aylik: "Fixnote Aylık lisans", yillik: "Fixnote Yıllık lisans", suresiz: "Fixnote Süresiz lisans" };

// The buyer's national ID is not collected (no TC kimlik in Fixnote). iyzico's FAQ (docs.iyzico.com/sss/odeme-alma):
// when it is not collected a sample (dummy) value may be sent. To confirm in the merchant approval talk.
export const KIMLIK_YOK = "11111111111";

const ortam = (ad: string) => {
  const v = Deno.env.get(ad);
  if (!v) throw new Error("eksik ortam degiskeni: " + ad);
  return v;
};

// Service-role client (writes orders, calls odeme_tamamla). Edge Functions get SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// automatically; projects on the new API keys also get SUPABASE_SECRET_KEYS (JSON, "default").
export function yonetici(): SupabaseClient {
  let anahtar = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!anahtar) {
    try {
      anahtar = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? "";
    } catch {
      anahtar = "";
    }
  }
  if (!anahtar) throw new Error("eksik ortam degiskeni: SUPABASE_SERVICE_ROLE_KEY");
  return createClient(ortam("SUPABASE_URL"), anahtar, { auth: { persistSession: false, autoRefreshToken: false } });
}

// The signed-in user from the request's Authorization: Bearer <access token>; null when missing or invalid.
export async function kullanici(req: Request, sb: SupabaseClient) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get("Authorization") ?? "");
  if (!m) return null;
  const { data, error } = await sb.auth.getUser(m[1]);
  return error || !data.user ? null : data.user;
}

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
export async function hmacHex(anahtar: string, metin: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(anahtar), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(metin)));
}
export function esit(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let f = 0;
  for (let i = 0; i < a.length; i++) f |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return f === 0;
}

// IYZWSv2: signature = hex HMAC-SHA256(secretKey, randomKey + uri.path + body);
// Authorization: "IYZWSv2 " + base64("apiKey:" + apiKey + "&randomKey:" + randomKey + "&signature:" + signature); header x-iyzi-rnd.
async function iyzico(yol: string, govde: Record<string, unknown>): Promise<Record<string, unknown>> {
  const apiKey = ortam("IYZICO_API_KEY"), secret = ortam("IYZICO_SECRET_KEY"), taban = ortam("IYZICO_BASE_URL").replace(/\/+$/, "");
  const rnd = `${Date.now()}${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  const body = JSON.stringify(govde);
  const imza = await hmacHex(secret, rnd + yol + body);
  const yetki = "IYZWSv2 " + btoa(`apiKey:${apiKey}&randomKey:${rnd}&signature:${imza}`);
  const r = await fetch(taban + yol, {
    method: "POST",
    headers: { Authorization: yetki, "x-iyzi-rnd": rnd, "Content-Type": "application/json", Accept: "application/json" },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const metin = await r.text();
  try {
    return JSON.parse(metin);
  } catch {
    return { status: "failure", errorCode: "http_" + r.status };
  }
}

export type Fatura = { ad: string; telefon: string; il: string; adres: string; vergi_dairesi?: string; vergi_no?: string };

// Checkout Form initialize: one VIRTUAL basket item at the server price, single installment (so paidPrice = price).
export function cfBaslat(p: { odeme: string; donem: Donem; dil: "tr" | "en"; userId: string; eposta: string; ip: string; fatura: Fatura; callbackUrl: string }) {
  const parca = p.fatura.ad.trim().split(/\s+/);
  const soyad = parca.length > 1 ? parca.pop()! : parca[0];
  const ad = parca.join(" ");
  const adres = { contactName: p.fatura.ad, city: p.fatura.il, country: "Turkey", address: p.fatura.adres };
  return iyzico("/payment/iyzipos/checkoutform/initialize/auth/ecom", {
    locale: p.dil,
    conversationId: p.odeme,
    price: FIYAT[p.donem],
    paidPrice: FIYAT[p.donem],
    currency: "TRY",
    basketId: p.odeme,
    paymentGroup: "PRODUCT",
    callbackUrl: p.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: p.userId,
      name: ad,
      surname: soyad,
      gsmNumber: p.fatura.telefon,
      email: p.eposta,
      identityNumber: KIMLIK_YOK,
      registrationAddress: p.fatura.adres,
      ip: p.ip,
      city: p.fatura.il,
      country: "Turkey",
    },
    shippingAddress: adres,
    billingAddress: adres,
    basketItems: [{ id: p.donem, name: URUN_AD[p.donem], category1: "Yazılım", itemType: "VIRTUAL", price: FIYAT[p.donem] }],
  });
}

// Checkout Form retrieve (the result, read with our secret; the browser's POST is never trusted alone).
export const cfSonuc = (token: string, odeme: string) =>
  iyzico("/payment/iyzipos/checkoutform/auth/ecom/detail", { locale: "tr", conversationId: odeme, token });

type Siparis = { id: string; durum: string; tutar: number | string; iyzico_token: string | null };

// Reads the result from iyzico and finalises the order. Accepted only when status success, paymentStatus SUCCESS,
// fraudStatus 1 (approved), paidPrice = order amount, currency TRY and basketId = order id; then odeme_tamamla (idempotent).
// fraudStatus 0 (in review) keeps the order waiting. A clear failure marks it basarisiz (a later success still counts).
export async function sonuclandir(sb: SupabaseClient, o: Siparis): Promise<{ durum: string; hata?: string }> {
  if (o.durum === "odendi" || o.durum === "iade") return { durum: o.durum };
  if (!o.iyzico_token) return { durum: o.durum };
  let r: Record<string, unknown>;
  try {
    r = await cfSonuc(o.iyzico_token, o.id);
  } catch {
    log("iyzico", "sonuc_okunamadi", o.id);
    return { durum: o.durum };
  }
  const odendi = r.status === "success" && r.paymentStatus === "SUCCESS";
  const tutarTamam = Number(r.paidPrice) === Number(o.tutar) && r.currency === "TRY" && r.basketId === o.id && r.token === o.iyzico_token;
  if (odendi && tutarTamam && Number(r.fraudStatus) === 1) {
    const { data, error } = await sb.rpc("odeme_tamamla", { p_odeme: o.id, p_iyzico_odeme_id: String(r.paymentId ?? "") });
    if (error) {
      log("iyzico", "tamamlanamadi", o.id);
      return { durum: o.durum };
    }
    const sonuc = data as { ok?: boolean; hata?: string; tekrar?: boolean };
    log("iyzico", sonuc.tekrar ? "zaten_odendi" : "odendi", o.id);
    return { durum: "odendi", hata: sonuc.ok ? undefined : sonuc.hata };
  }
  if (odendi && tutarTamam && Number(r.fraudStatus) === 0) {
    await sb.from("odemeler").update({ hata: "fraud_inceleme" }).eq("id", o.id).eq("durum", "bekliyor");
    log("iyzico", "fraud_inceleme", o.id);
    return { durum: "bekliyor" };
  }
  const hata = odendi ? (tutarTamam ? "fraud_red" : "tutar_uyusmuyor") : String(r.errorCode ?? r.paymentStatus ?? "basarisiz").slice(0, 60);
  await sb.from("odemeler").update({ durum: "basarisiz", hata }).eq("id", o.id).in("durum", ["bekliyor", "basarisiz"]);
  log("iyzico", "basarisiz", o.id, hata);
  return { durum: "basarisiz", hata };
}

// Webhook signature (X-IYZ-SIGNATURE-V3), HPP / Checkout Form format:
// hex HMAC-SHA256(secretKey, secretKey + iyziEventType + iyziPaymentId + token + paymentConversationId + status).
export async function bildirimImzasi(b: Record<string, unknown>): Promise<string> {
  const secret = ortam("IYZICO_SECRET_KEY");
  const s = (x: unknown) => (x === undefined || x === null ? "" : String(x));
  return hmacHex(secret, secret + s(b.iyziEventType) + s(b.iyziPaymentId) + s(b.token) + s(b.paymentConversationId) + s(b.status));
}

// Short structured logs: function, event, order id, error code. No personal data, no secrets.
export function log(f: string, olay: string, odeme?: string, hata?: string) {
  console.log(JSON.stringify({ f, olay, odeme, hata }));
}

// CORS for the functions the app calls from the browser (odeme-baslat, odeme-durum).
export function cors(req: Request): Record<string, string> {
  const izinli = [Deno.env.get("UYGULAMA_URL") ?? "", "http://localhost:3000"].map((x) => x.replace(/\/+$/, "")).filter(Boolean);
  const kaynak = req.headers.get("Origin") ?? "";
  return {
    ...(izinli.includes(kaynak) ? { "Access-Control-Allow-Origin": kaynak } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
export const json = (req: Request, durum: number, govde: unknown) =>
  new Response(JSON.stringify(govde), { status: durum, headers: { ...cors(req), "Content-Type": "application/json" } });

export const uygulamaUrl = () => (Deno.env.get("UYGULAMA_URL") ?? "https://fixnotee.vercel.app").replace(/\/+$/, "");
// Where the customer's browser goes after paying: only the order id, never a code or an amount.
export const donusAdresi = (donus: string, odeme?: string) =>
  donus === "apk"
    ? `fixnote://odeme${odeme ? "?odeme=" + encodeURIComponent(odeme) : ""}`
    : `${uygulamaUrl()}/abonelik${odeme ? "?odeme=" + encodeURIComponent(odeme) : ""}`;
