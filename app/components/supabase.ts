import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase is used ONLY for accounts (login) and the 3-day trial. Service records stay in the
// browser (localStorage sf_*), exactly as before; the panel keeps its demo data.
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_ANAHTAR = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""; // sb_publishable_... (browser-safe)

export const hesapAyarli = SB_URL !== "" && SB_ANAHTAR !== "";
export const DENEME_GUN = 3;
export const ABONELIK_EPOSTA = "info@motiqai.com";
const GUN = 86_400_000;

let tek: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!hesapAyarli || typeof window === "undefined") return null;
  if (!tek) tek = createClient(SB_URL, SB_ANAHTAR, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return tek;
}

export type Durum =
  | { tur: "yukleniyor" }
  | { tur: "ayarsiz" }
  | { tur: "baglanti" }
  | { tur: "deneme"; eposta: string; bitis: Date; kalanGun: number }
  | { tur: "aktif"; eposta: string; bitis: Date }
  | { tur: "bitti"; eposta: string; bitis: Date; abonelik: boolean };

// Trial = account creation + 3 days. A row in public.abonelikler with a future "bitis" date
// (set by hand in the Supabase dashboard) unlocks the app until that date.
export function durumHesapla(eposta: string, olusturma: string, abonelikBitis: string | null, simdi = Date.now()): Durum {
  if (abonelikBitis) {
    const b = new Date(abonelikBitis);
    if (b.getTime() > simdi) return { tur: "aktif", eposta, bitis: b };
    return { tur: "bitti", eposta, bitis: b, abonelik: true };
  }
  const bitis = new Date(new Date(olusturma).getTime() + DENEME_GUN * GUN);
  const kalan = bitis.getTime() - simdi;
  if (kalan > 0) return { tur: "deneme", eposta, bitis, kalanGun: Math.ceil(kalan / GUN) };
  return { tur: "bitti", eposta, bitis, abonelik: false };
}

// Only paths inside the app are allowed after login (no open redirect).
export function guvenliSonra(s: string | null): string {
  return s && /^\/app(\/|\?|$)/.test(s) ? s : "/app";
}

export function hataMetni(m: string): string {
  const s = m.toLowerCase();
  if (s.includes("invalid login credentials")) return "E-posta ya da şifre hatalı.";
  if (s.includes("already registered") || s.includes("already been registered") || s.includes("already exists")) return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.";
  if (s.includes("email not confirmed")) return "E-posta adresin henüz doğrulanmadı. Gelen kutundaki bağlantıya tıkla.";
  const sn = /after (\d+) seconds?/.exec(s);
  if (sn) return `Güvenlik için yeni bağlantıyı ${sn[1]} saniye sonra isteyebilirsin.`;
  if (s.includes("error sending") || s.includes("not authorized")) return `E-posta şu an gönderilemedi. Biraz sonra tekrar dene; sorun sürerse ${ABONELIK_EPOSTA} adresine yaz.`;
  if (s.includes("same password") || s.includes("different from the old")) return "Yeni şifre eskisinden farklı olmalı.";
  if (s.includes("weak") || s.includes("easy to guess") || s.includes("pwned")) return "Bu şifre kolay tahmin ediliyor. Daha güçlü bir şifre seç.";
  if (s.includes("password")) return "Şifre en az 8 karakter olmalı.";
  if (s.includes("rate limit") || s.includes("too many")) return "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.";
  if (s.includes("email")) return "Geçerli bir e-posta adresi yaz.";
  if (s.includes("provider is not enabled") || s.includes("unsupported provider")) return "Google ile giriş henüz açılmadı.";
  if (s.includes("fetch") || s.includes("network")) return "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.";
  return "Bir sorun oluştu. Lütfen tekrar dene.";
}
