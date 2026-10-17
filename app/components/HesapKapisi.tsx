"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "./Ikon";
import { DilDugmesi } from "./Dil";
import { useDil, type Dil } from "../lib/dil";
import { ABONELIK_EPOSTA, DENEME_GUN, durumHesapla, supabase, type Durum } from "./supabase";

// Guards /app: no session -> /giris, trial over -> lock screen. Records stay in the account (app/components/depo.ts).
const ONBELLEK = "fixnote_abonelik"; // last known subscription end, so a paid user is not locked out offline
const mailto = (dil: Dil) => `mailto:${ABONELIK_EPOSTA}?subject=${encodeURIComponent(dil === "en" ? "Fixnote subscription" : "Fixnote abonelik")}`;
// Turkish 03.10.2026, English 3 Oct 2026
const tarih = (d: Date, dil: Dil) =>
  dil === "en" ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

function onbellekOku(id: string): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(ONBELLEK) || "null");
    return v && v.id === id ? v.bitis : null;
  } catch {
    return null;
  }
}
function onbellekYaz(id: string, bitis: string | null) {
  try {
    localStorage.setItem(ONBELLEK, JSON.stringify({ id, bitis }));
  } catch {}
}

// Set while this tab signs out, so the auth listener below does not navigate a second time.
let cikiyor = false;
async function cikis() {
  cikiyor = true;
  await supabase()?.auth.signOut();
  window.location.replace("/giris");
}

function Ekran({ ikon, baslik, metin, alt, children }: { ikon: string; baslik: string; metin: React.ReactNode; alt?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", position: "relative" }}>
      <DilDugmesi style={{ position: "absolute", top: 14, right: 14 }} />
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>
      <div className="card" style={{ width: "100%", maxWidth: 440, marginTop: 22, borderRadius: 20, padding: "28px 26px", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-grid", placeItems: "center" }}><Ikon ad={ikon} boy={22} /></span>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0" }}>{baslik}</h1>
        <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 0" }}>{metin}</p>
        {children && <div style={{ display: "grid", gap: 8, marginTop: 20 }}>{children}</div>}
      </div>
      {alt && <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, marginTop: 14 }}>{alt}</div>}
    </main>
  );
}

