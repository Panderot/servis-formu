"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import RaporSayfa from "./RaporSayfa";
import Olcekli from "./Olcekli";
import ImzaPad from "./ImzaPad";
import Ikon, { Isaret } from "./Ikon";
import { useDepo, type Mod } from "./depo";
import { useEkip, teknisyenAnahtar } from "./ekip";
import EkipKarti from "./EkipKarti";
import HesapSilKarti from "./HesapSilKarti";
import { DilDugmesi } from "./Dil";
import { dilSec, useDil } from "../lib/dil";
import { kucult, depoKB } from "../lib/gorsel";
import {
  type Firma, type Rapor, type Odeme, type MusteriOzet, type Dil, type ParaBirimi,
  ODEME, KDV_ORANLARI, PARA_BIRIMLERI, demoFirma, sablonlarDil, odemeAd, vergiAd, paraSembol,
  bosRapor, sablonUygula, hesapla, para, tarihTR, tarihGunAy, tarihUzun, eksikler, waLink, waNumara, telefonGoster,
  ara, musteriler, musteriAnahtar, gecmis, ozet, uid, bugun, kucuk, buyukHarf, raporAyari, raporDili, raporPara, GUN_KISA,
} from "../lib/servis";

type Gorunum = "raporlar" | "form" | "musteriler" | "ayarlar";
const ADIMLAR: Record<Dil, string[]> = {
  tr: ["Müşteri", "Cihaz", "İşlemler", "Ücret", "Foto", "İmza"],
  en: ["Customer", "Appliance", "Work", "Charges", "Photos", "Signature"],
};
const ADIM_BASLIK: Record<Dil, string[]> = {
  tr: ["Müşteri bilgisi", "Cihaz ve şikayet", "Yapılan işlemler", "Parça, işçilik, KDV", "Önce / sonra fotoğrafları", "Müşteri imzası"],
  en: ["Customer details", "Appliance and problem", "Work carried out", "Parts, labour, VAT", "Before / after photos", "Customer signature"],
};
const PARA_AD: Record<ParaBirimi, string> = { TL: "TL", USD: "$ USD", EUR: "€ EUR", GBP: "£ GBP" };
// Tax rate label: Turkish %20, English 20%
const oran = (k: number, dil: Dil) => (dil === "en" ? `${k}%` : `%${k}`);
const MAX_FOTO = 6;
const KAYIT_LINKI = "/giris?kayit=1";

// Waits until the images inside el have loaded (or failed), at most ms.
function gorsellerYuklensin(el: Element | null, ms = 8000) {
  if (!el) return Promise.resolve();
  const l = Array.from(el.querySelectorAll("img")).filter((i) => !i.complete);
  return Promise.race([
    Promise.all(l.map((i) => new Promise((c) => { i.addEventListener("load", c, { once: true }); i.addEventListener("error", c, { once: true }); }))),
    new Promise((c) => setTimeout(c, ms)),
  ]);
}

function OdemePill({ o, dil }: { o: Odeme; dil: Dil }) {
  const sinif = o === "bekliyor" ? "warn" : o === "garanti" ? "info" : "ok";
  const en = dil === "en";
  return <span className={`pill ${sinif}`}>{o === "bekliyor" ? (en ? "Payment pending" : "Ödeme bekliyor") : o === "garanti" ? (en ? "Warranty" : "Garanti") : en ? "Paid" : "Ödendi"}</span>;
}

