"use client";
import { createContext, useContext } from "react";
import type { Dil } from "../lib/dil";

// Team (Firma plan). The firm account is the owner's account (hesapId = owner's user id). A technician
// signs in with their own account and joins with an invite link; the database functions are in
// supabase/kurulum.sql (sections 1b and 3): hesap_id(), ekip_durumu(), davet_olustur(), ekibe_katil() ...
export type Rol = "sahip" | "teknisyen";
export type EkipDurumu = {
  hesapId: string; // firm account whose records this user sees
  rol: Rol;
  firmaAd: string;
  ekipAcik: boolean; // owner's trial runs or the firm has the Firma plan
  sahipOlusturma: string; // owner's account creation (trial start)
  uyeSayisi: number;
  bekleyenDavet: number;
};
export type EkipBilgi = EkipDurumu & { uid: string };

// Provided by HesapKapisi around /app; null in /demo.
export const EkipBaglam = createContext<EkipBilgi | null>(null);
export const useEkip = () => useContext(EkipBaglam);

export function ekipCevir(v: unknown, uid: string, olusturma: string): EkipDurumu {
  const x = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const hesapId = typeof x.hesap_id === "string" && x.hesap_id ? x.hesap_id : uid;
  return {
    hesapId,
    rol: x.rol === "teknisyen" && hesapId !== uid ? "teknisyen" : "sahip",
    firmaAd: typeof x.firma_ad === "string" ? x.firma_ad : "",
    ekipAcik: x.ekip_acik === true,
    sahipOlusturma: typeof x.sahip_olusturma === "string" ? x.sahip_olusturma : olusturma,
    uyeSayisi: Number(x.uye_sayisi) || 0,
    bekleyenDavet: Number(x.bekleyen_davet) || 0,
  };
}
export const tekBasina = (uid: string, olusturma: string): EkipDurumu => ({ hesapId: uid, rol: "sahip", firmaAd: "", ekipAcik: false, sahipOlusturma: olusturma, uyeSayisi: 0, bekleyenDavet: 0 });

// Last known team state on this device, so a technician also opens the firm's records offline.
const EKIP_ONBELLEK = (uid: string) => `fx_ekip_${uid}`;
export function ekipOnbellekOku(uid: string): EkipDurumu | null {
  try {
    const v = JSON.parse(localStorage.getItem(EKIP_ONBELLEK(uid)) || "null");
    return v && typeof v.hesapId === "string" ? (v as EkipDurumu) : null;
  } catch {
    return null;
  }
}
export function ekipOnbellekYaz(uid: string, e: EkipDurumu | null) {
  try {
    if (e) localStorage.setItem(EKIP_ONBELLEK(uid), JSON.stringify(e));
    else localStorage.removeItem(EKIP_ONBELLEK(uid));
  } catch {}
}

// An invite opened before signing in waits here; /katil and /app continue the join after sign-in.
export const BEKLEYEN_DAVET = "fx_davet";

// The technician's own name for new reports (the firm's "default technician" belongs to the owner).
export const teknisyenAnahtar = (uid: string) => `fx_teknisyen_${uid}`;

// Invite links always use the public site address. A Vercel deployment address (fixnote-xxxx.vercel.app)
// can be protected and is not in the sign-in redirect list. Change ASIL_SITE when the domain changes.
export const ASIL_SITE = "https://fixnotee.vercel.app";
export function davetLinki(kod: string) {
  const kok = window.location.hostname.endsWith(".vercel.app") ? ASIL_SITE : window.location.origin;
  return `${kok}/katil?kod=${encodeURIComponent(kod)}`;
}

// Database errors are short codes (raise exception '<kod>').
export function ekipHataMetni(e: unknown, dil: Dil): string {
  const m = String((e as { message?: string })?.message ?? e ?? "");
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const k = (s: string) => m.includes(s);
  if (k("sahip_degil")) return c("Bunu sadece firma hesabının sahibi yapabilir.", "Only the owner of the company account can do this.");
  if (k("paket")) return c("Bu firma hesabında ekip açık değil. Ekip, deneme süresinde ve Firma paketinde açıktır.", "The team isn't available on this company account. Teams are available during the trial and on the Team plan.");
  if (k("cok_davet")) return c("Kullanılmamış çok fazla davet bağlantısı var. Eskileri iptal edip yeniden dene.", "There are too many unused invite links. Cancel the old ones and try again.");
  if (k("kullanildi")) return c("Bu davet bağlantısı kullanılmış. Her teknisyen için ayrı bağlantı gerekir; firma sahibinden yeni bağlantı iste.", "This invite link has already been used. Each technician needs their own link; ask the owner for a new one.");
  if (k("suresi_doldu")) return c("Bu davet bağlantısının süresi dolmuş (7 gün). Firma sahibinden yeni bağlantı iste.", "This invite link has expired (7 days). Ask the owner for a new one.");
  if (k("gecersiz")) return c("Bu davet bağlantısı geçersiz. Firma sahibinden yeni bağlantı iste.", "This invite link isn't valid. Ask the owner for a new one.");
  if (k("kendi_davetin")) return c("Bu senin kendi davet bağlantın. Teknisyenine gönder, o kendi hesabıyla açsın.", "This is your own invite link. Send it to your technician so they open it with their own account.");
  if (k("zaten_ekipte")) return c("Bu hesap zaten bir firmanın ekibinde. Başka bir ekibe katılmak için önce Ayarlar'dan ekipten ayrıl.", "This account is already in a company's team. To join another team, leave the current one in Settings first.");
  if (k("ekibin_var")) return c("Bu hesabın kendi ekibi var, başka bir ekibe katılamaz.", "This account has its own team, so it can't join another one.");
  if (k("kayitlarin_var")) return c("Bu hesapta kendi raporların var; ekibe katılınca görünmez olurlar. Ekip için başka bir e-postayla hesap aç.", "This account has its own reports, which would be hidden after joining. Open a separate account with another email for the team.");
  if (k("aboneligin_var")) return c("Bu hesabın kendi aboneliği var. Ekip için başka bir e-postayla hesap aç.", "This account has its own subscription. Open a separate account with another email for the team.");
  if (k("yok")) return c("Bu kişi ekipte bulunamadı. Sayfayı yenile.", "This person isn't in the team. Refresh the page.");
  if (k("oturum") || k("JWT") || k("jwt")) return c("Oturumun kapanmış. Yeniden giriş yap.", "Your session has ended. Sign in again.");
  return c("Bir sorun oluştu. Bağlantını kontrol edip tekrar dene.", "Something went wrong. Check your connection and try again.");
}
