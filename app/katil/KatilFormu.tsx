"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DilDugmesi } from "../components/Dil";
import { useDil } from "../lib/dil";
import { supabase } from "../components/supabase";
import { BEKLEYEN_DAVET, ekipHataMetni, ekipOnbellekYaz, teknisyenAnahtar } from "../components/ekip";

// /katil?kod=...: a technician opens the owner's invite link, signs in (or signs up) with their own
// account and joins the firm's team. Without a session the code waits in this browser (BEKLEYEN_DAVET)
// so the join continues after sign-in, even if Google returns to another page.
type Hal =
  | { tur: "yukleniyor" }
  | { tur: "kodsuz" }
  | { tur: "hata"; metin: string }
  | { tur: "kendi" }
  | { tur: "uye"; firma: string }
  | { tur: "davet"; firma: string; eposta: string; uid: string };

export default function KatilFormu() {
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [hal, setHal] = useState<Hal>({ tur: "yukleniyor" });
  const [kod, setKod] = useState("");
  const [ad, setAd] = useState("");
  const [isliyor, setIsliyor] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("kod") || "";
    setKod(k);
    if (!/^[0-9a-f]{32,80}$/i.test(k)) {
      setHal({ tur: "kodsuz" });
      return;
    }
    const sb = supabase();
    if (!sb) {
      setHal({ tur: "hata", metin: c("Giriş henüz yapılandırılmadı.", "Sign-in isn't configured yet.") });
      return;
    }
    let bitti = false;
    (async () => {
      const { data } = await sb.auth.getSession();
      if (bitti) return;
      const kim = data.session?.user;
      if (!kim) {
        try { localStorage.setItem(BEKLEYEN_DAVET, k); } catch {}
        window.location.replace(`/giris?kayit=1&sonra=${encodeURIComponent(`/katil?kod=${k}`)}`);
        return;
      }
      try { localStorage.removeItem(BEKLEYEN_DAVET); } catch {}
      const { data: b, error } = await sb.rpc("davet_bilgisi", { p_kod: k });
      if (bitti) return;
      if (error) {
        setHal({ tur: "hata", metin: ekipHataMetni(error, dil) });
        return;
      }
      const v = (b || {}) as { durum?: string; firma_ad?: string; kendi?: boolean; uye?: boolean };
      const firma = v.firma_ad || "";
      if (v.uye) setHal({ tur: "uye", firma });
      else if (v.kendi) setHal({ tur: "kendi" });
      else if (v.durum !== "gecerli") setHal({ tur: "hata", metin: ekipHataMetni(v.durum || "gecersiz", dil) });
      else {
        const meta = (kim.user_metadata || {}) as { full_name?: string; name?: string };
        setAd((meta.full_name || meta.name || "").slice(0, 80));
        setHal({ tur: "davet", firma, eposta: kim.email || "", uid: kim.id });
      }
    })();
    return () => {
      bitti = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const katil = async () => {
    if (hal.tur !== "davet" || isliyor) return;
    const sb = supabase();
    if (!sb) return;
    setIsliyor(true);
    setHata("");
    const { error } = await sb.rpc("ekibe_katil", { p_kod: kod, p_ad: ad.trim() });
    if (error) {
      setHata(ekipHataMetni(error, dil));
      setIsliyor(false);
      return;
    }
    try { if (ad.trim()) localStorage.setItem(teknisyenAnahtar(hal.uid), ad.trim()); } catch {}
    ekipOnbellekYaz(hal.uid, null); // the app reads the new team state
    window.location.replace("/app");
  };

  const baskaHesap = async () => {
    await supabase()?.auth.signOut();
    try { localStorage.setItem(BEKLEYEN_DAVET, kod); } catch {}
    window.location.replace(`/giris?kayit=1&sonra=${encodeURIComponent(`/katil?kod=${kod}`)}`);
  };

  const kart = (ikon: string, baslik: string, metin: React.ReactNode, govde?: React.ReactNode) => (
    <div className="card" data-katil={hal.tur} style={{ width: "100%", maxWidth: 440, marginTop: 22, borderRadius: 20, padding: "28px 26px", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
      <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-grid", placeItems: "center" }}><Ikon ad={ikon} boy={22} /></span>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0" }}>{baslik}</h1>
      <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 0" }}>{metin}</p>
      {govde && <div style={{ display: "grid", gap: 8, marginTop: 20, textAlign: "left" }}>{govde}</div>}
    </div>
  );

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", position: "relative" }}>
      <DilDugmesi style={{ position: "absolute", top: 14, right: 14 }} />
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>
      {hal.tur === "yukleniyor" ? (
        <div style={{ minHeight: 280 }} />
      ) : hal.tur === "kodsuz" ? (
        kart("kisiler", c("Davet bağlantısı eksik", "The invite link is incomplete"), c("Bağlantının tamamını açtığından emin ol ya da firma sahibinden yeni bağlantı iste.", "Make sure you opened the whole link, or ask the owner for a new one."))
      ) : hal.tur === "hata" ? (
        kart("kisiler", c("Ekibe katılınamadı", "Couldn't join the team"), hal.metin, <Link href="/app" className="btn btn-ghost">{c("Uygulamaya git", "Go to the app")}</Link>)
      ) : hal.tur === "kendi" ? (
        kart("kisiler", c("Bu senin davet bağlantın", "This is your own invite link"), c("Bağlantıyı teknisyenine gönder; o kendi hesabıyla açıp ekibe katılsın.", "Send the link to your technician so they open it with their own account and join."), <Link href="/app" className="btn">{c("Uygulamaya dön", "Back to the app")}</Link>)
      ) : hal.tur === "uye" ? (
        kart("tik", c("Zaten ekiptesin", "You're already in the team"), hal.firma ? c(`${hal.firma} ekibindesin.`, `You're in the ${hal.firma} team.`) : c("Bu firmanın ekibindesin.", "You're in this company's team."), <Link href="/app" className="btn">{c("Uygulamaya git", "Go to the app")}</Link>)
      ) : (
        kart(
          "kisiler",
          hal.firma ? c(`${hal.firma} seni ekibine davet etti`, `${hal.firma} invited you to their team`) : c("Firma ekibine davet edildin", "You're invited to a company team"),
          c("Katılınca firmanın servis raporlarını ve müşteri geçmişini görür, yeni rapor yazarsın.", "Once you join you see the company's service reports and customer history, and write new reports."),
          <>
            <label className="lbl" htmlFor="k-ad">{c("Adın (raporlarda teknisyen olarak yazılır)", "Your name (shown as the technician on reports)")}</label>
            <input id="k-ad" className="field" value={ad} maxLength={80} autoComplete="name" onChange={(e) => setAd(e.target.value)} placeholder={c("Örn. Ali Yılmaz", "e.g. Sam Carter")} />
            {hata && <div role="alert" data-katil-hata style={{ color: "var(--bad)", fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>{hata}</div>}
            <button className="btn" data-ekibe-katil onClick={katil} disabled={isliyor} style={{ marginTop: 4 }}>{isliyor ? c("Katılıyor…", "Joining…") : c("Ekibe katıl", "Join the team")}</button>
            <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, textAlign: "center", marginTop: 4 }}>
              {c("Giriş yapılan hesap:", "Signed in as:")} {hal.eposta} · <button onClick={baskaHesap} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--muted)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>{c("Başka hesapla gir", "Use another account")}</button>
            </div>
          </>,
        )
      )}
    </main>
  );
}
