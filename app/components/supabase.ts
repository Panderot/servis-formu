import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Current language from <html lang> (kept up to date by app/lib/dil.ts). Read directly so this
// file stays importable from server pages, which use its constants.
const aktifDil = () => (typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "tr");

// Supabase is used ONLY for accounts (login) and the 3-day trial. Service records stay in the
// browser (localStorage sf_*), exactly as before; the panel keeps its demo data.
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_ANAHTAR = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""; // sb_publishable_... (browser-safe)

export const hesapAyarli = SB_URL !== "" && SB_ANAHTAR !== "";
export const DENEME_GUN = 3;
export const ABONELIK_EPOSTA = "info@motiqai.com";
const GUN = 86_400_000;

// "Beni hatırla": on (the default) the session is kept in localStorage and survives closing the
// browser; off, it is kept in sessionStorage and ends when the tab is closed. The choice is made on
// the sign-in page and saved in fx_hatirla before signing in, so a Google redirect keeps it too.
const HATIRLA = "fx_hatirla";
export function hatirlaniyor(): boolean {
  try {
    return localStorage.getItem(HATIRLA) !== "0";
  } catch {
    return true;
  }
}
export function hatirlaAyarla(acik: boolean) {
  try {
    localStorage.setItem(HATIRLA, acik ? "1" : "0");
  } catch {}
}
const oturumDeposu = {
  getItem: (k: string) => {
    try {
      return sessionStorage.getItem(k) ?? localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      const [yaz, sil] = hatirlaniyor() ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
      yaz.setItem(k, v);
      sil.removeItem(k);
    } catch {}
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    } catch {}
  },
};

let tek: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!hesapAyarli || typeof window === "undefined") return null;
  if (!tek) tek = createClient(SB_URL, SB_ANAHTAR, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: oturumDeposu } });
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
  const c = (tr: string, en: string) => (aktifDil() === "en" ? en : tr);
  if (s.includes("invalid login credentials")) return c("E-posta ya da şifre hatalı.", "Wrong email or password.");
  if (s.includes("already registered") || s.includes("already been registered") || s.includes("already exists")) return c("Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.", "There is already an account with this email. Try signing in.");
  if (s.includes("email not confirmed")) return c("E-posta adresin henüz doğrulanmadı. Gelen kutundaki bağlantıya tıkla.", "Your email address isn't confirmed yet. Click the link in your inbox.");
  const sn = /after (\d+) seconds?/.exec(s);
  if (sn) return c(`Güvenlik için yeni bağlantıyı ${sn[1]} saniye sonra isteyebilirsin.`, `For security, you can request a new link in ${sn[1]} seconds.`);
  if (s.includes("error sending") || s.includes("not authorized")) return c(`E-posta şu an gönderilemedi. Biraz sonra tekrar dene; sorun sürerse ${ABONELIK_EPOSTA} adresine yaz.`, `The email couldn't be sent right now. Try again shortly; if it keeps happening, write to ${ABONELIK_EPOSTA}.`);
  if (s.includes("same password") || s.includes("different from the old")) return c("Yeni şifre eskisinden farklı olmalı.", "The new password must be different from the old one.");
  if (s.includes("weak") || s.includes("easy to guess") || s.includes("pwned")) return c("Bu şifre kolay tahmin ediliyor. Daha güçlü bir şifre seç.", "This password is easy to guess. Choose a stronger one.");
  if (s.includes("password")) return c("Şifre en az 8 karakter olmalı.", "The password must be at least 8 characters.");
  if (s.includes("rate limit") || s.includes("too many")) return c("Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.", "Too many attempts. Try again in a few minutes.");
  if (s.includes("email")) return c("Geçerli bir e-posta adresi yaz.", "Enter a valid email address.");
  if (s.includes("provider is not enabled") || s.includes("unsupported provider")) return c("Google ile giriş henüz açılmadı.", "Google sign-in isn't enabled yet.");
  if (s.includes("fetch") || s.includes("network")) return c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.");
  return c("Bir sorun oluştu. Lütfen tekrar dene.", "Something went wrong. Please try again.");
}