// The panel. mod "demo": sample records in this browser (/demo). mod "bulut": the account's records in Supabase (/app).
export default function Uygulama({ mod }: { mod: Mod }) {
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [mesaj, setMesaj] = useState("");
  const mesajZaman = useRef(0);
  const flash = (t: string, ms = 2600) => {
    setMesaj(t);
    window.clearTimeout(mesajZaman.current);
    mesajZaman.current = window.setTimeout(() => setMesaj(""), ms);
  };
  const bulut = mod === "bulut";
  // Team: a technician works on the owner's firm account; no report deletion, no firm settings.
  const ekip = useEkip();
  const teknisyen = bulut && ekip?.rol === "teknisyen";
  const depo = useDepo(mod, flash, dil, bulut && ekip ? { id: ekip.hesapId, sahip: !teknisyen } : null);
  const { hazir, firma, raporlar, ozelSablon } = depo;
  // A technician's own name for new reports stays on this device (the firm's default is the owner's).
  const [tekAd, setTekAd] = useState(() => {
    if (!teknisyen || !ekip) return "";
    try { return localStorage.getItem(teknisyenAnahtar(ekip.uid)) || ""; } catch { return ""; }
  });
  const tekAdKaydet = (ad: string) => {
    setTekAd(ad);
    if (ekip) { try { localStorage.setItem(teknisyenAnahtar(ekip.uid), ad); } catch {} }
  };
  const formFirma = teknisyen ? { ...firma, teknisyen: tekAd } : firma;
  const [gor, setGor] = useState<Gorunum>("raporlar");
  const [secili, setSecili] = useState<string>("");
  const [mobilDetay, setMobilDetay] = useState(false);
  const [q, setQ] = useState("");
  const [filtre, setFiltre] = useState("");
  const [taslak, setTaslak] = useState<Rapor | null>(null);
  const [adim, setAdim] = useState(0);
  const [duzenle, setDuzenle] = useState(false);
  const [yazdir, setYazdir] = useState<string>("");
  const [musteriSec, setMusteriSec] = useState<string>("");
  const [mq, setMq] = useState("");
  const [yeni, setYeni] = useState("");
  const [isleniyor, setIsleniyor] = useState(false);
  const [af, setAf] = useState<Firma>(firma);
  const [yedekHazirlaniyor, setYedekHazirlaniyor] = useState(false);
  const [sAd, setSAd] = useState("");
  const [sTur, setSTur] = useState("");
  const [sMad, setSMad] = useState("");
  const dosyaRef = useRef<HTMLInputElement>(null);

  // language and currency of new reports (the firm's setting; see raporAyari)
  const ayar = raporAyari(firma, dil);
  // menus and filters show template names in the app language; the form uses the report language
  const sablonlar = useMemo(() => [...sablonlarDil(dil), ...ozelSablon], [ozelSablon, dil]);
  // money on a report: the report's own currency; totals across reports: the firm's currency
  const rp = (n: number, x: Rapor) => para(n, raporPara(x), dil);
  const fp = (n: number) => para(n, ayar.para, dil);

  // Desktop side menu: sticky at the top, as tall as the visible part of the window. A bar above the
  // panel (trial or demo) pushes it down until the page scrolls, so its height follows the scroll and
  // the bottom block (sync status, language) never falls below the window.
  const asideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const a = asideRef.current;
    if (!hazir || !a) return;
    const ayarla = () => {
      const ust = (a.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY; // bars above the panel
      a.style.height = `calc(100dvh - ${Math.max(0, ust - window.scrollY)}px)`;
    };
    ayarla();
    window.addEventListener("scroll", ayarla, { passive: true });
    window.addEventListener("resize", ayarla);
    return () => {
      window.removeEventListener("scroll", ayarla);
      window.removeEventListener("resize", ayarla);
    };
  }, [hazir]);

  // ---- yükleme: /app?yeni=1 opens a new form once the records are loaded ----
  const yeniAcildi = useRef(false);
  useEffect(() => {
    if (!hazir || yeniAcildi.current) return;
    yeniAcildi.current = true;
    const q = new URLSearchParams(window.location.search);
    if (q.get("yeni") === "1") {
      setTaslak(bosRapor(formFirma, raporlar, new Date(), dil));
      setGor("form");
      // drop ?yeni=1 so a refresh or the browser's address suggestion does not reopen the form
      q.delete("yeni");
      const kalan = q.toString();
      window.history.replaceState(window.history.state, "", window.location.pathname + (kalan ? `?${kalan}` : "") + window.location.hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hazir, firma, raporlar]);

  // A firm keeps the report language and currency it has been using: saving fixes the current values,
  // so naming a new firm later does not switch its reports back to Turkish / TL.
  const kaydetFirma = (f: Firma) => depo.firmaKaydet({ ...f, raporDili: f.raporDili || ayar.dil, paraBirimi: f.paraBirimi || ayar.para });
  const kaydetSablon = depo.sablonKaydet;

  const liste = useMemo(() => ara(raporlar, q, filtre), [raporlar, q, filtre]);
  const mList = useMemo(() => musteriler(raporlar), [raporlar]);
  const seciliR = raporlar.find((r) => r.id === secili) || liste[0];
  const ay = bugun().tarih.slice(0, 7);
  const oz = useMemo(() => ozet(raporlar, ay), [raporlar, ay]);
  const yazdirR = raporlar.find((r) => r.id === yazdir) || seciliR;

  // ---- eylemler ----
  const git = (g: Gorunum) => { if (g === "ayarlar") setAf(firma); setGor(g); setMobilDetay(false); setMusteriSec(""); window.scrollTo(0, 0); };

  function yeniForm(onDolu?: Partial<Rapor>) {
    const r = { ...bosRapor(formFirma, raporlar, new Date(), dil), ...onDolu };
    setTaslak(r); setAdim(0); setDuzenle(false); setGor("form"); window.scrollTo(0, 0);
  }
  const duzenleAc = async (r: Rapor) => { const t = await depo.duzenlemeHazirla(r); setTaslak(t); setAdim(0); setDuzenle(true); setGor("form"); window.scrollTo(0, 0); };

  const tamamla = () => {
    if (!taslak) return;
    const e = eksikler(taslak, dil);
    if (e.length) { flash(c("Eksik: ", "Missing: ") + e.join(", ")); return; }
    const r = { ...taslak, imzalayan: taslak.imzalayan || taslak.musteri.ad };
    if (!depo.raporKaydet(r)) return;
    if (r.teknisyen && r.teknisyen !== formFirma.teknisyen) {
      if (teknisyen) tekAdKaydet(r.teknisyen);
      else kaydetFirma({ ...firma, teknisyen: r.teknisyen });
    }
    setTaslak(null); setSecili(r.id); setGor("raporlar"); setMobilDetay(true); setQ(""); setFiltre("");
    window.scrollTo(0, 0);
    flash(duzenle ? c("Rapor güncellendi", "Report updated") : c(`Rapor ${r.no} kaydedildi`, `Report ${r.no} saved`));
  };

  const sil = (r: Rapor) => {
    if (!confirm(c(`${r.no} numaralı rapor silinsin mi?`, `Delete report ${r.no}?`))) return;
    depo.raporSil(r.id);
    setSecili(""); setMobilDetay(false);
  };

  const pdf = async (r: Rapor) => {
    await depo.gorselHazirla(r); // photos and signature are links in the cloud: wait for them
    setYazdir(r.id);
    await new Promise((c) => setTimeout(c, 80));
    await gorsellerYuklensin(document.querySelector(".print-only"));
    const eski = document.title;
    document.title = `${r.no} ${r.musteri.ad}`.trim();
    window.print();
    document.title = eski;
  };

  const wa = (r: Rapor) => {
    if (waNumara(r.musteri.telefon).length < 11) { flash(c("Müşteri telefonu eksik ya da hatalı", "The customer's phone number is missing or invalid")); return; }
    window.open(waLink(r, firma), "_blank", "noopener");
  };

  const yeniMusteriden = (r: Rapor | MusteriOzet) => {
    const m = "musteri" in r ? r.musteri : { ad: r.ad, telefon: r.telefon, adres: r.adres };
    yeniForm({ musteri: { ...m } });
  };

  if (!hazir) return <main style={{ minHeight: "100vh", background: "var(--bg)" }} />;

  const demoVar = !bulut;
  const d = depo.durum;
  const durumYazi = !d ? "" : d.hata ? d.hata : d.cevrimdisi ? (d.bekleyen ? c(`İnternet yok: ${d.bekleyen} kayıt telefonda bekliyor`, `Offline: ${d.bekleyen} records waiting on this phone`) : c("İnternet yok", "Offline")) : d.bekleyen ? c(`${d.bekleyen} kayıt gönderiliyor`, `Sending ${d.bekleyen} records`) : c("Tüm kayıtlar hesabında", "All records are in your account");
  const durumRenk = !d ? "" : d.hata ? "var(--bad)" : d.cevrimdisi || d.bekleyen ? "var(--warn)" : "var(--ok)";
  // Greeting with the company name: the owner and every technician of the team see the firm account.
  const firmaAd = (firma.ad || "").trim().replace(/\.+$/, "");
  const saatNow = new Date().getHours();
  const selam = saatNow < 12 ? c("Günaydın", "Good morning") : saatNow < 18 ? c("İyi günler", "Good afternoon") : c("İyi akşamlar", "Good evening");
  const NAV = [["raporlar", c("Raporlar", "Reports"), "belge", raporlar.length], ["musteriler", c("Müşteriler", "Customers"), "kisiler", mList.length], ["ayarlar", teknisyen ? c("Ayarlar", "Settings") : c("Firma ve şablonlar", "Company and templates"), "ayar", null]] as const;

  // ================= ARAYÜZ =================
  return (
    <>
      <div className="screen-only panel" style={{ minHeight: "100vh" }}>
        {!bulut && (
          <div data-demo-serit className="no-print" style={{ background: "var(--ink)", color: "rgba(255,255,255,.75)", fontSize: 12.5, fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "8px 16px" }}>
              <span style={{ minWidth: 0 }}><b style={{ color: "#fff" }}>Demo:</b> {c("örnek kayıtlarla dene. Değişiklikler sadece bu tarayıcıda kalır.", "try it with sample records. Changes stay in this browser only.")}</span>
              <a href={KAYIT_LINKI} style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 3, whiteSpace: "nowrap", display: "inline-block", padding: "11px 6px", marginTop: -11, marginBottom: -11, marginRight: -6, marginLeft: "auto" }}>{c("Ücretsiz hesap aç", "Open a free account")}</a>
            </div>
          </div>
        )}
        <div className="lg:grid" style={{ gridTemplateColumns: "232px 1fr", minHeight: "100vh" }}>
          {/* Masaüstü yan menü (referans maketindeki beyaz ince menü) */}
          <aside ref={asideRef} className="hidden lg:flex" style={{ background: "var(--paper)", borderRight: "1px solid var(--line)", flexDirection: "column", padding: "18px 12px", position: "sticky", top: 0, height: "100dvh", overflowY: "auto" }}>
            <Link href="/" style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
              <Isaret boy={22} />Fixnote
            </Link>
            <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, padding: "6px 6px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firma.ad || c("Firma adı girilmedi", "No company name yet")}</div>
            <button className="btn" style={{ marginTop: 18, width: "100%", justifyContent: "flex-start" }} onClick={() => yeniForm()}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="arti" boy={14} kalinlik={2.6} /></span>{c("Yeni servis formu", "New service form")}
            </button>
            <nav style={{ marginTop: 16, display: "grid", gap: 2 }}>
              {NAV.map(([g, t, ik, n]) => (
                <button key={g} className={`navlink ${gor === g ? "on" : ""}`} onClick={() => git(g)}>
                  <Ikon ad={ik} boy={16} /><span style={{ flex: 1 }}>{t}</span>{n !== null && <span className="num" style={{ fontSize: 11.5, color: "var(--faint)" }}>{n}</span>}
                </button>
              ))}
            </nav>
            <div className="mini" style={{ padding: "20px 10px 6px" }}>{c("Şablonlar", "Templates")}</div>
            <div style={{ display: "grid", gap: 1 }}>
              {sablonlar.slice(0, 7).map((s) => (
                <button key={s.id} onClick={() => { git("raporlar"); setFiltre(s.id); }} style={{ background: filtre === s.id && gor === "raporlar" ? "var(--accent-soft)" : "none", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 10px", minHeight: 32, fontSize: 12.5, fontWeight: 600, color: filtre === s.id && gor === "raporlar" ? "var(--accent-ink)" : "var(--muted)", textAlign: "left" }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.ad}</span><span className="num" style={{ color: "var(--faint)" }}>{raporlar.filter((r) => r.sablonId === s.id).length}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: "auto", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, lineHeight: 1.5, padding: "0 8px" }}>
              {bulut ? (
                <div data-senkron={d?.hata ? "hata" : d?.cevrimdisi ? "cevrimdisi" : d?.bekleyen ? "bekliyor" : "tamam"} role="status" style={{ display: "flex", gap: 7, alignItems: "flex-start", color: d?.hata ? "var(--bad)" : "var(--muted)" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: 8, height: 8, borderRadius: 4, marginTop: 5, background: durumRenk }} />
                  <span>{durumYazi}</span>
                </div>
              ) : (
                <>
                  <span className="pill acc" style={{ marginBottom: 8 }}>{c("Demo mod · örnek kayıtlar", "Demo mode · sample records")}</span>
                  <div>{c("Kayıtlar bu tarayıcıda saklanır.", "Records are kept in this browser.")}</div>
                  <div>{c("Kullanılan alan:", "Space used:")} {depoKB()} KB</div>
                </>
              )}
              <DilDugmesi style={{ marginTop: 12 }} />
            </div>
          </aside>

          <div style={{ minWidth: 0 }}>
            {/* Mobil üst bar */}
            <header className="flex lg:hidden no-print" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <Link href="/" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: 8, padding: "8px 0", margin: "-8px 0" }}>
                <Isaret boy={22} />Fixnote
              </Link>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              {demoVar ? <span className="pill acc">{c("Demo mod", "Demo mode")}</span> : d && (d.hata || d.cevrimdisi || d.bekleyen) ? (
                <span className={`pill ${d.hata ? "bad" : "warn"}`} style={{ maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.hata ? c("Gönderilemedi", "Not sent") : d.cevrimdisi ? `${c("İnternet yok", "Offline")}${d.bekleyen ? ` · ${d.bekleyen} ${c("bekliyor", "waiting")}` : ""}` : c(`${d.bekleyen} gönderiliyor`, `Sending ${d.bekleyen}`)}</span>
              ) : <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, maxWidth: 130, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firma.ad}</span>}
              <DilDugmesi />
              </span>
            </header>

            <div style={{ paddingBottom: 96 }}>
              {gor === "raporlar" && RaporlarGorunum()}
              {gor === "form" && taslak && FormGorunum()}
              {gor === "musteriler" && MusterilerGorunum()}
              {gor === "ayarlar" && AyarlarGorunum()}
            </div>
          </div>
        </div>

        {/* Mobil alt sekme */}
        {gor !== "form" && (
          <nav className="grid lg:hidden" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, background: "var(--paper)", borderTop: "1px solid var(--line)", gridTemplateColumns: "1fr 1fr 1.4fr 1fr", alignItems: "center", padding: "6px 8px calc(6px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 24px rgba(16,39,58,.06)" }}>
            {([["raporlar", c("Raporlar", "Reports"), "belge"], ["musteriler", c("Müşteriler", "Customers"), "kisiler"]] as const).map(([g, t, ik]) => (
              <button key={g} onClick={() => git(g)} style={{ background: "none", border: "none", fontWeight: 700, fontSize: 11.5, padding: "6px 4px", display: "grid", justifyItems: "center", gap: 3, color: gor === g ? "var(--ink)" : "var(--faint)" }}><Ikon ad={ik} boy={19} style={{ color: gor === g ? "var(--accent)" : "var(--faint)" }} />{t}</button>
            ))}
            <button className="btn" style={{ padding: "11px 6px", fontSize: 13.5, gap: 5, whiteSpace: "nowrap" }} onClick={() => yeniForm()}><Ikon ad="arti" boy={15} kalinlik={2.6} />{c("Yeni form", "New form")}</button>
            <button onClick={() => git("ayarlar")} style={{ background: "none", border: "none", fontWeight: 700, fontSize: 11.5, padding: "6px 4px", display: "grid", justifyItems: "center", gap: 3, color: gor === "ayarlar" ? "var(--ink)" : "var(--faint)" }}><Ikon ad="ayar" boy={19} style={{ color: gor === "ayarlar" ? "var(--accent)" : "var(--faint)" }} />{c("Ayarlar", "Settings")}</button>
          </nav>
        )}

        {mesaj && (
          <div role="status" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 92, zIndex: 50, background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14, maxWidth: "calc(100vw - 32px)", boxShadow: "var(--shadow-lg)", display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="tik" boy={16} kalinlik={2.6} style={{ color: "#7cc4d6" }} />{mesaj}</div>
        )}
      </div>

      {/* Yalnızca yazdırırken görünen A4 */}
      <div className="print-only">{yazdirR && <RaporSayfa r={depo.coz(yazdirR)} f={firma} />}</div>
    </>
  );

  // ================= RAPORLAR =================
  function RaporlarGorunum() {
    const r = seciliR;
    const bg = bugun().tarih;
    const gunler = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 6 + i);
      const iso = bugun(d).tarih;
      return { g: GUN_KISA[dil][d.getDay()], n: raporlar.filter((x) => x.tarih === iso).length };
    });
    const maxg = Math.max(1, ...gunler.map((x) => x.n));
    const bekleyenN = raporlar.filter((x) => x.odeme === "bekliyor").length;
    const yaklasan = raporlar.filter((x) => x.sonrakiBakim && x.sonrakiBakim >= bg).sort((a, b) => a.sonrakiBakim.localeCompare(b.sonrakiBakim)).slice(0, 4);
    const gunFark = (iso: string) => Math.round((new Date(iso + "T00:00").getTime() - new Date(bg + "T00:00").getTime()) / 86400000);
    return (
      <div>
        <div className={mobilDetay ? "hidden lg:block" : "block"} style={{ padding: "22px 16px 0" }}>
          {depo.aktarim && (
            <div data-aktarim className="card" style={{ padding: "14px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderColor: "var(--accent)" }}>
              <span style={{ flex: "none", width: 34, height: 34, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><Ikon ad="belge" boy={17} /></span>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <b style={{ fontSize: 14 }}>{depo.aktarim.rapor ? c(`Bu cihazda daha önce kaydettiğin ${depo.aktarim.rapor} rapor var.`, `This device has ${depo.aktarim.rapor} reports you saved earlier.`) : c("Bu cihazda daha önce girdiğin firma bilgileri var.", "This device has company details you entered earlier.")}</b>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{c("Hesabına aktarırsan her telefondan görürsün. Bu cihazdaki kopya silinmez.", "Move them to your account to see them on any phone. The copy on this device is kept.")}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn" style={{ padding: "9px 14px" }} onClick={depo.aktar}>{c("Hesabıma aktar", "Move to my account")}</button>
                <button className="chip" onClick={depo.aktarimGizle}>{c("Şimdi değil", "Not now")}</button>
              </div>
            </div>
          )}
          {d?.hata && (
            <div data-senkron-hata role="alert" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{d.hata}</div>
          )}
          {bulut && hazir && !firma.ad.trim() && (
            <button data-firma-eksik onClick={() => git("ayarlar")} className="card" style={{ width: "100%", padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center", cursor: "pointer", textAlign: "left", boxShadow: "none" }}>
              <span style={{ flex: "none", width: 30, height: 30, borderRadius: 9, background: "var(--warn-soft)", color: "var(--warn)", display: "grid", placeItems: "center" }}><Ikon ad="ayar" boy={15} /></span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700 }}>{c("Rapor başlığın boş. Firma adını, telefonunu ve logonu ekle.", "Your report header is empty. Add your company name, phone and logo.")}<span style={{ display: "block", fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{c("Firma ve şablonlar", "Company and templates")}</span></span>
              <Ikon ad="ok" boy={16} style={{ color: "var(--muted)" }} />
            </button>
          )}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 className="p-bas">{selam}{firmaAd ? `, ${firmaAd}` : ""}.</h1>
              <div className="p-alt num">{tarihUzun(bg, dil)} · {c(`bu ay ${oz.adet} rapor`, `${oz.adet} ${oz.adet === 1 ? "report" : "reports"} this month`)}</div>
            </div>
            <div className="hidden lg:block"><button className="btn" onClick={() => yeniForm()}><Ikon ad="arti" boy={15} kalinlik={2.6} />{c("Yeni servis formu", "New service form")}</button></div>
          </div>

          {/* Mobil: büyük petrol mavisi kart (referanstaki telefon maketi) */}
          <div className="lg:hidden"><button onClick={() => yeniForm()} style={{ marginTop: 16, width: "100%", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 14, padding: "16px 16px", minHeight: 64, display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 16, cursor: "pointer", textAlign: "left" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="belge" boy={18} /></span>
            {c("Yeni servis formu", "New service form")}<Ikon ad="ok" boy={18} style={{ marginLeft: "auto" }} />
          </button></div>

          <div className="card p-serit" style={{ marginTop: 16 }}>
            <div className="p-genis">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minHeight: 20 }}><span className="mini">{c("Bu ay rapor", "Reports this month")}</span>{oz.adet > 0 && <span className="pill ok">{c(`%${oz.imzali} imzalı`, `${oz.imzali}% signed`)}</span>}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 6 }}>
                <span className="num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{oz.adet}</span>
                <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 40, flex: 1 }} aria-label={c("Son 7 gün rapor sayısı", "Reports in the last 7 days")}>
                  {gunler.map((x, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }} title={c(`${x.g}: ${x.n} rapor`, `${x.g}: ${x.n} reports`)}>
                      <div style={{ height: 4 + (x.n / maxg) * 24, borderRadius: 3, background: i === 6 ? "var(--accent)" : x.n ? "#a9cfdb" : "var(--tile)" }} />
                      <div style={{ fontSize: 9.5, color: i === 6 ? "var(--accent-ink)" : "var(--faint)", fontWeight: 700, marginTop: 3 }}>{x.g}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {[
              ["tutar", c("Bu ay tutar", "This month"), fp(oz.ciro), <span key="k" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{c("KDV dahil", "incl. tax")}</span>],
              ["bekleyen", c("Tahsil bekleyen", "Unpaid"), fp(oz.bekleyen), bekleyenN ? <span key="b" className="pill warn">{c(`${bekleyenN} rapor`, `${bekleyenN} ${bekleyenN === 1 ? "report" : "reports"}`)}</span> : raporlar.length ? <span key="b" className="pill ok">{c("Hepsi tahsil", "All paid")}</span> : null],
              ["musteri", c("Müşteri", "Customers"), String(mList.length), <span key="m" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{c(`${raporlar.length} raporda`, `across ${raporlar.length} reports`)}</span>],
            ].map(([id, k, v, alt]) => (
              <div key={id as string} className={id === "musteri" ? "hidden lg:block" : ""}>
                <span className="mini">{k as string}</span>
                <div className="p-sayi">{v as string}</div>
                <div style={{ marginTop: 4, minHeight: 20 }}>{alt}</div>
              </div>
            ))}
          </div>

          {yaklasan.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="p-bolum"><b>{c("Yaklaşan bakımlar", "Upcoming services")}</b><span>{c("tıkla, aynı müşteriye form aç", "tap to open a form for the same customer")}</span></div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginTop: 10 }}>
                {yaklasan.map((x, i) => {
                  const f = gunFark(x.sonrakiBakim);
                  return (
                    <button key={x.id} onClick={() => yeniForm({ musteri: { ...x.musteri }, cihaz: { ...x.cihaz } })} className="card p-bakim" style={{ flex: "0 0 auto", minWidth: 228, padding: "10px 14px", display: "flex", gap: 12, alignItems: "stretch", cursor: "pointer", textAlign: "left" }}>
                      <div className="num" style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, minWidth: 42, color: i === 0 ? "var(--accent-ink)" : "var(--ink)" }}>{tarihGunAy(x.sonrakiBakim, dil)}<div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700 }}>{x.sonrakiBakim.slice(0, 4)}</div></div>
                      <span style={{ width: 2, borderRadius: 2, background: i === 0 ? "var(--accent)" : "var(--line-2)" }} />
                      <div style={{ minWidth: 0 }}>
                        <div className="mini" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>{x.hizmet} · {f === 0 ? c("bugün", "today") : c(`${f} gün sonra`, f === 1 ? "in 1 day" : `in ${f} days`)}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{x.musteri.ad}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:grid" style={{ gridTemplateColumns: "minmax(330px, 420px) 1fr", gap: 16, padding: "20px 16px 0", alignItems: "start" }}>
          {/* Liste */}
          <div className={mobilDetay ? "hidden lg:block" : "block"}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--line)", display: "grid", gap: 10 }}>
                <div className="p-bolum"><b>{c("Son raporlar", "Latest reports")}</b><span className="num" style={{ fontWeight: 700 }}>{liste.length} / {raporlar.length}</span></div>
                <div style={{ position: "relative" }}>
                  <Ikon ad="ara" boy={16} style={{ position: "absolute", left: 12, top: 14, color: "var(--faint)" }} />
                  <input className="field" style={{ paddingLeft: 36 }} placeholder={c("Müşteri, telefon, rapor no, seri no", "Customer, phone, report no, serial no")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={c("Raporlarda ara", "Search reports")} />
                </div>
                <div className="filtre-sira" style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
                  <button className={`chip ${filtre === "" ? "on" : ""}`} style={{ padding: "5px 12px", fontSize: 12.5, flex: "none" }} onClick={() => setFiltre("")}>{c("Tümü", "All")}</button>
                  {sablonlar.map((s) => (
                    <button key={s.id} className={`chip ${filtre === s.id ? "on" : ""}`} style={{ padding: "5px 12px", fontSize: 12.5, whiteSpace: "nowrap", flex: "none" }} onClick={() => setFiltre(s.id)}>{s.ad}</button>
                  ))}
                </div>
              </div>
              {liste.length === 0 && (
                <div className="p-bos">
                  <div className="p-bos-ikon"><Ikon ad={raporlar.length ? "ara" : "belge"} boy={20} /></div>
                  {raporlar.length ? c("Aramaya uyan rapor yok.", "No reports match your search.") : c("Henüz rapor yok. İlk servis formunu oluştur.", "No reports yet. Create your first service form.")}
                  <div><button className="btn" style={{ marginTop: 14 }} onClick={() => yeniForm()}><Ikon ad="arti" boy={15} kalinlik={2.6} />{c("Yeni servis formu", "New service form")}</button></div>
                  {bulut && !raporlar.length && <div style={{ marginTop: 14, fontSize: 13 }}>{c("Önce nasıl göründüğüne bakmak istersen:", "Want to see how it looks first?")} <a data-ornek-link href="/demo" target="_blank" rel="noopener" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, whiteSpace: "nowrap", padding: "12px 0" }}>{c("Örnek kayıtlarla dene", "Try it with sample records")}</a></div>}
                </div>
              )}
              <div>
                {liste.map((x) => {
                  const h = hesapla(x);
                  return (
                    <button key={x.id} className={`row-btn ${r && r.id === x.id ? "on" : ""}`} onClick={() => { setSecili(x.id); setMobilDetay(true); window.scrollTo(0, 0); }}>
                      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                        <span className="doc-ico" style={r && r.id === x.id ? { background: "var(--accent-soft)", color: "var(--accent)" } : undefined}><Ikon ad="belge" boy={15} /></span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".01em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.musteri.ad.trim() ? buyukHarf(x.musteri.ad, raporDili(x)) : x.no}</span>
                            <span className="num" style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 700, whiteSpace: "nowrap" }}>{tarihTR(x.tarih, dil)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 3, fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
                            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.hizmet}{x.cihaz.marka ? ` · ${x.cihaz.marka}` : ""}</span>
                            <span className="num" style={{ fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap" }}>{x.odeme === "garanti" ? c("Garanti", "Warranty") : rp(h.toplam, x)}</span>
                          </div>
                          <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <OdemePill o={x.odeme} dil={dil} />
                            {x.imza ? <span className="pill mute">{c("İmzalı", "Signed")}</span> : <span className="pill bad">{c("İmzasız", "Not signed")}</span>}
                            {x.fotolar.length > 0 && <span className="pill mute">{x.fotolar.length} {c("foto", x.fotolar.length === 1 ? "photo" : "photos")}</span>}
                            {x.musteri.ad.trim() && <span className="num" style={{ marginLeft: "auto", fontSize: 11, color: "var(--faint)", fontWeight: 700, whiteSpace: "nowrap" }}>{x.no}</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detay */}
          <div className={mobilDetay ? "block" : "hidden lg:block"} style={{ minWidth: 0, marginTop: 0 }}>
            {r ? (
              <div>
                <div className="lg:hidden" style={{ padding: "4px 0 12px" }}>
                  <button className="chip" onClick={() => setMobilDetay(false)}><Ikon ad="sol" boy={15} />{c("Raporlar", "Reports")}</button>
                </div>
                <div className="card" style={{ padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, display: "flex", gap: 12, alignItems: "center" }}>
                      <span className="doc-ico" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="belge" boy={20} /></span>
                      <div style={{ minWidth: 0 }}>
                        <div className="num" style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>{r.no} · {tarihTR(r.tarih, dil)} {r.saat}</div>
                        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.025em", marginTop: 2, lineHeight: 1.2, overflowWrap: "anywhere" }}>{r.musteri.ad}</div>
                        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                          <OdemePill o={r.odeme} dil={dil} />
                          {r.imza ? <span className="pill mute">{c("İmzalı", "Signed")}</span> : <span className="pill bad">{c("İmzasız", "Not signed")}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                      <button className="btn btn-dark" style={{ padding: "11px 10px", whiteSpace: "nowrap" }} onClick={() => pdf(r)}><Ikon ad="indir" boy={15} /><span className="sm:hidden">{c("PDF kaydet", "Save PDF")}</span><span className="hidden sm:inline">{c("PDF olarak kaydet", "Save as PDF")}</span></button>
                      <button className="btn btn-wa" style={{ padding: "11px 10px", whiteSpace: "nowrap" }} onClick={() => wa(r)}><Ikon ad="mesaj" boy={15} /><span className="sm:hidden">WhatsApp</span><span className="hidden sm:inline">{c("WhatsApp'la gönder", "Send on WhatsApp")}</span></button>
                    </div>
                  </div>
                  <div className={teknisyen ? "grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-3 sm:flex sm:flex-wrap" : "grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-4 sm:flex sm:flex-wrap"} style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                    <button className="chip eylem" onClick={() => duzenleAc(r)}><Ikon ad="kalem" boy={14} />{c("Düzenle", "Edit")}</button>
                    <button className="chip eylem" aria-label={c("Bu müşteriye yeni form", "New form for this customer")} onClick={() => yeniMusteriden(r)}><Ikon ad="arti" boy={14} /><span className="sm:hidden">{c("Yeni form", "New form")}</span><span className="hidden sm:inline">{c("Bu müşteriye yeni form", "New form for this customer")}</span></button>
                    <button className="chip eylem" aria-label={c("Müşteri geçmişi", "Customer history")} onClick={() => { setMusteriSec(musteriAnahtar(r.musteri)); setGor("musteriler"); }}><Ikon ad="saat" boy={14} /><span className="sm:hidden">{c("Geçmiş", "History")}</span><span className="hidden sm:inline">{c("Müşteri geçmişi", "Customer history")}</span></button>
                    {!teknisyen && <button className="chip eylem" style={{ color: "var(--bad)" }} onClick={() => sil(r)}><Ikon ad="cop" boy={14} />{c("Sil", "Delete")}</button>}
                  </div>
                </div>
                <div className="p-onizleme">
                  <Olcekli><RaporSayfa r={depo.coz(r)} f={firma} /></Olcekli>
                </div>
              </div>
            ) : (
              <div className="card p-bos hidden lg:block" style={{ padding: 48 }}><div className="p-bos-ikon"><Ikon ad="belge" boy={20} /></div>{c("Bir rapor seç ya da yeni form oluştur.", "Pick a report or create a new form.")}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= FORM =================
  function FormGorunum() {
    const t = taslak!;
    const set = (p: Partial<Rapor>) => setTaslak({ ...t, ...p });
    const h = hesapla(t);
    const eksik = eksikler(t, dil);
    const rd = raporDili(t);
    const pb = raporPara(t);
    const formSablon = [...sablonlarDil(rd), ...ozelSablon];
    const oneriler = t.musteri.ad.trim().length >= 2 && adim === 0
      ? mList.filter((m) => kucuk(m.ad).includes(kucuk(t.musteri.ad.trim())) && m.ad !== t.musteri.ad).slice(0, 4)
      : [];
    const kayitliMusteri = mList.find((m) => waNumara(m.telefon) === waNumara(t.musteri.telefon) && waNumara(t.musteri.telefon).length >= 11);

    return (
      <div className="lg:grid" style={{ gridTemplateColumns: "minmax(0, 640px) minmax(0, 1fr)", gap: 22, padding: "16px 16px 0", alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <h1 className="p-bas" style={{ fontSize: 24 }}>{duzenle ? c("Raporu düzenle", "Edit report") : c("Yeni servis formu", "New service form")}</h1>
              <div className="num" style={{ fontSize: 12.5, marginTop: 2, color: "var(--muted)", fontWeight: 700 }}>{t.no} · {tarihTR(t.tarih, dil)} {t.saat}{rd !== dil || pb !== ayar.para ? ` · ${rd === "en" ? "English" : "Türkçe"} / ${pb}` : ""}</div>
            </div>
            <button className="chip" onClick={() => { if (confirm(c("Form kapatılsın mı? Kaydedilmeyen bilgiler silinir.", "Close the form? Anything not saved will be lost."))) { setTaslak(null); git("raporlar"); } }}>{c("Vazgeç", "Cancel")}</button>
          </div>

          {/* Adım göstergesi */}
          <div className="p-adimlar" style={{ gridTemplateColumns: `repeat(${ADIMLAR[dil].length}, 1fr)` }}>
            {ADIMLAR[dil].map((a, i) => (
              <button key={i} className={`p-adim ${i < adim ? "gecti" : i === adim ? "simdi" : ""}`} onClick={() => setAdim(i)} aria-label={c(`${i + 1}. adım: ${a}`, `Step ${i + 1}: ${a}`)}>
                <span className="p-adim-no">{i < adim ? <Ikon ad="tik" boy={13} kalinlik={3} /> : i + 1}</span>
                <span className="p-adim-ad">{a}</span>
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 18, marginTop: 10 }}>
            <div className="mini" style={{ color: "var(--accent)" }}>{c("Adım", "Step")} {adim + 1} / {ADIMLAR[dil].length}</div>
            <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", margin: "2px 0 16px" }}> {ADIM_BASLIK[dil][adim]}</h2>

            {adim === 0 && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <label className="lbl" htmlFor="mad">{c("Ad soyad / firma", "Name / company")}</label>
                  <input id="mad" className="field" autoComplete="off" placeholder={c("Örn. Ayşe Kaplan", "e.g. Sarah Collins")} value={t.musteri.ad} onChange={(e) => set({ musteri: { ...t.musteri, ad: e.target.value } })} />
                  {oneriler.length > 0 && (
                    <div className="card" style={{ marginTop: 6, overflow: "hidden" }}>
                      <div className="font-mono" style={{ fontSize: 10.5, padding: "8px 12px 4px", color: "var(--muted)", letterSpacing: ".08em" }}>{c("KAYITLI MÜŞTERİ", "SAVED CUSTOMER")}</div>
                      {oneriler.map((m) => (
                        <button key={m.anahtar} className="row-btn" style={{ padding: "10px 12px" }} onClick={() => set({ musteri: { ad: m.ad, telefon: m.telefon, adres: m.adres } })}>
                          <b>{m.ad}</b> <span style={{ color: "var(--muted)", fontSize: 13 }}>· {telefonGoster(m.telefon)}  |  {m.sayi} {c("rapor", m.sayi === 1 ? "report" : "reports")}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="lbl" htmlFor="mtel">{c("Telefon (WhatsApp)", "Phone (WhatsApp)")}</label>
                  <input id="mtel" className="field" type="tel" inputMode="tel" placeholder={c("05xx xxx xx xx", "+44 7700 900123")} value={t.musteri.telefon} onChange={(e) => set({ musteri: { ...t.musteri, telefon: e.target.value } })} />
                  {dil === "en" && !kayitliMusteri && <div style={{ fontSize: 12.5, marginTop: 6, color: "var(--muted)", fontWeight: 600 }}>Include the country code (for example +44) so WhatsApp opens the right number.</div>}
                  {kayitliMusteri && !duzenle && <div style={{ fontSize: 13, marginTop: 6, color: "var(--accent-ink)", fontWeight: 700 }}>{c(`Kayıtlı müşteri: ${kayitliMusteri.sayi} önceki servis, son ${tarihTR(kayitliMusteri.son, dil)}`, `Saved customer: ${kayitliMusteri.sayi} previous ${kayitliMusteri.sayi === 1 ? "visit" : "visits"}, last on ${tarihTR(kayitliMusteri.son, dil)}`)}</div>}
                </div>
                <div>
                  <label className="lbl" htmlFor="madr">{c("Adres", "Address")}</label>
                  <textarea id="madr" className="field" style={{ minHeight: 64 }} placeholder={c("Mahalle, sokak, no, ilçe / il", "Street, number, town, postcode")} value={t.musteri.adres} onChange={(e) => set({ musteri: { ...t.musteri, adres: e.target.value } })} />
                </div>
              </div>
            )}

            {adim === 1 && (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div className="lbl">{c("Hizmet türü (kontrol listesini otomatik doldurur)", "Service type (fills in the checklist)")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {formSablon.map((s) => (
                      <button key={s.id} className={`chip ${t.sablonId === s.id ? "on" : ""}`} onClick={() => setTaslak(sablonUygula({ ...t, cihaz: { ...t.cihaz, tur: t.sablonId === s.id ? t.cihaz.tur : "" } }, s))}>{s.ad}</button>
                    ))}
                  </div>
                </div>
                {kayitliMusteri && kayitliMusteri.cihazlar.length > 0 && (
                  <div>
                    <div className="lbl">{c("Bu müşterinin kayıtlı cihazları", "This customer's saved appliances")}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {kayitliMusteri.cihazlar.map((c, i) => (
                        <button key={i} className="chip" onClick={() => set({ cihaz: { ...c } })}>{[c.tur, c.marka, c.model].filter(Boolean).join(" ")}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="lbl" htmlFor="ctur">{c("Cihaz türü", "Appliance type")}</label><input id="ctur" className="field" value={t.cihaz.tur} onChange={(e) => set({ cihaz: { ...t.cihaz, tur: e.target.value } })} /></div>
                  <div><label className="lbl" htmlFor="cmar">{c("Marka", "Make")}</label><input id="cmar" className="field" value={t.cihaz.marka} onChange={(e) => set({ cihaz: { ...t.cihaz, marka: e.target.value } })} /></div>
                  <div><label className="lbl" htmlFor="cmod">Model</label><input id="cmod" className="field" value={t.cihaz.model} onChange={(e) => set({ cihaz: { ...t.cihaz, model: e.target.value } })} /></div>
                  <div><label className="lbl" htmlFor="cser">{c("Seri no", "Serial no")}</label><input id="cser" className="field" value={t.cihaz.seriNo} onChange={(e) => set({ cihaz: { ...t.cihaz, seriNo: e.target.value } })} /></div>
                </div>
                <div>
                  <label className="lbl" htmlFor="sik">{c("Şikayet / arıza", "Problem / fault")}</label>
                  <textarea id="sik" className="field" placeholder={c("Müşterinin anlattığı sorun", "The problem as the customer describes it")} value={t.sikayet} onChange={(e) => set({ sikayet: e.target.value })} />
                </div>
              </div>
            )}

            {adim === 2 && IslemlerAdim()}

            {adim === 3 && (
              <div style={{ display: "grid", gap: 12 }}>
                <div className="lbl" style={{ marginBottom: 0 }}>{c("Kullanılan parçalar", "Parts used")}</div>
                {t.parcalar.length === 0 && <div style={{ fontSize: 14, color: "var(--muted)" }}>{c("Parça kullanılmadıysa boş bırak.", "Leave empty if no parts were used.")}</div>}
                {t.parcalar.map((p, i) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 46px", gap: 6, alignItems: "end", paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
                    <div style={{ gridColumn: "1 / -1" }}>{i === 0 && <span className="lbl">{c("Parça", "Part")}</span>}<input className="field" aria-label={c("Parça adı", "Part name")} value={p.ad} placeholder={c("Parça adı", "Part name")} onChange={(e) => set({ parcalar: t.parcalar.map((x) => (x.id === p.id ? { ...x, ad: e.target.value } : x)) })} /></div>
                    <div><span className="lbl">{c("Adet", "Qty")}</span><input className="field" aria-label={c("Adet", "Quantity")} type="number" inputMode="numeric" min={1} value={p.adet || ""} onChange={(e) => set({ parcalar: t.parcalar.map((x) => (x.id === p.id ? { ...x, adet: parseFloat(e.target.value) || 0 } : x)) })} /></div>
                    <div><span className="lbl">{c("Birim fiyat", "Unit price")} ({paraSembol(pb)})</span><input className="field" aria-label={c("Birim fiyat", "Unit price")} type="number" inputMode="decimal" min={0} value={p.fiyat || ""} onChange={(e) => set({ parcalar: t.parcalar.map((x) => (x.id === p.id ? { ...x, fiyat: parseFloat(e.target.value) || 0 } : x)) })} /></div>
                    <button aria-label={c("Parçayı sil", "Remove part")} onClick={() => set({ parcalar: t.parcalar.filter((x) => x.id !== p.id) })} style={{ height: 46, border: "1.5px solid var(--line-2)", borderRadius: 8, background: "var(--paper)", cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                ))}
                <button className="chip" style={{ justifySelf: "start" }} onClick={() => set({ parcalar: [...t.parcalar, { id: uid(), ad: "", adet: 1, fiyat: 0 }] })}>{c("+ Parça ekle", "+ Add part")}</button>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div><label className="lbl" htmlFor="isc">{dil === "en" ? `Labour (${paraSembol(pb)}, excl. ${vergiAd(rd)})` : `İşçilik (${paraSembol(pb)}, ${vergiAd(rd)} hariç)`}</label><input id="isc" className="field" type="number" inputMode="decimal" min={0} value={t.iscilik || ""} onChange={(e) => set({ iscilik: parseFloat(e.target.value) || 0 })} /></div>
                  <div>
                    <div className="lbl">{c(`${vergiAd(rd)} oranı`, `${vergiAd(rd)} rate`)}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {KDV_ORANLARI.map((k) => <button key={k} className={`chip ${t.kdv === k ? "on" : ""}`} style={{ padding: "9px 11px" }} onClick={() => set({ kdv: k })}>{oran(k, dil)}</button>)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lbl">{c("Ödeme", "Payment")}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(Object.keys(ODEME) as Odeme[]).map((o) => <button key={o} className={`chip ${t.odeme === o ? "on" : ""}`} onClick={() => set({ odeme: o })}>{odemeAd(o, dil)}</button>)}
                  </div>
                </div>
                <div style={{ background: "var(--ink)", color: "#fff", borderRadius: 14, padding: "14px 16px", fontVariantNumeric: "tabular-nums" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.7)" }}><span>{c("Parça", "Parts")}</span><span>{rp(h.parca, t)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.7)" }}><span>{c("İşçilik", "Labour")}</span><span>{rp(h.iscilik, t)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.7)" }}><span>{vergiAd(rd)} {oran(t.kdv, dil)}</span><span>{rp(h.kdv, t)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.14)", fontSize: 20, fontWeight: 800 }}><span>{c("Toplam", "Total")}</span><span>{rp(h.toplam, t)}</span></div>
                  {t.odeme === "garanti" && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 4 }}>{c("Garanti kapsamında: parçalar raporda listelenir, ücret yansıtılmaz.", "Under warranty: parts are listed on the report, nothing is charged.")}</div>}
                </div>
              </div>
            )}

            {adim === 4 && FotoAdim()}

            {adim === 5 && (
              <div style={{ display: "grid", gap: 12 }}>
                <ImzaPad deger={t.imza} onChange={(v) => setTaslak((p) => (p ? { ...p, imza: v } : p))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="lbl" htmlFor="imz">{c("İmzalayan", "Signed by")}</label><input id="imz" className="field" placeholder={t.musteri.ad || c("Müşteri adı", "Customer name")} value={t.imzalayan} onChange={(e) => set({ imzalayan: e.target.value })} /></div>
                  <div><label className="lbl" htmlFor="tek">{c("Teknisyen", "Technician")}</label><input id="tek" className="field" value={t.teknisyen} onChange={(e) => set({ teknisyen: e.target.value })} /></div>
                </div>
                {eksik.length > 0 ? (
                  <div style={{ fontSize: 14, color: "var(--bad)", fontWeight: 700 }}>{c("Tamamlamak için eksik:", "Still needed:")} {eksik.join(", ")}</div>
                ) : (
                  <div style={{ fontSize: 14, color: "var(--ok)", fontWeight: 700 }}>{c("Her şey hazır. Toplam", "All set. Total")} {t.odeme === "garanti" ? c("garanti kapsamında", "under warranty") : rp(h.toplam, t)}.</div>
                )}
              </div>
            )}
          </div>

          {/* Alt gezinme */}
          <div style={{ position: "sticky", bottom: 0, zIndex: 10, background: "var(--bg)", borderTop: "1px solid var(--line)", marginTop: 14, padding: "12px 0 calc(12px + env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
            <button className="btn btn-ghost" disabled={adim === 0} onClick={() => { setAdim(adim - 1); window.scrollTo(0, 0); }}>{c("Geri", "Back")}</button>
            {adim < ADIMLAR[dil].length - 1 ? (
              <button className="btn" onClick={() => { setAdim(adim + 1); window.scrollTo(0, 0); }}>{c("İleri", "Next")}: {ADIMLAR[dil][adim + 1]}<Ikon ad="ok" boy={15} /></button>
            ) : (
              <button className="btn btn-dark" onClick={tamamla}><Ikon ad="tik" boy={15} kalinlik={2.6} />{duzenle ? c("Raporu güncelle", "Update report") : c("Raporu oluştur", "Create report")}</button>
            )}
          </div>
        </div>

        {/* Canlı önizleme (masaüstü) */}
        <div className="hidden lg:block" style={{ position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span className="mini">{c("Canlı rapor önizleme", "Live report preview")}</span><span className="pill acc">A4</span></div>
          <div className="p-onizleme"><Olcekli max={0.82}><RaporSayfa r={depo.coz(t)} f={firma} /></Olcekli></div>
        </div>
      </div>
    );
  }

  function IslemlerAdim() {
    const t = taslak!;
    const set = (p: Partial<Rapor>) => setTaslak({ ...t, ...p });
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {t.maddeler.length === 0 && (
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            {c("Hizmet türü seçmedin. Bir önceki adımda şablon seçersen kontrol listesi otomatik gelir, ya da aşağıdan kendi maddeni ekle.", "You haven't picked a service type. Pick a template in the previous step to fill in the checklist, or add your own steps below.")}
          </div>
        )}
        {t.maddeler.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)" }}>
            <span>{t.maddeler.filter((m) => m.ok).length}/{t.maddeler.length} {c("işlem yapıldı  |  uygulanmayanın üstüne dokun", "steps done  |  tap any step you skipped")}</span>
          </div>
        )}
        {t.maddeler.map((m, i) => (
          <button key={i} aria-pressed={m.ok} className={`check ${m.ok ? "on" : ""}`} onClick={() => set({ maddeler: t.maddeler.map((x, j) => (j === i ? { ...x, ok: !x.ok } : x)) })}>
            <span className="txt">{m.ad}</span><span className="sw" aria-hidden="true" />
          </button>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
          <input className="field" placeholder={c("Ek işlem yaz", "Add a step")} aria-label={c("Ek işlem", "Extra step")} value={yeni} onChange={(e) => setYeni(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && yeni.trim()) { set({ maddeler: [...t.maddeler, { ad: yeni.trim(), ok: true }] }); setYeni(""); } }} />
          <button className="btn btn-ghost" onClick={() => { if (yeni.trim()) { set({ maddeler: [...t.maddeler, { ad: yeni.trim(), ok: true }] }); setYeni(""); } }}>{c("Ekle", "Add")}</button>
        </div>
        <div>
          <label className="lbl" htmlFor="tes">{c("Tespit ve yapılan iş", "Findings and work done")}</label>
          <textarea id="tes" className="field" placeholder={c("Arızanın nedeni ve çözüm", "Cause of the fault and the fix")} value={t.tespit} onChange={(e) => set({ tespit: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div><label className="lbl" htmlFor="sb">{c("Sonraki bakım", "Next service")}</label><input id="sb" className="field" type="date" value={t.sonrakiBakim} onChange={(e) => set({ sonrakiBakim: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="nt">{c("Not", "Note")}</label><input id="nt" className="field" placeholder={c("İsteğe bağlı", "Optional")} value={t.not} onChange={(e) => set({ not: e.target.value })} /></div>
        </div>
      </div>
    );
  }

  function FotoAdim() {
    const t = taslak!;
    const ekle = async (tur: "once" | "sonra", dosyalar: FileList | null) => {
      if (!dosyalar || !dosyalar.length) return;
      const yer = MAX_FOTO - t.fotolar.length;
      if (yer <= 0) { flash(c(`En fazla ${MAX_FOTO} fotoğraf eklenir`, `You can add up to ${MAX_FOTO} photos`)); return; }
      setIsleniyor(true);
      const yeni: Rapor["fotolar"] = [];
      for (const f of Array.from(dosyalar).slice(0, yer)) {
        try { yeni.push({ id: uid(), tur, src: await kucult(f, 1000, 0.7) }); } catch { flash(c("Bir fotoğraf açılamadı", "A photo couldn't be opened")); }
      }
      setIsleniyor(false);
      setTaslak((p) => (p ? { ...p, fotolar: [...p.fotolar, ...yeni] } : p));
    };
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>{c(`Fotoğraflar telefonda küçültülür (en uzun kenar 1000 px), rapora ve arşive eklenir. En fazla ${MAX_FOTO} fotoğraf.`, `Photos are resized on the phone (longest side 1000 px) and added to the report and the archive. Up to ${MAX_FOTO} photos.`)}</div>
        {(["once", "sonra"] as const).map((tur) => {
          const l = t.fotolar.filter((x) => x.tur === tur);
          return (
            <div key={tur}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="lbl" style={{ margin: 0, fontSize: 14 }}>{tur === "once" ? c("Önce", "Before") : c("Sonra", "After")} ({l.length})</span>
                <label className="chip" style={{ cursor: "pointer" }}>
                  {c("+ Fotoğraf çek / seç", "+ Take / choose photo")}
                  <input type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => { ekle(tur, e.target.files); e.target.value = ""; }} />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {l.map((x) => (
                  <div key={x.id} style={{ position: "relative" }}>
                    <img src={depo.cozSrc(x.src)} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
                    <button aria-label={c("Fotoğrafı sil", "Remove photo")} onClick={() => setTaslak((p) => (p ? { ...p, fotolar: p.fotolar.filter((f) => f.id !== x.id) } : p))} style={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, borderRadius: 14, border: "none", background: "rgba(22,25,29,.8)", color: "#fff", cursor: "pointer" }}>×</button>
                  </div>
                ))}
                {l.length === 0 && <div style={{ gridColumn: "1 / -1", border: "1.5px dashed var(--line-2)", borderRadius: 8, padding: 18, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>{c("Henüz fotoğraf yok", "No photos yet")}</div>}
              </div>
            </div>
          );
        })}
        {isleniyor && <div style={{ fontSize: 14, fontWeight: 700 }}>{c("Fotoğraf küçültülüyor...", "Resizing photo...")}</div>}
      </div>
    );
  }

  // ================= MÜŞTERİLER =================
  function MusterilerGorunum() {
    const m = mList.find((x) => x.anahtar === musteriSec);
    if (m) {
      const g = gecmis(raporlar, m.anahtar);
      return (
        <div style={{ padding: "20px 16px 0", maxWidth: 900 }}>
          <button className="chip" onClick={() => setMusteriSec("")}>← {c("Müşteriler", "Customers")}</button>
          <div className="card" style={{ padding: 18, marginTop: 12 }}>
            <div className="mini">{c("Müşteri kartı", "Customer card")}</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8 }}>
              <span className="p-bh" aria-hidden="true" style={{ width: 48, height: 48, fontSize: 18, background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{buyukHarf(m.ad.trim()[0] || "?", dil)}</span>
              <div style={{ minWidth: 0 }}>
                <h1 className="p-bas" style={{ fontSize: 24, overflowWrap: "anywhere" }}>{m.ad}</h1>
                <div className="num" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600, marginTop: 3 }}>{telefonGoster(m.telefon)}  |  {m.adres}</div>
              </div>
            </div>
            {/* phones: one row per figure (label left, amount right) so large totals never overflow; wider screens: 3 tiles */}
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2" style={{ marginTop: 14 }}>
              {[[c("Servis", "Visits"), String(m.sayi)], [c("Toplam", "Total"), fp(m.toplam)], [c("Bekleyen", "Unpaid"), fp(m.bekleyen)]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 sm:block" style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 10, padding: "11px 14px", minWidth: 0 }}>
                  <div className="mini">{k}</div>
                  <div className="num sm:mt-1" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" style={{ marginTop: 14 }}>
              <button className="btn col-span-2" onClick={() => yeniMusteriden(m)}>{c("+ Bu müşteriye yeni form", "+ New form for this customer")}</button>
              <a className="btn btn-ghost" href={`tel:${m.telefon.replace(/\s/g, "")}`}><Ikon ad="telefon" boy={15} />{c("Ara", "Call")}</a>
              <a className="btn btn-wa" href={`https://wa.me/${waNumara(m.telefon)}`} target="_blank" rel="noopener noreferrer"><Ikon ad="mesaj" boy={15} />WhatsApp</a>
            </div>
            {m.cihazlar.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="lbl">{c("Kayıtlı cihazlar", "Saved appliances")}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{m.cihazlar.map((c, i) => <span key={i} className="pill mute" style={{ fontSize: 13, padding: "5px 10px", whiteSpace: "normal", maxWidth: "100%", overflowWrap: "anywhere", lineHeight: 1.4 }}>{[c.tur, c.marka, c.model].filter(Boolean).join(" ")}{c.seriNo ? `  |  SN ${c.seriNo}` : ""}</span>)}</div>
              </div>
            )}
          </div>
          <div className="tag" style={{ marginTop: 22, fontSize: 15 }}>{c("Servis geçmişi", "Service history")}</div>
          <div className="card" style={{ marginTop: 10, overflow: "hidden" }}>
            {g.map((r) => (
              <button key={r.id} className="row-btn" onClick={() => { setSecili(r.id); setGor("raporlar"); setMobilDetay(true); setMusteriSec(""); window.scrollTo(0, 0); }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>{r.hizmet}</b><span className="num" style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{r.odeme === "garanti" ? c("Garanti", "Warranty") : rp(hesapla(r).toplam, r)}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{tarihTR(r.tarih, dil)}  |  {r.no}  |  {[r.cihaz.marka, r.cihaz.model].filter(Boolean).join(" ")}  |  {r.teknisyen}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }
    const l = mList.filter((x) => !mq.trim() || kucuk(x.ad + " " + x.telefon + " " + x.adres).includes(kucuk(mq.trim())));
    return (
      <div style={{ padding: "20px 16px 0", maxWidth: 900 }}>
        <h1 className="p-bas">{c("Müşteriler", "Customers")}</h1>
        <div className="p-alt" style={{ marginBottom: 16 }}>{c(`${mList.length} müşteri · telefon numarasından birleşen servis geçmişi`, `${mList.length} ${mList.length === 1 ? "customer" : "customers"} · service history grouped by phone number`)}</div>
        <div style={{ position: "relative" }}>
          <Ikon ad="ara" boy={16} style={{ position: "absolute", left: 12, top: 14, color: "var(--faint)" }} />
          <input className="field" style={{ paddingLeft: 36 }} placeholder={c("Ad, telefon ya da adres ara", "Search name, phone or address")} aria-label={c("Müşteri ara", "Search customers")} value={mq} onChange={(e) => setMq(e.target.value)} />
        </div>
        <div className="card" style={{ marginTop: 12, overflow: "hidden" }}>
          {l.length === 0 && <div className="p-bos"><div className="p-bos-ikon"><Ikon ad="kisiler" boy={20} /></div>{c("Müşteri bulunamadı.", "No customers found.")}</div>}
          {l.map((x) => (
            <button key={x.anahtar} className="row-btn" onClick={() => setMusteriSec(x.anahtar)}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="p-bh" aria-hidden="true">{buyukHarf(x.ad.trim()[0] || "?", dil)}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <b style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.ad}</b>
                    <span className="num" style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700, whiteSpace: "nowrap" }}>{x.sayi} {c("servis", x.sayi === 1 ? "visit" : "visits")}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span className="num" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{telefonGoster(x.telefon)}  |  {c("son", "last")} {tarihTR(x.son, dil)}</span>
                    {x.bekleyen > 0 && <span className="pill warn">{c(`${fp(x.bekleyen)} bekliyor`, `${fp(x.bekleyen)} unpaid`)}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ================= AYARLAR =================
  // A technician's settings: team, own name, app language.
  function TeknisyenAyarlar() {
    return (
      <div style={{ padding: "20px 16px 0", maxWidth: 900 }}>
        <h1 className="p-bas">{c("Ayarlar", "Settings")}</h1>
        <div className="p-alt" style={{ marginBottom: 16 }}>{c("Ekip, adın ve uygulama dili", "Team, your name and app language")}</div>
        <EkipKarti dil={dil} />
        <div className="card" data-teknisyen-ad style={{ padding: 18, marginTop: 14 }}>
          <div className="p-kbas">
            <span className="p-kikon"><Ikon ad="kisi" boy={17} /></span>
            <div style={{ minWidth: 0 }}>
              <h2>{c("Adın", "Your name")}</h2>
              <p>{c("Yeni raporlarda teknisyen olarak bu ad yazılır. Sadece bu telefonda saklanır.", "New reports show this name as the technician. It's kept on this phone only.")}</p>
            </div>
          </div>
          <label className="lbl" htmlFor="t-ad">{c("Teknisyen adı", "Technician name")}</label>
          <input id="t-ad" className="field" value={tekAd} maxLength={80} onChange={(e) => setTekAd(e.target.value)} onBlur={(e) => tekAdKaydet(e.target.value.trim())} />
          <button className="btn" style={{ marginTop: 12 }} onClick={() => { tekAdKaydet(tekAd.trim()); flash(c("Adın kaydedildi", "Your name was saved")); }}>{c("Kaydet", "Save")}</button>
        </div>
        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          <div className="p-kbas">
            <span className="p-kikon"><Ikon ad="dunya" boy={17} /></span>
            <div style={{ minWidth: 0 }}>
              <h2>{c("Uygulama dili", "App language")}</h2>
              <p>{c("Sadece bu telefonda değişir. Raporların dili ve para birimi firma sahibinin ayarıdır.", "Only changes on this phone. The report language and currency are the owner's setting.")}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {(["tr", "en"] as const).map((d) => <button key={d} data-uygulama-dili={d} lang={d} className={`chip ${dil === d ? "on" : ""}`} aria-pressed={dil === d} onClick={() => dilSec(d)}>{d === "en" ? "English" : "Türkçe"}</button>)}
          </div>
        </div>
        <HesapSilKarti dil={dil} />
      </div>
    );
  }

  function AyarlarGorunum() {
    if (teknisyen) return TeknisyenAyarlar();
    const f = af;
    const setF = setAf;
    const alan = (k: keyof Firma, etiket: string, ph = "") => (
      <div>
        <label className="lbl" htmlFor={`f-${k}`}>{etiket}</label>
        <input id={`f-${k}`} className="field" placeholder={ph} value={String(f[k])} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      </div>
    );
    const yedekAl = async () => {
      if (yedekHazirlaniyor) return;
      setYedekHazirlaniyor(true);
      try {
        const v = await depo.yedekVerisi(); // in the cloud this downloads every photo and signature
        const blob = new Blob([JSON.stringify(v, null, 1)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `fixnote-yedek-${bugun().tarih}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      } catch { flash(c("Yedek hazırlanamadı. Bağlantını kontrol edip tekrar dene.", "The backup couldn't be prepared. Check your connection and try again.")); }
      finally { setYedekHazirlaniyor(false); }
    };
    const yedekYukle = async (fl: FileList | null) => {
      if (!fl?.[0]) return;
      let d: { firma?: Firma; raporlar: Rapor[]; sablonlar?: typeof ozelSablon };
      try {
        d = JSON.parse(await fl[0].text());
        if (!Array.isArray(d.raporlar)) throw new Error();
      } catch { flash(c("Yedek dosyası okunamadı", "The backup file couldn't be read")); return; }
      await depo.yedekYukle(d);
      if (d.firma) setF({ ...firma, ...d.firma });
    };
    const fAyar = raporAyari(f, dil);
    const firmaKaydetDugme = () => { if (kaydetFirma({ ...f, onek: (f.onek || "SR").toUpperCase().replace(/[^A-Z0-9]/g, "") || "SR", raporDili: fAyar.dil, paraBirimi: fAyar.para })) flash(c("Firma bilgileri kaydedildi", "Company details saved")); };
    return (
      <div style={{ padding: "20px 16px 0", maxWidth: 900 }}>
        <h1 className="p-bas">{c("Firma ve şablonlar", "Company and templates")}</h1>
        <div className="p-alt" style={{ marginBottom: 16 }}>{c("Rapor başlığı, dil, kontrol listeleri ve yedek", "Report header, language, checklists and backup")}</div>

        <div className="card" style={{ padding: 18 }}>
          <div className="p-kbas" style={{ alignItems: "center" }}>
            <span className="p-kikon"><Ikon ad="belge" boy={17} /></span>
            <div style={{ minWidth: 0 }}><h2>{c("Rapor başlığı", "Report header")}</h2></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: 12, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, flexWrap: "wrap" }}>
            {f.logo ? <img src={f.logo} alt="Logo" style={{ height: 52, maxWidth: 140, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 8, padding: 4, background: "#fff" }} /> : <div style={{ width: 52, height: 52, borderRadius: 8, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 24 }} className="font-display">{buyukHarf(f.ad.trim()[0] || "S", dil)}</div>}
            <label className="chip" style={{ cursor: "pointer" }}>
              {f.logo ? c("Logoyu değiştir", "Change logo") : c("Logo yükle", "Upload logo")}
              <input type="file" accept="image/*" hidden onChange={async (e) => { const fl = e.target.files?.[0]; if (fl) { const src = await kucult(fl, 400, 0.9, "image/png"); setF({ ...f, logo: src }); } e.target.value = ""; }} />
            </label>
            {f.logo && <button className="chip" onClick={() => setF({ ...f, logo: "" })}>{c("Kaldır", "Remove")}</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {alan("ad", c("Firma adı", "Company name"), c("Örn. Akyol Isı ve Klima Teknik Servis", "e.g. Brightline Heating & Cooling Ltd"))}
            {alan("telefon", c("Telefon", "Phone"))}
            {alan("eposta", c("E-posta", "Email"))}
            {alan("adres", c("Adres", "Address"))}
            {alan("vergiDairesi", c("Vergi dairesi", "Tax office (optional)"))}
            {alan("vergiNo", c("Vergi no", "Tax / VAT no"))}
            {alan("teknisyen", c("Varsayılan teknisyen", "Default technician"))}
            {alan("onek", c("Rapor no ön eki", "Report no prefix"), "SR")}
            <div>
              <div className="lbl">{c(`Varsayılan ${vergiAd(fAyar.dil)}`, `Default ${vergiAd(fAyar.dil)}`)}</div>
              <div style={{ display: "flex", gap: 5 }}>{KDV_ORANLARI.map((k) => <button key={k} className={`chip ${f.kdv === k ? "on" : ""}`} onClick={() => setF({ ...f, kdv: k })}>{oran(k, dil)}</button>)}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="lbl" htmlFor="f-alt">{c("Rapor alt notu (garanti şartları)", "Report footer (warranty terms)")}</label>
            <textarea id="f-alt" className="field" value={f.altNot} onChange={(e) => setF({ ...f, altNot: e.target.value })} />
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={firmaKaydetDugme}>{c("Kaydet", "Save")}</button>
        </div>

        <div className="card" data-dil-ayar style={{ padding: 18, marginTop: 14 }}>
          <div className="p-kbas">
            <span className="p-kikon"><Ikon ad="dunya" boy={17} /></span>
            <div style={{ minWidth: 0 }}>
              <h2>{c("Dil ve para birimi", "Language and currency")}</h2>
              <p>{c("Uygulama dili sadece bu telefonda değişir. Rapor dili ve para birimi yeni raporlara ve WhatsApp mesajına yazılır; eski raporlar kendi dilinde kalır.", "The app language only changes on this phone. The report language and currency apply to new reports and the WhatsApp message; older reports keep their own language.")}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div>
              <div className="lbl">{c("Uygulama dili", "App language")}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(["tr", "en"] as const).map((d) => <button key={d} data-uygulama-dili={d} lang={d} className={`chip ${dil === d ? "on" : ""}`} aria-pressed={dil === d} onClick={() => dilSec(d)}>{d === "en" ? "English" : "Türkçe"}</button>)}
              </div>
            </div>
            <div>
              <div className="lbl">{c("Rapor dili", "Report language")}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(["tr", "en"] as const).map((d) => <button key={d} data-rapor-dili={d} lang={d} className={`chip ${fAyar.dil === d ? "on" : ""}`} aria-pressed={fAyar.dil === d} onClick={() => setF({ ...f, raporDili: d, paraBirimi: fAyar.para })}>{d === "en" ? "English" : "Türkçe"}</button>)}
              </div>
            </div>
            <div>
              <div className="lbl">{c("Para birimi", "Currency")}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PARA_BIRIMLERI.map((b) => <button key={b} data-para={b} className={`chip ${fAyar.para === b ? "on" : ""}`} aria-pressed={fAyar.para === b} onClick={() => setF({ ...f, paraBirimi: b, raporDili: fAyar.dil })}>{PARA_AD[b]}</button>)}
              </div>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={firmaKaydetDugme}>{c("Kaydet", "Save")}</button>
        </div>

        {bulut && <EkipKarti dil={dil} />}

        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          <div className="p-kbas">
            <span className="p-kikon"><Ikon ad="liste" boy={17} /></span>
            <div style={{ minWidth: 0 }}>
              <h2>{c("Kontrol listesi şablonları", "Checklist templates")}</h2>
              <p>{c("Hazır 5 şablon her zaman var. Kendi hizmetin için şablon ekle (asansör bakımı, kamera kurulumu, su arıtma...).", "The 5 ready-made templates are always there. Add a template for your own service (lift maintenance, CCTV installation, water treatment...).")}</p>
            </div>
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
            {sablonlar.map((s, i) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 14px", minHeight: 46, borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span><b>{s.ad}</b> <span className="num" style={{ color: "var(--muted)", fontSize: 13 }}>· {s.maddeler.length} {c("madde", "steps")}{s.ozel ? c("  |  senin şablonun", "  |  your template") : ""}</span></span>
                {s.ozel && <button className="chip" style={{ color: "var(--bad)" }} onClick={() => kaydetSablon(ozelSablon.filter((x) => x.id !== s.id))}>{c("Sil", "Delete")}</button>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
            <div><label className="lbl" htmlFor="s-ad">{c("Şablon adı", "Template name")}</label><input id="s-ad" className="field" placeholder={c("Asansör periyodik bakım", "Lift maintenance")} value={sAd} onChange={(e) => setSAd(e.target.value)} /></div>
            <div><label className="lbl" htmlFor="s-tur">{c("Cihaz türü", "Appliance type")}</label><input id="s-tur" className="field" placeholder={c("Asansör", "Lift")} value={sTur} onChange={(e) => setSTur(e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="lbl" htmlFor="s-mad">{c("Maddeler (her satıra bir işlem)", "Steps (one per line)")}</label>
            <textarea id="s-mad" className="field" style={{ minHeight: 110 }} placeholder={c("Fren sistemi kontrol edildi\nKapı kilitleri test edildi\nHalatlar yağlandı", "Brake system checked\nDoor locks tested\nRopes lubricated")} value={sMad} onChange={(e) => setSMad(e.target.value)} />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => {
            const maddeler = sMad.split("\n").map((x) => x.trim()).filter(Boolean);
            if (!sAd.trim() || !maddeler.length) { flash(c("Şablon adı ve en az bir madde gerekli", "A template name and at least one step are needed")); return; }
            kaydetSablon([...ozelSablon, { id: "ozel-" + uid(), ad: sAd.trim(), cihazTuru: sTur.trim(), maddeler, ozel: true }]);
            setSAd(""); setSTur(""); setSMad(""); flash(c("Şablon eklendi", "Template added"));
          }}>{c("+ Şablonu ekle", "+ Add template")}</button>
        </div>

        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          <div className="p-kbas">
            <span className="p-kikon"><Ikon ad="veri" boy={17} /></span>
            <div style={{ minWidth: 0 }}>
              <h2>{c("Veri", "Data")}</h2>
              <p>
            {bulut
              ? c("Raporların, fotoğrafların ve imzaların hesabında saklanır; telefon değişse de kaybolmaz. İnternet yokken kaydettiğin rapor telefonda bekler, bağlantı gelince gönderilir. İstersen tek dosyalık yedek de indirebilirsin.", "Your reports, photos and signatures are stored in your account, so changing phones loses nothing. A report saved offline waits on the phone and is sent when you're back online. You can also download a single-file backup.")
              : c(`Demo kayıtları yalnızca bu tarayıcıda durur (şu an ${depoKB()} KB).`, `Demo records stay in this browser only (currently ${depoKB()} KB).`)}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="chip" onClick={yedekAl} disabled={yedekHazirlaniyor}>{yedekHazirlaniyor ? c("Yedek hazırlanıyor...", "Preparing backup...") : c("Yedek indir (JSON)", "Download backup (JSON)")}</button>
            <button className="chip" onClick={() => dosyaRef.current?.click()}>{c("Yedek yükle", "Restore backup")}</button>
            <input ref={dosyaRef} type="file" accept="application/json" hidden onChange={(e) => { yedekYukle(e.target.files); e.target.value = ""; }} />
            {!bulut && <button className="chip" onClick={() => { depo.ornekYukle(); setF(demoFirma(dil)); }}>{c("Örnek kayıtları yükle", "Load sample records")}</button>}
            <button className="chip" style={{ color: "var(--bad)" }} onClick={async () => { if (confirm(bulut ? c("Hesabındaki tüm raporlar, fotoğraflar ve imzalar silinsin mi? Bu geri alınamaz.", "Delete every report, photo and signature in your account? This can't be undone.") : c("Tüm raporlar silinsin mi? Bu geri alınamaz.", "Delete all reports? This can't be undone."))) { await depo.tumunuSil(); setSecili(""); } }}>{c("Tüm raporları sil", "Delete all reports")}</button>
          </div>
        </div>
        {bulut && <HesapSilKarti dil={dil} />}
      </div>
    );
  }
}
