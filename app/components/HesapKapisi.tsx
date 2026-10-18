"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "./Ikon";
import { DilDugmesi } from "./Dil";
import { useDil, type Dil } from "../lib/dil";
import { ABONELIK_EPOSTA, DENEME_GUN, durumHesapla, supabase, type Durum } from "./supabase";
import { ODEME_ACIK } from "../lib/paket";
import { aboneligiYonet, odemeHataMetni } from "./odeme";
import { BEKLEYEN_DAVET, EkipBaglam, ekipCevir, ekipOnbellekOku, ekipOnbellekYaz, tekBasina, type EkipBilgi } from "./ekip";

// Guards /app: no session -> /giris, trial over -> lock screen. Records stay in the account (app/components/depo.ts).
// With online payment on (ODEME_ACIK) "subscribe" leads to /abonelik; back from the payment page
// (/app?odeme=tamam) it waits until the Stripe webhook has written the new subscription.
// Team: a technician sees the owner's firm account (app/components/ekip.ts); the trial and subscription
// are the firm's, the technician only gets a lock screen to tell the owner.
const ONBELLEK = "fixnote_abonelik"; // last known subscription end, so a paid user is not locked out offline
const mailto = (dil: Dil) => `mailto:${ABONELIK_EPOSTA}?subject=${encodeURIComponent(dil === "en" ? "Fixnote subscription" : "Fixnote abonelik")}`;
// Turkish 03.10.2026, English 3 Oct 2026
const BEKLE_DENEME = 20; // back from payment: check the subscription every 2 s, up to 40 s
const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));
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
  const [stripeMusteri, setStripeMusteri] = useState(false); // has a Stripe customer: show "manage subscription"
  const [onay, setOnay] = useState<"" | "bekliyor" | "gecikti">(""); // back from the payment page, subscription not written yet
  const [yonetHata, setYonetHata] = useState("");
  const [ekip, setEkip] = useState<EkipBilgi | null>(null);
  const [cikarildi, setCikarildi] = useState<string | null>(null); // removed from a team: that firm's name
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
      // Which firm account: own, or the owner's for a technician. Offline: the last known one.
      const onceki = ekipOnbellekOku(k.id);
      let e = onceki ?? tekBasina(k.id, k.created_at);
      if (navigator.onLine) {
        const { data: ed, error: ee } = await sb.rpc("ekip_durumu").retry(false);
        if (bitti) return;
        if (!ee) {
          e = ekipCevir(ed, k.id, k.created_at);
          ekipOnbellekYaz(k.id, e);
          if (onceki?.rol === "teknisyen" && e.rol === "sahip") setCikarildi(onceki.firmaAd);
        } else if (ee.code === "PGRST202") e = tekBasina(k.id, k.created_at); // team functions not installed yet
      }
      // An invite opened before signing in (Google may return to another page): finish joining.
      try {
        const bekleyen = localStorage.getItem(BEKLEYEN_DAVET);
        if (bekleyen) {
          localStorage.removeItem(BEKLEYEN_DAVET);
          if (e.rol === "sahip" && /^[0-9a-f]{32,80}$/i.test(bekleyen)) {
            window.location.replace(`/katil?kod=${bekleyen}`);
            return;
          }
        }
      } catch {}
      setEkip({ ...e, uid: k.id });
      const olusturma = e.rol === "teknisyen" ? e.sahipOlusturma : k.created_at;
      let abonelik = onbellekOku(e.hesapId);
      // Without internet the last known subscription is used at once (no retries, no waiting).
      const oku = async () => {
        const { data: satir, error } = await sb.from("abonelikler").select(ODEME_ACIK ? "bitis, stripe_musteri" : "bitis").eq("user_id", e.hesapId).retry(false).maybeSingle();
        if (error) return false;
        const s = satir as { bitis?: string; stripe_musteri?: string | null } | null;
        abonelik = s?.bitis ?? null;
        onbellekYaz(e.hesapId, abonelik);
        setStripeMusteri(!!s?.stripe_musteri);
        return true;
      };
      if (navigator.onLine) await oku();
      if (bitti) return;
      let d = durumHesapla(k.email ?? "", olusturma, abonelik);
      setDurum(d);

      const q = new URLSearchParams(window.location.search);
      if (q.get("odeme") !== "tamam") return;
      const temizle = () => {
        q.delete("odeme");
        const kalan = q.toString();
        window.history.replaceState(null, "", window.location.pathname + (kalan ? `?${kalan}` : "") + window.location.hash);
      };
      if (!ODEME_ACIK || d.tur === "aktif") {
        temizle();
        return;
      }
      setOnay("bekliyor");
      for (let i = 0; i < BEKLE_DENEME && !bitti; i++) {
        await bekle(2000);
        if (bitti) return;
        if (!(await oku())) continue;
        d = durumHesapla(k.email ?? "", olusturma, abonelik);
        if (d.tur === "aktif") {
          setDurum(d);
          setOnay("");
          temizle();
          return;
        }
      }
      if (!bitti) setOnay("gecikti");
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

  if (cikarildi !== null)
    return (
      <Ekran ikon="kisiler" baslik={c("Ekipten çıkarıldın", "You were removed from the team")} metin={cikarildi ? c(`${cikarildi} ekibinden çıkarıldın. Firmanın kayıtları bu hesapta artık görünmez.`, `You were removed from the ${cikarildi} team. The company's records are no longer visible in this account.`) : c("Firma ekibinden çıkarıldın. Firmanın kayıtları bu hesapta artık görünmez.", "You were removed from the company team. The company's records are no longer visible in this account.")} alt={<>{c("Giriş yapılan hesap:", "Signed in as:")} {durum.eposta}</>}>
        <button className="btn" onClick={() => setCikarildi(null)}>{c("Kendi hesabımla devam et", "Continue with my own account")}</button>
        <button className="btn btn-ghost" onClick={cikis}>{c("Çıkış yap", "Sign out")}</button>
      </Ekran>
    );

  // A technician cannot subscribe: the firm's trial or subscription ended, or the firm has no team plan.
  const teknisyen = ekip?.rol === "teknisyen";
  const firmaAdi = ekip?.firmaAd || c("Firma", "Company");
  if (teknisyen && (durum.tur === "bitti" || ((durum.tur === "aktif" || durum.tur === "deneme") && !ekip?.ekipAcik)))
    return (
      <Ekran
        ikon="saat"
        baslik={durum.tur === "bitti" ? c("Firmanın aboneliği sona erdi", "The company's subscription has ended") : c("Ekip girişi kapalı", "Team access is off")}
        metin={durum.tur === "bitti"
          ? c(`${firmaAdi} hesabının deneme süresi ya da aboneliği bitti. Devam etmek için firma sahibine haber ver; kayıtlar hesapta saklanıyor.`, `The trial or subscription of the ${firmaAdi} account has ended. Let the owner know to carry on; the records are kept in the account.`)
          : c(`${firmaAdi} hesabı şu an teknisyen ekibi olmayan bir pakette. Firma sahibi Firma paketine geçince kaldığın yerden devam edersin.`, `The ${firmaAdi} account is on a plan without a technician team right now. Once the owner moves to the Team plan, you carry on where you left off.`)}
        alt={<>{c("Giriş yapılan hesap:", "Signed in as:")} {durum.eposta}</>}
      >
        <button className="btn btn-ghost" onClick={cikis}>{c("Çıkış yap", "Sign out")}</button>
      </Ekran>
    );

  // Back from the payment page with the app still locked: wait for the subscription here.
  if (onay && durum.tur === "bitti")
    return onay === "bekliyor" ? (
      <Ekran ikon="saat" baslik={c("Ödemen alındı", "Payment received")} metin={c("Aboneliğin açılıyor, birkaç saniye sürer…", "Your subscription is being activated, this takes a few seconds…")} />
    ) : (
      <Ekran ikon="saat" baslik={c("Ödemen alındı", "Payment received")} metin={c(`Aboneliğin henüz açılmadı. Birkaç dakika sonra sayfayı yenile; sorun sürerse ${ABONELIK_EPOSTA} adresine yaz.`, `Your subscription isn't active yet. Refresh the page in a few minutes; if it still isn't, write to ${ABONELIK_EPOSTA}.`)}>
        <button className="btn" onClick={() => window.location.reload()}>{c("Sayfayı yenile", "Refresh the page")}</button>
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
        {ODEME_ACIK ? (
          <Link className="btn" href="/abonelik">{durum.abonelik ? c("Aboneliği yenile", "Renew subscription") : c("Paket seç", "Choose a plan")}</Link>
        ) : (
          <a className="btn" href={MAILTO}>{c("Abonelik için yaz", "Email us to subscribe")}</a>
        )}
        <button className="btn btn-ghost" onClick={cikis}>{c("Çıkış yap", "Sign out")}</button>
      </Ekran>
    );

  return (
    <>
      <div className="no-print" data-hesap={durum.tur} data-rol={ekip?.rol ?? "sahip"} style={{ background: "var(--ink)", color: "rgba(255,255,255,.72)", fontSize: 12.5, fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            {/* very narrow phones (under 380 px) get a shorter text and no clock icon so the bar stays on one line */}
            <Ikon ad="saat" boy={14} className="hidden min-[380px]:block" style={{ color: "#7cc4d6", flex: "none" }} />
            {teknisyen ? (
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b data-ekip-serit style={{ color: "#fff" }}>{c(`${firmaAdi} ekibi`, `${firmaAdi} team`)}</b></span>
            ) : durum.tur === "deneme" ? (
              <span><span className="hidden min-[380px]:inline">{c("Ücretsiz deneme: ", "Free trial: ")}</span><span className="min-[380px]:hidden">{c("Deneme: ", "Trial: ")}</span><b style={{ color: "#fff", whiteSpace: "nowrap" }}>{dil === "en" ? `${durum.kalanGun} ${durum.kalanGun === 1 ? "day" : "days"} left` : `${durum.kalanGun} gün kaldı`}</b></span>
            ) : (
              <span><span className="hidden min-[380px]:inline">{dil === "en" ? `Subscription active · until ${tarih(durum.bitis, dil)}` : `Aboneliğin aktif · ${tarih(durum.bitis, dil)} tarihine kadar`}</span><span className="min-[380px]:hidden">{dil === "en" ? `Active · ends ${tarih(durum.bitis, dil)}` : `Abonelik aktif · bitiş ${tarih(durum.bitis, dil)}`}</span></span>
            )}
          </span>
          {!teknisyen && durum.tur === "deneme" && <a href={ODEME_ACIK ? "/abonelik" : MAILTO} className="hover:text-white" style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 3, whiteSpace: "nowrap", flex: "none", display: "inline-block", padding: "11px 4px", margin: "-11px -4px" }}>{c("Aboneliğe geç", "Subscribe")}</a>}
          {!teknisyen && durum.tur === "aktif" && ODEME_ACIK && stripeMusteri && (
            <button
              data-abonelik-yonet
              onClick={async () => {
                setYonetHata("");
                const kod = await aboneligiYonet(dil);
                if (kod) setYonetHata(odemeHataMetni(kod, dil));
              }}
              className="hover:text-white"
              style={{ background: "none", border: "none", color: "#fff", font: "inherit", textDecoration: "underline", textUnderlineOffset: 3, whiteSpace: "nowrap", flex: "none", cursor: "pointer", padding: "11px 4px", margin: "-11px -4px" }}
            >
              {c("Yönet", "Manage")}
            </button>
          )}
          <span className="hidden sm:inline" style={{ marginLeft: "auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{durum.eposta}</span>
          <button onClick={cikis} className="ml-auto sm:-ml-2 hover:text-white" style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", flex: "none", padding: "11px 8px", marginTop: -11, marginBottom: -11, marginRight: -8 }}>{c("Çıkış", "Sign out")}</button>
        </div>
      </div>
      {yonetHata && (
        <div role="alert" className="no-print" style={{ background: "var(--bad-soft)", color: "var(--bad)", fontSize: 13, fontWeight: 700, padding: "8px 16px" }}>{yonetHata}</div>
      )}
      {onay && durum.tur === "deneme" && (
        <div className="no-print" data-odeme-bekliyor style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, padding: "8px 16px" }}>
          {onay === "bekliyor" ? c("Ödemen alındı, aboneliğin açılıyor…", "Payment received, activating your subscription…") : c(`Ödemen alındı; aboneliğin birkaç dakika içinde açılacak. Sorun sürerse ${ABONELIK_EPOSTA} adresine yaz.`, `Payment received; your subscription will be active within a few minutes. If it isn't, write to ${ABONELIK_EPOSTA}.`)}
        </div>
      )}
      <EkipBaglam.Provider value={ekip}>{children}</EkipBaglam.Provider>
    </>
  );
}