export default function HesapKapisi({ children }: { children: React.ReactNode }) {
  const [durum, setDurum] = useState<Durum>({ tur: "yukleniyor" });
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const MAILTO = mailto(dil);

  useEffect(() => {
    const sb = supabase();
    if (!sb) {
      setDurum({ tur: "ayarsiz" });
      return;
    }
    let bitti = false;
    (async () => {
      const { data } = await sb.auth.getSession();
      if (bitti) return;
      const oturum = data.session;
      if (!oturum) {
        if (!navigator.onLine) {
          setDurum({ tur: "baglanti" });
          return;
        }
        window.location.replace(`/giris?sonra=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const k = oturum.user;
      let abonelik = onbellekOku(k.id);
      // Without internet the last known subscription is used at once (no retries, no waiting).
      if (navigator.onLine) {
        const { data: satir, error } = await sb.from("abonelikler").select("bitis").eq("user_id", k.id).retry(false).maybeSingle();
        if (bitti) return;
        if (!error) {
          abonelik = (satir?.bitis as string | undefined) ?? null;
          onbellekYaz(k.id, abonelik);
        }
      }
      setDurum(durumHesapla(k.email ?? "", k.created_at, abonelik));
    })();
    const { data: dinleyici } = sb.auth.onAuthStateChange((olay) => {
      if (olay === "SIGNED_OUT" && !cikiyor) window.location.replace("/giris"); // signed out in another tab
    });
    return () => {
      bitti = true;
      dinleyici.subscription.unsubscribe();
    };
  }, []);

  if (durum.tur === "yukleniyor") return <main style={{ minHeight: "100vh", background: "var(--bg)" }} />;

  if (durum.tur === "ayarsiz")
    return (
      <Ekran ikon="ayar" baslik={c("Giriş henüz yapılandırılmadı", "Sign-in isn't configured yet")} metin={c("Supabase adresi ve anahtarı eklenince uygulama giriş ekranıyla açılır.", "Once the Supabase address and key are added, the app opens with the sign-in screen.")}>
        <Link href="/" className="btn btn-ghost">{c("Ana sayfaya dön", "Back to home")}</Link>
      </Ekran>
    );

  if (durum.tur === "baglanti")
    return (
      <Ekran ikon="telefon" baslik={c("İnternet bağlantısı yok", "No internet connection")} metin={c("Giriş yapmak için bir kez internete bağlanman gerekiyor. Bağlanınca tekrar dene.", "You need to be online once to sign in. Try again when you're connected.")}>
        <button className="btn" onClick={() => window.location.reload()}>{c("Tekrar dene", "Try again")}</button>
      </Ekran>
    );

  if (durum.tur === "bitti")
    return (
      <Ekran
        ikon="saat"
        baslik={durum.abonelik ? c("Aboneliğin sona erdi", "Your subscription has ended") : c("Deneme süren doldu", "Your trial has ended")}
        metin={dil === "en"
          ? <>{durum.abonelik ? `Your subscription ended on ${tarih(durum.bitis, dil)}.` : `Your free ${DENEME_GUN}-day trial ended on ${tarih(durum.bitis, dil)}.`} Your records are kept in your account; once your subscription is active you carry on where you left off.</>
          : <>{durum.abonelik ? `Aboneliğin ${tarih(durum.bitis, dil)} tarihinde sona erdi.` : `${DENEME_GUN} günlük ücretsiz deneme ${tarih(durum.bitis, dil)} tarihinde bitti.`} Kayıtların hesabında saklanıyor; aboneliğin açılınca kaldığın yerden devam edersin.</>}
        alt={<>{c("Giriş yapılan hesap:", "Signed in as:")} {durum.eposta}</>}
      >
        <a className="btn" href={MAILTO}>{c("Abonelik için yaz", "Email us to subscribe")}</a>
        <button className="btn btn-ghost" onClick={cikis}>{c("Çıkış yap", "Sign out")}</button>
      </Ekran>
    );

  return (
    <>
      <div className="no-print" data-hesap={durum.tur} style={{ background: "var(--ink)", color: "rgba(255,255,255,.72)", fontSize: 12.5, fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            {/* very narrow phones (under 380 px) get a shorter text and no clock icon so the bar stays on one line */}
            <Ikon ad="saat" boy={14} className="hidden min-[380px]:block" style={{ color: "#7cc4d6", flex: "none" }} />
            {durum.tur === "deneme" ? (
              <span><span className="hidden min-[380px]:inline">{c("Ücretsiz deneme: ", "Free trial: ")}</span><span className="min-[380px]:hidden">{c("Deneme: ", "Trial: ")}</span><b style={{ color: "#fff", whiteSpace: "nowrap" }}>{dil === "en" ? `${durum.kalanGun} ${durum.kalanGun === 1 ? "day" : "days"} left` : `${durum.kalanGun} gün kaldı`}</b></span>
            ) : (
              <span><span className="hidden min-[380px]:inline">{dil === "en" ? `Subscription active · until ${tarih(durum.bitis, dil)}` : `Aboneliğin aktif · ${tarih(durum.bitis, dil)} tarihine kadar`}</span><span className="min-[380px]:hidden">{dil === "en" ? `Active · ends ${tarih(durum.bitis, dil)}` : `Abonelik aktif · bitiş ${tarih(durum.bitis, dil)}`}</span></span>
            )}
          </span>
          {durum.tur === "deneme" && <a href={MAILTO} className="hover:text-white" style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 3, whiteSpace: "nowrap", flex: "none", display: "inline-block", padding: "11px 4px", margin: "-11px -4px" }}>{c("Aboneliğe geç", "Subscribe")}</a>}
          <span className="hidden sm:inline" style={{ marginLeft: "auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{durum.eposta}</span>
          <button onClick={cikis} className="ml-auto sm:-ml-2 hover:text-white" style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", flex: "none", padding: "11px 8px", marginTop: -11, marginBottom: -11, marginRight: -8 }}>{c("Çıkış", "Sign out")}</button>
        </div>
      </div>
      {children}
    </>
  );
}
