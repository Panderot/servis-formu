"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DilDugmesi } from "../components/Dil";
import { useDil } from "../lib/dil";
import { DENEME_GUN, supabase } from "../components/supabase";
import { aboneligiYonet, odemeHataMetni } from "../components/odeme";
import { OdemeLogolari } from "../components/YasalAlt";
import { GUNCELLEME_YILLIK, IYZICO_ACIK, LISANS, LISANS_TURLERI, LISANS_WHATSAPP, ODEME_ACIK, lisansYazisi, tl, tlSayi, type LisansTuru } from "../lib/paket";
import KartOdeme from "./KartOdeme";

// /abonelik: the licence page (task 75, licence codes task 80). Three licence types (LISANS in app/lib/paket.ts), sold
// on WhatsApp: the button opens a chat with the licence, the amount and the account's email. After payment the owner
// generates a one-time code (../fixnote-kontrol/kod-uret.cjs, FIX-XXXX-XXXX-XXXX-XXXX) and sends it on WhatsApp; the
// customer enters it in "Lisans kodun var mı?" and rpc lisans_kodu_kullan (supabase/kurulum.sql section 6) opens the
// licence at once; the licence cache HesapKapisi reads (fixnote_abonelik) is written so /app shows it immediately.
// A licence opened by hand (SQL in CLAUDE.md, backup method) is still found with "Lisansımı kontrol et".
// Reached from the trial bar, the read-only bar and the side menu in /app (app/components/HesapKapisi.tsx,
// Uygulama.tsx); works during the trial too. Old ?paket= / ?donem= links are ignored.
// The online payment (ODEME_ACIK, Stripe) is kept only for an existing subscription: "manage subscription".
// Card payment (task 81, IYZICO_ACIK = NEXT_PUBLIC_IYZICO_ACIK=1; off, the page is exactly as in task 80): each card gets
// "Kartla öde" (billing step KartOdeme.tsx > Edge Function odeme-baslat > iyzico's page) and a small "WhatsApp'tan sor".
// iyzico brings the customer back to /abonelik?odeme=<order id>; odeme-durum reads the order (and finalises it with iyzico
// if still waiting), up to 3 tries 2 s apart. On load, an order still waiting from the last hour is checked once.
// With card payment on, the licence-code card is not shown (the code system stays in the database as a fallback).
type Hal = { tur: "yukleniyor" } | { tur: "hazir"; uid: string; eposta: string; suruyor: boolean; teknisyen: boolean; deneme: boolean };
type Kontrol = { tur: "" } | { tur: "bakiyor" } | { tur: "yok" } | { tur: "hata" } | { tur: "aktif"; yazi: string };
type KodHata = "gecersiz" | "kullanildi" | "suresi_doldu" | "cok_deneme" | "zaten_suresiz" | "teknisyen" | "baglanti";
type KodDurum = { tur: "" } | { tur: "aciliyor" } | { tur: "acildi"; donem: string; bitis: string } | { tur: "hata"; hata: KodHata };
const KOD_HATALARI: readonly string[] = ["gecersiz", "kullanildi", "suresi_doldu", "cok_deneme", "zaten_suresiz", "teknisyen"];
type OdemeHal = { tur: "" } | { tur: "kontrol" } | { tur: "odendi"; donem: string; bitis: string | null; hata?: string } | { tur: "basarisiz" } | { tur: "bekliyor"; id: string } | { tur: "hata"; id: string };
const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Licence code alphabet (no 0 O 1 I L), the same as kod-uret.cjs. A code never starts with "FIX" (there is no I).
const KOD_ALFABE = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
// Field text -> the code's characters (up to 16, without "FIX"), shown as FIX-XXXX-XXXX-XXXX-XXXX.
// onceki: the field before this change. When the text grows into just "FIX" (typed by hand) "FIX-" stays; when it
// shrinks the field empties, so the prefix can be deleted. A lone "FI" is held until the X of a typed "FIX" arrives.
function kodBicimle(girdi: string, onceki: string): string {
  let s = girdi.toUpperCase().replace(/[^A-Z0-9]/g, "");
  while (s.startsWith("FIX")) s = s.slice(3);
  const govde = s === "FI" ? s : [...s].filter((h) => KOD_ALFABE.includes(h)).join("").slice(0, 16);
  if (!govde) return s === "" && girdi.length > onceki.length && /FIX/i.test(girdi.replace(/[^A-Za-z]/g, "")) ? "FIX-" : "";
  return "FIX-" + (govde.match(/.{1,4}/g) ?? []).join("-");
}
const kodGovdesi = (v: string) => v.replace(/^FIX-?/, "").replace(/-/g, "");
// A whole code inside pasted text (the WhatsApp message itself, say "Merhaba, Fixnote lisans kodunuz: FIX-…"):
// four groups of 4, with or without "FIX". "Fixnote" never matches (o is not in the alphabet). Not found: null.
const KOD_GRUP = "([2-9A-HJKMNP-Z]{4})[\\s-]*";
const KOD_ARA = [new RegExp(`\\bFIX[\\s-]*${KOD_GRUP.repeat(4)}(?![A-Z0-9])`, "i"), new RegExp(`(?<![A-Z0-9])${KOD_GRUP.repeat(4)}(?![A-Z0-9])`, "i")];
function koduBul(metin: string): string | null {
  for (const re of KOD_ARA) {
    const m = re.exec(metin);
    if (m) return "FIX-" + m.slice(1, 5).join("-").toUpperCase();
  }
  return null;
}

