"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DilDugmesi } from "../components/Dil";
import { useDil } from "../lib/dil";
import { DENEME_GUN, supabase } from "../components/supabase";
import { aboneligiYonet, odemeHataMetni } from "../components/odeme";
import { OdemeLogolari } from "../components/YasalAlt";
import { GUNCELLEME_YILLIK, LISANS, LISANS_TURLERI, LISANS_WHATSAPP, ODEME_ACIK, lisansYazisi, tl, tlSayi, type LisansTuru } from "../lib/paket";

// /abonelik: the licence page (task 75). Three licence types (LISANS in app/lib/paket.ts), sold on WhatsApp: the
// button opens a chat with the licence, the amount and the account's email; the owner opens the licence by hand in
// public.abonelikler (SQL in CLAUDE.md) and the customer checks it here. Reached from the trial bar, the read-only
// bar and the side menu in /app (app/components/HesapKapisi.tsx, Uygulama.tsx). Old ?paket= / ?donem= links are ignored.
// The online payment (ODEME_ACIK, Stripe) is kept only for an existing subscription: "manage subscription".
type Hal = { tur: "yukleniyor" } | { tur: "hazir"; uid: string; eposta: string; suruyor: boolean; teknisyen: boolean; deneme: boolean };
type Kontrol = { tur: "" } | { tur: "bakiyor" } | { tur: "yok" } | { tur: "hata" } | { tur: "aktif"; yazi: string };

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
                  <a data-lisans-al={t} className={one ? "btn" : "btn btn-ghost"} href={waHref(t)} target="_blank" rel="noopener noreferrer" style={{ width: "100%", paddingTop: 13, paddingBottom: 13 }}>
                    <Ikon ad="mesaj" boy={15} />{c("Bu lisansı al", "Get this licence")}
                  </a>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, textAlign: "center", margin: "12px 0 0" }}>{c("Fiyatlara KDV dahildir. Lisans tek cihazda kullanılır.", "Prices include VAT. A licence is used on one device.")}</p>

          <div className="card" style={{ ...kart, maxWidth: 520, margin: "20px auto 0", padding: "18px 20px", textAlign: "center", boxShadow: "none" }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{c("Ödemeden sonra lisansın aynı gün açılır.", "Your licence is activated the same day after payment.")}</p>
            <button data-lisans-kontrol className="btn btn-ghost" onClick={lisansKontrol} disabled={kontrol.tur === "bakiyor"} style={{ width: "100%", marginTop: 12 }}>
              {kontrol.tur === "bakiyor" ? c("Kontrol ediliyor…", "Checking…") : c("Lisansımı kontrol et", "Check my licence")}
            </button>
            {kontrol.tur === "aktif" && (
              <div role="status" data-lisans-sonuc="aktif" style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: "var(--ok)" }}>
                {kontrol.yazi} · <Link href="/app" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{c("Uygulamaya dön", "Back to the app")}</Link>
              </div>
            )}
            {kontrol.tur === "yok" && <div role="status" data-lisans-sonuc="yok" style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: "var(--warn)" }}>{c("Henüz açılmadı", "Not active yet")}</div>}
            {kontrol.tur === "hata" && <div role="alert" data-lisans-sonuc="hata" style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: "var(--bad)" }}>{c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.")}</div>}
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
