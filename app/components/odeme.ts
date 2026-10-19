import type { Dil } from "../lib/dil";
import type { Donem, Plan } from "../lib/paket";
import { supabase } from "./supabase";

// Browser side of online payment: asks our API for a Stripe page and goes there.
// Returns an error code if it could not ("oturum", "baglanti", "sunucu", ...).
async function git(yol: string, govde: object): Promise<string> {
  const sb = supabase();
  const token = sb ? (await sb.auth.getSession()).data.session?.access_token : undefined;
  if (!token) return "oturum";
  try {
    const r = await fetch(yol, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(govde) });
    const j = (await r.json().catch(() => ({}))) as { url?: string; hata?: string };
    if (r.ok && j.url) {
      window.location.assign(j.url);
      return "";
    }
    return j.hata || "sunucu";
  } catch {
    return "baglanti";
  }
}

// isletme: the user ticked "I use Fixnote for my business" (the API refuses without it and records it in Stripe).
export const odemeBaslat = (plan: Plan, donem: Donem, dil: Dil) => git("/api/odeme", { plan, donem, dil, isletme: true });
export const aboneligiYonet = (dil: Dil) => git("/api/odeme/portal", { dil });

export function odemeHataMetni(kod: string, dil: Dil): string {
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  if (kod === "isletme") return c("Devam etmek için Fixnote'u işin için kullandığını onayla.", "To continue, confirm that you use Fixnote for your business.");
  if (kod === "oturum") return c("Oturumun kapanmış. Tekrar giriş yapıp dene.", "Your session has ended. Sign in again and retry.");
  if (kod === "baglanti") return c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.");
  if (kod === "kapali") return c("Online ödeme şu an kapalı. Abonelik için bize e-posta ile yaz.", "Online payment is off right now. Email us to subscribe.");
  return c("Ödeme sayfası açılamadı. Biraz sonra tekrar dene.", "The payment page couldn't be opened. Try again shortly.");
}