const SOZLESMELER = {
  tr: [
    ["https://www.motiqai.com/uygulama-lisans-kosullari.html", "Uygulama Lisans Koşulları"],
    ["https://www.motiqai.com/mesafeli-satis-sozlesmesi.html", "Mesafeli Satış Sözleşmesi"],
    ["https://www.motiqai.com/on-bilgilendirme-formu.html", "Ön Bilgilendirme Formu"],
    ["https://www.motiqai.com/teslimat-iade-cayma.html", "Teslimat, İade ve Cayma"],
  ],
  en: [
    ["https://www.motiqai.com/app-licence-terms.html", "App licence terms"],
    ["https://www.motiqai.com/distance-sales-agreement.html", "Distance sales agreement"],
    ["https://www.motiqai.com/pre-information-form.html", "Pre-information form"],
    ["https://www.motiqai.com/delivery-refunds-withdrawal.html", "Delivery, refunds and withdrawal"],
  ],
} as const;

export default function AbonelikSecimi() {
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [hal, setHal] = useState<Hal>({ tur: "yukleniyor" });
  const [gidiyor, setGidiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [iptal, setIptal] = useState(false);
  const [kontrol, setKontrol] = useState<Kontrol>({ tur: "" });
  const [kod, setKod] = useState("");
  const [kodDurum, setKodDurum] = useState<KodDurum>({ tur: "" });
  const [yapistirVar, setYapistirVar] = useState(false);
  const [secili, setSecili] = useState<LisansTuru | null>(null); // card payment: the licence whose billing step is open
  const [odeme, setOdeme] = useState<OdemeHal>({ tur: "" });

  // Card payment result (odeme-durum). sessiz: the automatic check on load, which only speaks up when the order was paid.
  const odemeKontrol = async (id: string, deneme: number, sessiz = false) => {
    const sb = supabase();
    if (!sb) return;
    if (!sessiz) setOdeme({ tur: "kontrol" });
    let ulasti = false;
    for (let i = 0; i < deneme; i++) {
      if (i) await bekle(2000);
      const { data, error } = await sb.functions.invoke("odeme-durum", { body: { odeme: id } });
      if (error || !data) continue;
      ulasti = true;
      const r = data as { durum?: string; donem?: string; bitis?: string; hata?: string };
      if (r.durum === "odendi") {
        if (r.bitis && r.hata !== "zaten_suresiz") {
          const { data: s } = await sb.auth.getSession();
          try {
            if (s.session) localStorage.setItem("fixnote_abonelik", JSON.stringify({ id: s.session.user.id, bitis: r.bitis, donem: r.donem ?? null }));
          } catch {}
        }
        setOdeme({ tur: "odendi", donem: r.donem ?? "", bitis: r.bitis ?? null, hata: r.hata });
        window.history.replaceState(null, "", "/abonelik");
        return;
      }
      if (r.durum === "basarisiz" || r.durum === "iade") {
        if (!sessiz) setOdeme({ tur: "basarisiz" });
        window.history.replaceState(null, "", "/abonelik");
        return;
      }
    }
    if (!sessiz) setOdeme(ulasti ? { tur: "bekliyor", id } : { tur: "hata", id });
  };

  // Back from iyzico (?odeme=<id>), or an order still waiting from the last hour (a customer who closed the tab).
  useEffect(() => {
    if (!IYZICO_ACIK || hal.tur !== "hazir" || hal.teknisyen || hal.suruyor) return;
    const id = new URLSearchParams(window.location.search).get("odeme");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) {
      void odemeKontrol(id, 3);
      return;
    }
    const sb = supabase();
    if (!sb) return;
    sb.from("odemeler").select("id").eq("user_id", hal.uid).eq("durum", "bekliyor").gte("olusturma", new Date(Date.now() - 3_600_000).toISOString())
      .order("olusturma", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data?.id) void odemeKontrol(data.id, 1, true); });
  }, [hal.tur]);

  // "Paste" only where the browser can read the clipboard (secure page, Clipboard API).
  useEffect(() => {
    setYapistirVar(typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function");
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setIptal(p.get("iptal") === "1");
    const sb = supabase();
    if (!sb) {
      window.location.replace("/app");
      return;
    }
    let bitti = false;
    (async () => {
      const { data } = await sb.auth.getSession();
      if (bitti) return;
      const k = data.session?.user;
      if (!k) {
        window.location.replace("/giris?sonra=%2Fabonelik");
        return;
      }
      // A technician of a team does not buy: the licence is the owner's.
      const { data: ed } = await sb.rpc("ekip_durumu").retry(false);
      if (bitti) return;
      if ((ed as { rol?: string } | null)?.rol === "teknisyen") {
        setHal({ tur: "hazir", uid: k.id, eposta: k.email ?? "", suruyor: false, teknisyen: true, deneme: false });
        return;
      }
      let suruyor = false;
      if (ODEME_ACIK) {
        const { data: s } = await sb.from("abonelikler").select("bitis, stripe_abonelik, durum").eq("user_id", k.id).maybeSingle();
        suruyor = !!(s?.stripe_abonelik && ["active", "trialing", "past_due"].includes(s.durum ?? "") && new Date(s.bitis).getTime() > Date.now());
      }
      // Still inside the free trial (account younger than DENEME_GUN days): offer to try first.
      const deneme = !!k.created_at && new Date(k.created_at).getTime() + DENEME_GUN * 86_400_000 > Date.now();
      if (!bitti) setHal({ tur: "hazir", uid: k.id, eposta: k.email ?? "", suruyor, teknisyen: false, deneme });
    })();
    return () => {
      bitti = true;
    };
  }, []);

  const yonet = async () => {
    setHata("");
    setGidiyor(true);
    const kod = await aboneligiYonet(dil);
    if (kod) {
      setHata(odemeHataMetni(kod, dil));
      setGidiyor(false);
    }
  };

  // "Check my licence": reads the licence row again (the owner writes it after the WhatsApp payment).
  const lisansKontrol = async () => {
    const sb = supabase();
    if (!sb || hal.tur !== "hazir") return;
    setKontrol({ tur: "bakiyor" });
    const { data, error } = await sb.from("abonelikler").select("bitis, donem").eq("user_id", hal.uid).retry(false).maybeSingle();
    if (error) {
      setKontrol({ tur: "hata" });
      return;
    }
    const s = data as { bitis?: string; donem?: string | null } | null;
    const bitis = s?.bitis ? new Date(s.bitis) : null;
    setKontrol(bitis && bitis.getTime() > Date.now() ? { tur: "aktif", yazi: lisansYazisi(s?.donem, bitis, dil) } : { tur: "yok" });
  };

  const kodHazir = kodGovdesi(kod).length === 16 && [...kodGovdesi(kod)].every((h) => KOD_ALFABE.includes(h));
  const kodYaz = (v: string) => {
    setKod(v);
    if (kodDurum.tur === "hata") setKodDurum({ tur: "" });
  };
  // Pasting bypasses maxLength (a code copied from WhatsApp may carry spaces or words around it): a whole code
  // replaces the field, anything else is inserted at the caret.
  const kodYapistir = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const metin = e.clipboardData.getData("text");
    if (!metin) return;
    e.preventDefault();
    const bulunan = koduBul(metin);
    if (bulunan) return kodYaz(bulunan);
    const tam = kodBicimle(metin, "");
    if (kodGovdesi(tam).length === 16) return kodYaz(tam);
    const el = e.currentTarget;
    const yeni = kod.slice(0, el.selectionStart ?? kod.length) + metin + kod.slice(el.selectionEnd ?? kod.length);
    kodYaz(kodBicimle(yeni, kod));
  };
  const panodan = async () => {
    try {
      const metin = await navigator.clipboard.readText();
      if (metin) kodYaz(koduBul(metin) ?? kodBicimle(metin, ""));
    } catch {
      setYapistirVar(false);
    }
  };
  // "Activate licence": redeems the code (rpc lisans_kodu_kullan, supabase/kurulum.sql section 6).
  const kodAc = async (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    const sb = supabase();
    if (!sb || hal.tur !== "hazir" || !kodHazir || kodDurum.tur === "aciliyor") return;
    setKodDurum({ tur: "aciliyor" });
    const { data, error } = await sb.rpc("lisans_kodu_kullan", { p_kod: kod }).retry(false);
    const r = data as { ok?: boolean; hata?: string; donem?: string; bitis?: string } | null;
    if (!error && r?.ok && r.bitis) {
      const donem = r.donem ?? "";
      // The cache HesapKapisi reads (fixnote_abonelik): /app shows the new licence at once.
      try {
        localStorage.setItem("fixnote_abonelik", JSON.stringify({ id: hal.uid, bitis: r.bitis, donem: donem || null }));
      } catch {}
      setKod("");
      setKodDurum({ tur: "acildi", donem, bitis: r.bitis });
      return;
    }
    const h = !error && r?.hata && KOD_HATALARI.includes(r.hata) ? (r.hata as KodHata) : "baglanti";
    setKodDurum({ tur: "hata", hata: h });
  };
  const yardimHref = () => {
    const eposta = hal.tur === "hazir" ? hal.eposta : "";
    const metin = dil === "en"
      ? `Hello, I need help with my Fixnote licence code. My account: ${eposta}`
      : `Merhaba, Fixnote lisans kodumla ilgili yardım istiyorum. Hesabım: ${eposta}`;
    return `https://wa.me/${LISANS_WHATSAPP}?text=${encodeURIComponent(metin)}`;
  };
  const waLink = (metin: string) => (
    <a data-kod-whatsapp href={yardimHref()} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{metin}</a>
  );
  const odemeWa = (metin: string) => {
    const eposta = hal.tur === "hazir" ? hal.eposta : "";
    const m = dil === "en" ? `Hello, I need help with my Fixnote card payment. My account: ${eposta}` : `Merhaba, Fixnote kartla ödememle ilgili yardım istiyorum. Hesabım: ${eposta}`;
    return <a data-odeme-whatsapp href={`https://wa.me/${LISANS_WHATSAPP}?text=${encodeURIComponent(m)}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{metin}</a>;
  };
  const kodHataMetni = (h: KodHata): React.ReactNode => {
    const en = dil === "en";
    switch (h) {
      case "gecersiz": return c("Bu kod geçerli değil. Harfleri kontrol edip tekrar dene.", "This code isn't valid. Check the characters and try again.");
      case "kullanildi": return en ? <>This code has already been used. If something&apos;s wrong, {waLink("message us on WhatsApp")}.</> : <>Bu kod daha önce kullanılmış. Bir sorun varsa {waLink("bize WhatsApp'tan yaz")}.</>;
      case "suresi_doldu": return en ? <>This code has expired. {waLink("Message us on WhatsApp")} and we&apos;ll send a new one.</> : <>Bu kodun süresi dolmuş. {waLink("Bize WhatsApp'tan yaz")}, yenisini gönderelim.</>;
      case "cok_deneme": return en ? <>Too many attempts. Try again in an hour or {waLink("message us on WhatsApp")}.</> : <>Çok fazla deneme yapıldı. Bir saat sonra tekrar dene ya da {waLink("bize WhatsApp'tan yaz")}.</>;
      case "zaten_suresiz": return c("Süresiz lisansın zaten var; bu kodu kullanmana gerek yok.", "You already have a lifetime licence; you don't need this code.");
      case "teknisyen": return c("Lisansı firma sahibi açar.", "The licence is activated by the company owner.");
      default: return c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.");
    }
  };

  const ad = (t: LisansTuru) => ({ aylik: c("Aylık lisans", "Monthly licence"), yillik: c("Yıllık lisans", "Yearly licence"), suresiz: c("Süresiz lisans", "Lifetime licence") })[t];
  const mesajAd = (t: LisansTuru) => ({ aylik: c("Aylık", "monthly"), yillik: c("Yıllık", "yearly"), suresiz: c("Süresiz", "lifetime") })[t];
  const birim = (t: LisansTuru) => ({ aylik: c("/ ay", "/ month"), yillik: c("/ yıl", "/ year"), suresiz: c("tek seferlik", "one-off") })[t];
  const waHref = (t: LisansTuru) => {
    const eposta = hal.tur === "hazir" ? hal.eposta : "";
    const metin = dil === "en"
      ? `Hello, I'd like to buy the Fixnote ${mesajAd(t)} licence (${tlSayi(LISANS[t], "en")} TRY, VAT included). My account: ${eposta}`
      : `Merhaba, Fixnote ${mesajAd(t)} lisans almak istiyorum (${tlSayi(LISANS[t])} TL, KDV dahil). Hesabım: ${eposta}`;
    return `https://wa.me/${LISANS_WHATSAPP}?text=${encodeURIComponent(metin)}`;
  };
  const altYazi = (t: LisansTuru) =>
    t === "aylik" ? c("1 ay kullanım", "1 month of use")
    : t === "yillik" ? c(`aylık ${tl(LISANS.yillik / 12, dil)} karşılığı`, `${tl(LISANS.yillik / 12, dil)} a month`)
    : c(`İlk yıl güncelleme ve destek dahil, sonrası isteğe bağlı ${tl(GUNCELLEME_YILLIK, dil)}/yıl`, `First year of updates and support included, then optional ${tl(GUNCELLEME_YILLIK, dil)} a year`);

  const kart = { width: "100%", borderRadius: 20, padding: "clamp(22px, 5vw, 30px)", boxShadow: "var(--shadow-md)" } as const;
  const durum = hal.tur === "hazir" ? (hal.teknisyen ? "teknisyen" : hal.suruyor ? "suruyor" : "secim") : "yukleniyor";

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 40px", position: "relative" }}>
      <DilDugmesi style={{ position: "absolute", top: 14, right: 14 }} />
      <Link href="/app" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>

      {hal.tur === "yukleniyor" ? (
        <div data-abonelik={durum} className="card" style={{ ...kart, maxWidth: 520, marginTop: 22 }}><div style={{ minHeight: 260 }} /></div>
      ) : hal.teknisyen ? (
        <div data-abonelik={durum} className="card" style={{ ...kart, maxWidth: 520, marginTop: 22, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>{c("Lisans firma sahibinde", "The licence is the owner's")}</h1>
          <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 20px" }}>{c("Bir firmanın ekibindesin; lisansı firma sahibi alır. Senin ödeme yapmana gerek yok.", "You're in a company's team; the owner buys the licence. You don't need to pay.")}</p>
          <Link href="/app" className="btn" style={{ width: "100%" }}>{c("Uygulamaya dön", "Back to the app")}</Link>
        </div>
      ) : hal.suruyor ? (
        <div data-abonelik={durum} className="card" style={{ ...kart, maxWidth: 520, marginTop: 22, textAlign: "center" }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-grid", placeItems: "center" }}><Ikon ad="tik" boy={22} /></span>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0" }}>{c("Aboneliğin zaten aktif", "Your subscription is already active")}</h1>
          <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 20px" }}>{c("Paketini değiştirmek, kartını güncellemek ya da faturalarını görmek için aboneliğini yönet.", "Manage your subscription to change plan, update your card or see your invoices.")}</p>
          {hata && <div role="alert" data-odeme-hata style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", color: "var(--bad)", fontSize: 13.5, fontWeight: 700 }}>{hata}</div>}
          <div style={{ display: "grid", gap: 8 }}>
            <button className="btn" onClick={yonet} disabled={gidiyor}>{gidiyor ? c("Açılıyor…", "Opening…") : c("Aboneliği yönet", "Manage subscription")}</button>
            <Link href="/app" className="btn btn-ghost">{c("Uygulamaya dön", "Back to the app")}</Link>
          </div>
        </div>
      ) : (
        <div data-abonelik={durum} style={{ width: "100%", maxWidth: 960, marginTop: 22 }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>{c("Lisans al", "Get a licence")}</h1>
            <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.55, margin: "6px auto 0", maxWidth: 520 }}>{c("Kayıtların hesabında aynen kalır. Lisans açılınca kaldığın yerden devam edersin.", "Your records stay in your account. Once the licence is active you carry on where you left off.")}</p>
          </div>

          {iptal && (
            <div data-odeme-iptal style={{ margin: "16px auto 0", maxWidth: 520, padding: "10px 12px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5, fontWeight: 700 }}>
              {c("Ödeme tamamlanmadı, kartından para çekilmedi. İstersen tekrar deneyebilirsin.", "The payment wasn't completed and your card wasn't charged. You can try again.")}
            </div>
          )}

          {/* Card payment result (iyzico, task 81) */}
          {odeme.tur === "kontrol" && (
            <div role="status" data-odeme-sonuc="kontrol" style={{ margin: "16px auto 0", maxWidth: 520, padding: "12px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
              {c("Ödeme kontrol ediliyor…", "Checking your payment…")}
            </div>
          )}
          {odeme.tur === "odendi" && (
            odeme.hata === "zaten_suresiz" ? (
              <div role="status" data-odeme-sonuc="zaten_suresiz" style={{ margin: "16px auto 0", maxWidth: 520, padding: "12px 14px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>
                {dil === "en" ? <>You already had a lifetime licence; your payment will be refunded. You can {odemeWa("message us on WhatsApp")}.</> : <>Süresiz lisansın zaten vardı; ödemen iade edilecek. {odemeWa("Bize WhatsApp'tan yazabilirsin")}.</>}
              </div>
            ) : (
              <div role="status" data-odeme-sonuc="odendi" className="card" style={{ ...kart, maxWidth: 520, margin: "16px auto 0", textAlign: "center", padding: "20px" }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-grid", placeItems: "center" }}><Ikon ad="tik" boy={20} /></span>
                <p style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-0.01em", margin: "12px 0 0", lineHeight: 1.45 }}>
                  {c("Ödemen alındı. ", "Payment received. ")}{odeme.bitis ? c(`${lisansYazisi(odeme.donem, new Date(odeme.bitis), dil)} açıldı.`, `${lisansYazisi(odeme.donem, new Date(odeme.bitis), dil)} is active.`) : c("Lisansın açıldı.", "Your licence is active.")}
                </p>
                <Link href="/app" className="btn" style={{ width: "100%", marginTop: 14 }}>{c("Uygulamaya dön", "Back to the app")}</Link>
              </div>
            )
          )}
          {odeme.tur === "basarisiz" && (
            <div role="alert" data-odeme-sonuc="basarisiz" style={{ margin: "16px auto 0", maxWidth: 520, padding: "10px 12px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5, fontWeight: 700 }}>
              {c("Ödeme tamamlanmadı, kartından para çekilmedi. İstersen tekrar deneyebilirsin.", "The payment wasn't completed and your card wasn't charged. You can try again.")}
            </div>
          )}
          {(odeme.tur === "bekliyor" || odeme.tur === "hata") && (
            <div role="status" data-odeme-sonuc={odeme.tur} style={{ margin: "16px auto 0", maxWidth: 520, padding: "12px 14px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>
              {odeme.tur === "hata"
                ? c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.")
                : dil === "en"
                  ? <>Your payment hasn&apos;t reached us yet. Press &quot;Check my payment&quot; in a few minutes or {odemeWa("message us on WhatsApp")}.</>
                  : <>Ödemen henüz bize ulaşmadı. Birkaç dakika sonra &apos;Ödememi kontrol et&apos;e bas ya da {odemeWa("bize WhatsApp'tan yaz")}.</>}
              <button type="button" data-odeme-kontrol className="btn btn-ghost" onClick={() => void odemeKontrol(odeme.id, 1)} style={{ width: "100%", marginTop: 10 }}>{c("Ödememi kontrol et", "Check my payment")}</button>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3" style={{ marginTop: 22, alignItems: "stretch" }}>
            {LISANS_TURLERI.map((t) => {
              const one = t === "yillik";
              return (
                <div key={t} data-lisans-kart={t} className="card" style={{ position: "relative", display: "flex", flexDirection: "column", borderRadius: 18, padding: one ? "21px 19px" : "22px 20px", border: `${one ? 2 : 1}px solid ${one ? "var(--accent)" : "var(--line)"}`, boxShadow: one ? "var(--shadow-md)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 26 }}>
                    <b style={{ fontSize: 16, letterSpacing: "-0.02em" }}>{ad(t)}</b>
                    {one && <span className="pill ok">{c("%20 avantajlı", "20% saving")}</span>}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <b className="num" data-tutar={LISANS[t]} style={{ fontSize: 30, letterSpacing: "-0.04em", lineHeight: 1.1 }}>{tl(LISANS[t], dil)}</b>
                    <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{birim(t)}</span>
                  </div>
                  <div className="num" style={{ fontSize: 13, color: t === "suresiz" ? "var(--muted)" : "var(--faint)", fontWeight: 600, marginTop: 6, lineHeight: 1.5 }}>{altYazi(t)}</div>
                  <div aria-hidden style={{ flex: 1, minHeight: 18 }} />
                  {IYZICO_ACIK ? (
                    <>
                      <button type="button" data-kart-ode={t} className={one ? "btn" : "btn btn-ghost"} onClick={() => setSecili(t)} aria-expanded={secili === t} aria-controls="kart-odeme" style={{ width: "100%", paddingTop: 13, paddingBottom: 13 }}>
                        <Ikon ad="kart" boy={16} />{c("Kartla öde", "Pay by card")}
                      </button>
                      <a data-lisans-al={t} href={waHref(t)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, alignSelf: "center", marginTop: 6, padding: "6px 4px", fontSize: 13, fontWeight: 700, color: "var(--muted)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                        <Ikon ad="mesaj" boy={13} />{c("WhatsApp'tan sor", "Ask on WhatsApp")}
                      </a>
                    </>
                  ) : (
                    <a data-lisans-al={t} className={one ? "btn" : "btn btn-ghost"} href={waHref(t)} target="_blank" rel="noopener noreferrer" style={{ width: "100%", paddingTop: 13, paddingBottom: 13 }}>
                      <Ikon ad="mesaj" boy={15} />{c("Bu lisansı al", "Get this licence")}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, textAlign: "center", margin: "12px 0 0" }}>{c("Fiyatlara KDV dahildir. Lisans tek cihazda kullanılır.", "Prices include VAT. A licence is used on one device.")}</p>

          {IYZICO_ACIK && secili && hal.tur === "hazir" && (
            <KartOdeme
              key={secili}
              donem={secili}
              dil={dil === "en" ? "en" : "tr"}
              uid={hal.uid}
              eposta={hal.eposta}
              onBilgiHref={SOZLESMELER[dil === "en" ? "en" : "tr"][2][0]}
              mesafeliHref={SOZLESMELER[dil === "en" ? "en" : "tr"][1][0]}
              onKapat={() => {
                const t = secili;
                setSecili(null);
                requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-kart-ode="${t}"]`)?.focus());
              }}
            />
          )}

          {/* Licence code card (task 80): only while card payment is off (user decision, 21 Nov); the code system stays in the
             database and the owner commands as a fallback (bank transfer, buying for someone else, Android later). */}
          {!IYZICO_ACIK && (
          <form data-lisans-kodu-kart className="card" onSubmit={kodAc} noValidate style={{ ...kart, maxWidth: 520, margin: "20px auto 0", padding: "18px 20px", textAlign: "center", boxShadow: "none" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{c("Lisans kodun var mı?", "Have a licence code?")}</h2>
            <p style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.55, margin: "6px 0 0" }}>{c("Ödemeden sonra lisans kodun WhatsApp'tan gelir. Kodu buraya yaz ya da yapıştır; lisansın hemen açılır.", "After payment your licence code arrives on WhatsApp. Type or paste it here and your licence opens at once.")}</p>
            <label htmlFor="lisans-kodu" className="sr-only">{c("Lisans kodu", "Licence code")}</label>
            {/* Phones: "Paste" wraps under the field so the whole code (23 characters) stays visible; the field grows 1000x faster, so beside it the button keeps its own width and alone on its line it fills the row. */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              <input
                id="lisans-kodu"
                className="field num"
                type="text"
                value={kod}
                onChange={(e) => kodYaz(kodBicimle(e.target.value, kod))}
                onPaste={kodYapistir}
                placeholder="FIX-XXXX-XXXX-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                maxLength={23}
                aria-invalid={kodDurum.tur === "hata" && kodDurum.hata === "gecersiz" ? true : undefined}
                style={{ flex: "1000 1 250px", minWidth: 0, paddingLeft: 8, paddingRight: 8, textAlign: "center", fontWeight: 600, letterSpacing: 0 }}
              />
              {yapistirVar && (
                <button type="button" data-kod-yapistir className="btn btn-ghost" onClick={panodan} style={{ flex: "1 0 auto", paddingLeft: 14, paddingRight: 14 }}>{c("Yapıştır", "Paste")}</button>
              )}
            </div>
            <button type="submit" data-kod-ac className="btn" disabled={!kodHazir || kodDurum.tur === "aciliyor"} style={{ width: "100%", marginTop: 10 }}>
              {kodDurum.tur === "aciliyor" ? c("Açılıyor…", "Activating…") : c("Lisansı aç", "Activate licence")}
            </button>
            {kodDurum.tur === "acildi" && (
              <div role="status" data-kod-sonuc="ok" style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ok)" }}>
                  {c("Lisansın açıldı: ", "Your licence is active: ")}{lisansYazisi(kodDurum.donem, new Date(kodDurum.bitis), dil)}
                </div>
                <Link href="/app" className="btn" style={{ width: "100%", marginTop: 10 }}>{c("Uygulamaya dön", "Back to the app")}</Link>
              </div>
            )}
            {kodDurum.tur === "hata" && (
              <div role="alert" data-kod-sonuc={kodDurum.hata} style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", color: "var(--bad)", fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>
                {kodHataMetni(kodDurum.hata)}
              </div>
            )}
          </form>
          )}
          <div style={{ maxWidth: 520, margin: "10px auto 0", textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
            {c("Lisansın elle açıldıysa:", "Licence activated by hand?")}{" "}
            <button type="button" data-lisans-kontrol onClick={lisansKontrol} disabled={kontrol.tur === "bakiyor"} style={{ background: "none", border: 0, padding: "6px 0", font: "inherit", fontWeight: 700, color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, cursor: kontrol.tur === "bakiyor" ? "default" : "pointer" }}>
              {kontrol.tur === "bakiyor" ? c("Kontrol ediliyor…", "Checking…") : c("Lisansımı kontrol et", "Check my licence")}
            </button>
            {kontrol.tur === "aktif" && (
              <div role="status" data-lisans-sonuc="aktif" style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "var(--ok)" }}>
                {kontrol.yazi} · <Link href="/app" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{c("Uygulamaya dön", "Back to the app")}</Link>
              </div>
            )}
            {kontrol.tur === "yok" && <div role="status" data-lisans-sonuc="yok" style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "var(--warn)" }}>{c("Henüz açılmadı", "Not active yet")}</div>}
            {kontrol.tur === "hata" && <div role="alert" data-lisans-sonuc="hata" style={{ marginTop: 4, fontSize: 13.5, fontWeight: 700, color: "var(--bad)" }}>{c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.")}</div>}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px", marginTop: 16, fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>
            {SOZLESMELER[dil === "en" ? "en" : "tr"].map(([href, metin]) => (
              <a key={href} data-sozlesme href={href} target="_blank" rel="noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3, padding: "6px 0" }}>{metin}</a>
            ))}
          </div>
          <div style={{ maxWidth: 520, margin: "14px auto 0" }}><OdemeLogolari yazi /></div>
          {hal.deneme && (
            <div style={{ maxWidth: 520, margin: "16px auto 0" }}>
              <Link href="/app" data-once-dene className="btn btn-ghost" style={{ width: "100%" }}>{c(`Önce ${DENEME_GUN} gün ücretsiz dene`, `Try free for ${DENEME_GUN} days first`)}</Link>
            </div>
          )}
        </div>
      )}
      {hal.tur === "hazir" && (
        <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, marginTop: 14, textAlign: "center" }}>
          {c("Giriş yapılan hesap:", "Signed in as:")} {hal.eposta} · <Link href="/app" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{c("Uygulamaya dön", "Back to the app")}</Link>
        </div>
      )}
    </main>
  );
}
