"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import RaporSayfa from "../components/RaporSayfa";
import Olcekli from "../components/Olcekli";
import ImzaPad from "../components/ImzaPad";
import Ikon, { Isaret } from "../components/Ikon";
import { kucult, depoKB } from "../lib/gorsel";
import {
  type Firma, type Rapor, type Sablon, type Odeme, type MusteriOzet,
  SABLONLAR, ODEME, KDV_ORANLARI, DEMO_FIRMA, DEMO_RAPORLAR,
  bosRapor, sablonUygula, hesapla, tl, tarihTR, tarihUzun, eksikler, waLink, waNumara, telefonGoster,
  ara, musteriler, gecmis, ozet, uid, bugun,
} from "../lib/servis";

type Gorunum = "raporlar" | "form" | "musteriler" | "ayarlar";
const ADIMLAR = ["Müşteri", "Cihaz", "İşlemler", "Ücret", "Foto", "İmza"];
const K = { firma: "sf_firma", raporlar: "sf_raporlar", sablon: "sf_sablonlar", ilk: "sf_baslatildi" };
const MAX_FOTO = 6;

const BOS_FIRMA: Firma = { ad: "", telefon: "", eposta: "", adres: "", vergiDairesi: "", vergiNo: "", logo: "", kdv: 20, onek: "SR", teknisyen: "", altNot: "" };

function oku<T>(k: string, v: T): T {
  try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : v; } catch { return v; }
}

function OdemePill({ o }: { o: Odeme }) {
  const c = o === "bekliyor" ? "warn" : o === "garanti" ? "info" : "ok";
  return <span className={`pill ${c}`}>{o === "bekliyor" ? "Ödeme bekliyor" : o === "garanti" ? "Garanti" : "Ödendi"}</span>;
}

export default function Uygulama() {
  const [hazir, setHazir] = useState(false);
  const [firma, setFirma] = useState<Firma>(DEMO_FIRMA);
  const [raporlar, setRaporlar] = useState<Rapor[]>([]);
  const [ozelSablon, setOzelSablon] = useState<Sablon[]>([]);
  const [gor, setGor] = useState<Gorunum>("raporlar");
  const [secili, setSecili] = useState<string>("");
  const [mobilDetay, setMobilDetay] = useState(false);
  const [q, setQ] = useState("");
  const [filtre, setFiltre] = useState("");
  const [taslak, setTaslak] = useState<Rapor | null>(null);
  const [adim, setAdim] = useState(0);
  const [duzenle, setDuzenle] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [yazdir, setYazdir] = useState<string>("");
  const [musteriSec, setMusteriSec] = useState<string>("");
  const [mq, setMq] = useState("");
  const [yeni, setYeni] = useState("");
  const [isleniyor, setIsleniyor] = useState(false);
  const [af, setAf] = useState<Firma>(DEMO_FIRMA);
  const [sAd, setSAd] = useState("");
  const [sTur, setSTur] = useState("");
  const [sMad, setSMad] = useState("");
  const dosyaRef = useRef<HTMLInputElement>(null);

  const sablonlar = useMemo(() => [...SABLONLAR, ...ozelSablon], [ozelSablon]);

  // ---- yükleme ----
  useEffect(() => {
    let ilk = false;
    try { ilk = !localStorage.getItem(K.ilk); } catch {}
    let f = DEMO_FIRMA;
    let l = DEMO_RAPORLAR;
    if (ilk) {
      try {
        localStorage.setItem(K.ilk, "1");
        localStorage.setItem(K.firma, JSON.stringify(DEMO_FIRMA));
        localStorage.setItem(K.raporlar, JSON.stringify(DEMO_RAPORLAR));
      } catch {}
    } else {
      f = oku(K.firma, BOS_FIRMA);
      l = oku<Rapor[]>(K.raporlar, []);
      setOzelSablon(oku<Sablon[]>(K.sablon, []));
    }
    setFirma(f);
    setRaporlar(l);
    if (new URLSearchParams(window.location.search).get("yeni") === "1") {
      setTaslak(bosRapor(f, l));
      setGor("form");
    }
    setHazir(true);
  }, []);

  const flash = (t: string) => { setMesaj(t); setTimeout(() => setMesaj(""), 2600); };

  const kaydetRaporlar = (l: Rapor[]) => {
    try { localStorage.setItem(K.raporlar, JSON.stringify(l)); setRaporlar(l); return true; }
    catch { flash("Depolama dolu: bazı fotoğrafları silip yeniden dene ya da Ayarlar'dan yedek alıp eski kayıtları temizle."); return false; }
  };
  const kaydetFirma = (f: Firma) => { setFirma(f); try { localStorage.setItem(K.firma, JSON.stringify(f)); } catch { flash("Logo çok büyük, daha küçük bir dosya dene."); } };
  const kaydetSablon = (l: Sablon[]) => { setOzelSablon(l); try { localStorage.setItem(K.sablon, JSON.stringify(l)); } catch {} };

  const liste = useMemo(() => ara(raporlar, q, filtre), [raporlar, q, filtre]);
  const mList = useMemo(() => musteriler(raporlar), [raporlar]);
  const seciliR = raporlar.find((r) => r.id === secili) || liste[0];
  const ay = bugun().tarih.slice(0, 7);
  const oz = useMemo(() => ozet(raporlar, ay), [raporlar, ay]);
  const yazdirR = raporlar.find((r) => r.id === yazdir) || seciliR;

  // ---- eylemler ----
  const git = (g: Gorunum) => { if (g === "ayarlar") setAf(firma); setGor(g); setMobilDetay(false); setMusteriSec(""); window.scrollTo(0, 0); };

  function yeniForm(onDolu?: Partial<Rapor>) {
    const r = { ...bosRapor(firma, raporlar), ...onDolu };
    setTaslak(r); setAdim(0); setDuzenle(false); setGor("form"); window.scrollTo(0, 0);
  }
  const duzenleAc = (r: Rapor) => { setTaslak(JSON.parse(JSON.stringify(r))); setAdim(0); setDuzenle(true); setGor("form"); window.scrollTo(0, 0); };

  const tamamla = () => {
    if (!taslak) return;
    const e = eksikler(taslak);
    if (e.length) { flash("Eksik: " + e.join(", ")); return; }
    const r = { ...taslak, imzalayan: taslak.imzalayan || taslak.musteri.ad };
    const l = duzenle ? raporlar.map((x) => (x.id === r.id ? r : x)) : [r, ...raporlar];
    if (!kaydetRaporlar(l)) return;
    if (r.teknisyen && r.teknisyen !== firma.teknisyen) kaydetFirma({ ...firma, teknisyen: r.teknisyen });
    setTaslak(null); setSecili(r.id); setGor("raporlar"); setMobilDetay(true); setQ(""); setFiltre("");
    window.scrollTo(0, 0);
    flash(duzenle ? "Rapor güncellendi" : `Rapor ${r.no} kaydedildi`);
  };

  const sil = (r: Rapor) => {
    if (!confirm(`${r.no} numaralı rapor silinsin mi?`)) return;
    kaydetRaporlar(raporlar.filter((x) => x.id !== r.id));
    setSecili(""); setMobilDetay(false);
  };

  const pdf = (r: Rapor) => {
    setYazdir(r.id);
    const eski = document.title;
    document.title = `${r.no} ${r.musteri.ad}`.trim();
    setTimeout(() => { window.print(); document.title = eski; }, 80);
  };

  const wa = (r: Rapor) => {
    if (waNumara(r.musteri.telefon).length < 11) { flash("Müşteri telefonu eksik ya da hatalı"); return; }
    window.open(waLink(r, firma), "_blank", "noopener");
  };

  const yeniMusteriden = (r: Rapor | MusteriOzet) => {
    const m = "musteri" in r ? r.musteri : { ad: r.ad, telefon: r.telefon, adres: r.adres };
    yeniForm({ musteri: { ...m } });
  };

  if (!hazir) return <main style={{ minHeight: "100vh", background: "var(--bg)" }} />;

  const demoVar = raporlar.some((r) => r.id.startsWith("demo"));
  const ilkAd = (firma.teknisyen || "").trim().split(" ")[0];
  const saatNow = new Date().getHours();
  const selam = saatNow < 12 ? "Günaydın" : saatNow < 18 ? "İyi günler" : "İyi akşamlar";
  const NAV = [["raporlar", "Raporlar", "belge", raporlar.length], ["musteriler", "Müşteriler", "kisiler", mList.length], ["ayarlar", "Firma ve şablonlar", "ayar", null]] as const;

  // ================= ARAYÜZ =================
  return (
    <>
      <div className="screen-only" style={{ minHeight: "100vh" }}>
        <div className="lg:grid" style={{ gridTemplateColumns: "232px 1fr", minHeight: "100vh" }}>
          {/* Masaüstü yan menü (referans maketindeki beyaz ince menü) */}
          <aside className="side-dark hidden lg:flex" style={{ background: "var(--ink)", flexDirection: "column", padding: "18px 12px", position: "sticky", top: 0, height: "100vh" }}>
            <Link href="/" className="font-display" style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8, padding: "0 6px", color: "#fff" }}>
              <Isaret boy={22} />Fixnote
            </Link>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)", fontWeight: 500, padding: "6px 6px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firma.ad || "Firma adı girilmedi"}</div>
            <button className="btn" style={{ marginTop: 18, width: "100%", justifyContent: "flex-start" }} onClick={() => yeniForm()}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="arti" boy={14} kalinlik={2.6} /></span>Yeni servis formu
            </button>
            <nav style={{ marginTop: 16, display: "grid", gap: 2 }}>
              {NAV.map(([g, t, ik, n]) => (
                <button key={g} className={`navlink ${gor === g ? "on" : ""}`} onClick={() => git(g)}>
                  <Ikon ad={ik} boy={16} /><span style={{ flex: 1 }}>{t}</span>{n !== null && <span className="num" style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)" }}>{n}</span>}
                </button>
              ))}
            </nav>
            <div className="mini" style={{ padding: "20px 10px 6px", color: "rgba(255,255,255,.4)" }}>Şablonlar</div>
            <div style={{ display: "grid", gap: 1 }}>
              {sablonlar.slice(0, 7).map((s) => (
                <button key={s.id} onClick={() => { git("raporlar"); setFiltre(s.id); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", padding: "5px 10px", fontSize: 12.5, fontWeight: 500, color: filtre === s.id && gor === "raporlar" ? "#6cc0d4" : "rgba(255,255,255,.62)", textAlign: "left" }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.ad}</span><span className="num" style={{ color: "rgba(255,255,255,.4)" }}>{raporlar.filter((r) => r.sablonId === s.id).length}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: "auto", fontSize: 11.5, color: "rgba(255,255,255,.5)", fontWeight: 500, lineHeight: 1.5, padding: "0 8px" }}>
              {demoVar && <span className="pill acc" style={{ marginBottom: 8 }}>Demo mod · örnek kayıtlar</span>}
              <div>Kayıtlar bu cihazda saklanır.</div>
              <div>Kullanılan alan: {depoKB()} KB</div>
            </div>
          </aside>

          <div style={{ minWidth: 0 }}>
            {/* Mobil üst bar */}
            <header className="flex lg:hidden no-print" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <Link href="/" className="font-display" style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
                <Isaret boy={22} />Fixnote
              </Link>
              {demoVar ? <span className="pill acc">Demo mod</span> : <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, maxWidth: 170, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firma.ad}</span>}
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
          <nav className="grid lg:hidden" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, background: "var(--paper)", borderTop: "1px solid var(--line)", gridTemplateColumns: "1fr 1fr 1.25fr 1fr", alignItems: "center", padding: "6px 8px calc(6px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 24px rgba(16,39,58,.06)" }}>
            {([["raporlar", "Raporlar", "belge"], ["musteriler", "Müşteriler", "kisiler"]] as const).map(([g, t, ik]) => (
              <button key={g} onClick={() => git(g)} style={{ background: "none", border: "none", fontWeight: 700, fontSize: 11.5, padding: "6px 4px", display: "grid", justifyItems: "center", gap: 3, color: gor === g ? "var(--ink)" : "var(--faint)" }}><Ikon ad={ik} boy={19} style={{ color: gor === g ? "var(--accent)" : "var(--faint)" }} />{t}</button>
            ))}
            <button className="btn" style={{ padding: "11px 8px", fontSize: 13.5 }} onClick={() => yeniForm()}><Ikon ad="arti" boy={15} kalinlik={2.6} />Yeni form</button>
            <button onClick={() => git("ayarlar")} style={{ background: "none", border: "none", fontWeight: 700, fontSize: 11.5, padding: "6px 4px", display: "grid", justifyItems: "center", gap: 3, color: gor === "ayarlar" ? "var(--ink)" : "var(--faint)" }}><Ikon ad="ayar" boy={19} style={{ color: gor === "ayarlar" ? "var(--accent)" : "var(--faint)" }} />Ayarlar</button>
          </nav>
        )}

        {mesaj && (
          <div role="status" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 92, zIndex: 50, background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14, maxWidth: "calc(100vw - 32px)", boxShadow: "var(--shadow-lg)", display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="tik" boy={16} kalinlik={2.6} style={{ color: "#7cc4d6" }} />{mesaj}</div>
        )}
      </div>

      {/* Yalnızca yazdırırken görünen A4 */}
      <div className="print-only">{yazdirR && <RaporSayfa r={yazdirR} f={firma} />}</div>
    </>
  );

  // ================= RAPORLAR =================
  function RaporlarGorunum() {
    const r = seciliR;
    const bg = bugun().tarih;
    // 7 günlük aktivite şeridi: en son rapor gününde biter ki boş pencere görünmesin.
    const sonIso = raporlar.length ? raporlar.map((x) => x.tarih).reduce((a, b) => (a > b ? a : b)) : bg;
    const sonGun = new Date(sonIso + "T00:00");
    const gunler = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sonGun); d.setDate(d.getDate() - 6 + i);
      const iso = bugun(d).tarih;
      return { g: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][d.getDay()], n: raporlar.filter((x) => x.tarih === iso).length };
    });
    const maxg = Math.max(1, ...gunler.map((x) => x.n));
    const bekleyenN = raporlar.filter((x) => x.odeme === "bekliyor").length;
    const yaklasan = raporlar.filter((x) => x.sonrakiBakim && x.sonrakiBakim >= bg).sort((a, b) => a.sonrakiBakim.localeCompare(b.sonrakiBakim)).slice(0, 4);
    const gunFark = (iso: string) => Math.round((new Date(iso + "T00:00").getTime() - new Date(bg + "T00:00").getTime()) / 86400000);
    return (
      <div>
        <div className={mobilDetay ? "hidden lg:block" : "block"} style={{ padding: "22px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>{selam}{ilkAd ? ` ${ilkAd}` : ""}.</h1>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{tarihUzun(bg)} · bu ay {oz.adet} rapor</div>
            </div>
            <div className="hidden lg:block"><button className="btn" onClick={() => yeniForm()}><Ikon ad="arti" boy={15} kalinlik={2.6} />Yeni servis formu</button></div>
          </div>

          {/* Mobil: büyük petrol mavisi kart (referanstaki telefon maketi) */}
          <div className="lg:hidden"><button onClick={() => yeniForm()} style={{ marginTop: 14, width: "100%", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 16, padding: "16px 16px", display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 16, cursor: "pointer", textAlign: "left" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="belge" boy={18} /></span>
            Yeni servis formu<Ikon ad="ok" boy={18} style={{ marginLeft: "auto" }} />
          </button></div>

          <div style={{ marginTop: 16, border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 1, background: "var(--line)" }}>
              <div className="col-span-2 lg:col-span-1" style={{ background: "var(--paper)", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="mini">Bu ay rapor</span><span className="pill ok" style={{ fontSize: 9.5 }}>%{oz.imzali} imzalı</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                  <span className="num font-display" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1 }}>{oz.adet}</span>
                  <div style={{ display: "flex", gap: 5, flex: 1 }} aria-label="Son 7 gün rapor sayısı">
                    {gunler.map((x, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center" }} title={`${x.g}: ${x.n} rapor`}>
                        <div style={{ height: 24, borderRadius: 4, background: x.n ? "var(--accent)" : "var(--tile)", opacity: x.n ? (x.n >= maxg ? 1 : 0.55) : 1, border: i === 6 ? "1.5px solid var(--accent)" : "1.5px solid transparent" }} />
                        <div style={{ fontSize: 8.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{x.g}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {[
                ["Bu ay tutar", tl(oz.ciro), <span key="k" style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>KDV dahil</span>],
                ["Tahsil bekleyen", tl(oz.bekleyen), bekleyenN ? <span key="b" className="pill warn">{bekleyenN} rapor</span> : <span key="b" className="pill ok">Hepsi tahsil</span>],
                ["Müşteri", String(mList.length), <span key="m" style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{raporlar.length} raporda</span>],
              ].map(([k, v, alt]) => (
                <div key={k as string} className={k === "Müşteri" ? "hidden lg:block" : ""} style={{ background: "var(--paper)", padding: "12px 14px" }}>
                  <span className="mini">{k as string}</span>
                  <div className="num font-display" style={{ fontSize: 20, fontWeight: 600, marginTop: 6, whiteSpace: "nowrap" }}>{v as string}</div>
                  <div style={{ marginTop: 2 }}>{alt}</div>
                </div>
              ))}
            </div>
          </div>

          {yaklasan.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><b style={{ fontSize: 14 }}>Yaklaşan bakımlar</b><span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>tıkla, aynı müşteriye form aç</span></div>
              <div style={{ marginTop: 10, border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "var(--paper)" }}>
                {yaklasan.map((x, i) => {
                  const f = gunFark(x.sonrakiBakim);
                  return (
                    <button key={x.id} onClick={() => yeniForm({ musteri: { ...x.musteri }, cihaz: { ...x.cihaz } })} className="row-btn" style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px" }}>
                      <div className="num" style={{ textAlign: "right", minWidth: 50, fontWeight: 700, fontSize: 12.5, lineHeight: 1.2 }}>{tarihTR(x.sonrakiBakim).slice(0, 5)}<div style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>{x.sonrakiBakim.slice(0, 4)}</div></div>
                      <span style={{ width: 10, height: 10, borderRadius: 5, flex: "none", background: i === 0 ? "var(--accent)" : "var(--paper)", border: `2px solid ${i === 0 ? "var(--accent)" : "var(--line-2)"}` }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.musteri.ad}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{x.hizmet} · {f === 0 ? "bugün" : `${f} gün sonra`}</div>
                      </div>
                      <Ikon ad="sag" boy={14} style={{ color: "var(--faint)" }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:grid" style={{ gridTemplateColumns: "minmax(330px, 420px) 1fr", gap: 16, padding: "14px 16px 0", alignItems: "start" }}>
          {/* Liste */}
          <div className={mobilDetay ? "hidden lg:block" : "block"}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid var(--line)", display: "grid", gap: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><b style={{ fontSize: 14 }}>Son raporlar</b><span className="num" style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700 }}>{liste.length} / {raporlar.length}</span></div>
                <div style={{ position: "relative" }}>
                  <Ikon ad="ara" boy={16} style={{ position: "absolute", left: 12, top: 14, color: "var(--faint)" }} />
                  <input className="field" style={{ paddingLeft: 36 }} placeholder="Müşteri, telefon, rapor no, seri no" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Raporlarda ara" />
                </div>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                  <button className={`chip ${filtre === "" ? "on" : ""}`} style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => setFiltre("")}>Tümü</button>
                  {sablonlar.map((s) => (
                    <button key={s.id} className={`chip ${filtre === s.id ? "on" : ""}`} style={{ padding: "5px 10px", fontSize: 12.5, whiteSpace: "nowrap" }} onClick={() => setFiltre(s.id)}>{s.ad}</button>
                  ))}
                </div>
              </div>
              {liste.length === 0 && (
                <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>
                  {raporlar.length ? "Aramaya uyan rapor yok." : "Henüz rapor yok. İlk servis formunu oluştur."}
                  <div><button className="btn" style={{ marginTop: 14 }} onClick={() => yeniForm()}><Ikon ad="arti" boy={15} kalinlik={2.6} />Yeni servis formu</button></div>
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
                            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".01em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.no} · {x.musteri.ad.toLocaleUpperCase("tr-TR")}</span>
                            <span className="num" style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 700, whiteSpace: "nowrap" }}>{tarihTR(x.tarih)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 3, fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
                            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.hizmet}{x.cihaz.marka ? ` · ${x.cihaz.marka}` : ""}</span>
                            <span className="num" style={{ fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap" }}>{x.odeme === "garanti" ? "Garanti" : tl(h.toplam)}</span>
                          </div>
                          <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <OdemePill o={x.odeme} />
                            {x.imza ? <span className="pill mute">İmzalı</span> : <span className="pill bad">İmzasız</span>}
                            {x.fotolar.length > 0 && <span className="pill mute">{x.fotolar.length} foto</span>}
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
                  <button className="chip" onClick={() => setMobilDetay(false)}><Ikon ad="sol" boy={15} />Raporlar</button>
                </div>
                <div className="card" style={{ padding: 14, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, display: "flex", gap: 11, alignItems: "center" }}>
                      <span className="doc-ico" style={{ width: 40, height: 40, borderRadius: 11, background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="belge" boy={19} /></span>
                      <div style={{ minWidth: 0 }}>
                        <div className="num" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>{r.no} · {tarihTR(r.tarih)} {r.saat}</div>
                        <div className="font-display" style={{ fontWeight: 600, fontSize: 19, letterSpacing: "-0.01em", marginTop: 1 }}>{r.musteri.ad}</div>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                      <button className="btn btn-dark" style={{ padding: "11px 12px" }} onClick={() => pdf(r)}><Ikon ad="indir" boy={15} />PDF olarak kaydet</button>
                      <button className="btn btn-wa" style={{ padding: "11px 12px" }} onClick={() => wa(r)}><Ikon ad="mesaj" boy={15} />WhatsApp&apos;la gönder</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                    <button className="chip" onClick={() => duzenleAc(r)}><Ikon ad="kalem" boy={14} />Düzenle</button>
                    <button className="chip" onClick={() => yeniMusteriden(r)}><Ikon ad="arti" boy={14} />Bu müşteriye yeni form</button>
                    <button className="chip" onClick={() => { setMusteriSec(waNumara(r.musteri.telefon) || r.musteri.ad.toLocaleLowerCase("tr-TR")); setGor("musteriler"); }}><Ikon ad="saat" boy={14} />Müşteri geçmişi</button>
                    <button className="chip" style={{ color: "var(--bad)" }} onClick={() => sil(r)}>Sil</button>
                  </div>
                </div>
                <div style={{ background: "var(--tile)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
                  <Olcekli><RaporSayfa r={r} f={firma} /></Olcekli>
                </div>
              </div>
            ) : (
              <div className="card hidden lg:block" style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>Bir rapor seç ya da yeni form oluştur.</div>
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
    const eksik = eksikler(t);
    const oneriler = t.musteri.ad.trim().length >= 2 && adim === 0
      ? mList.filter((m) => m.ad.toLocaleLowerCase("tr-TR").includes(t.musteri.ad.toLocaleLowerCase("tr-TR").trim()) && m.ad !== t.musteri.ad).slice(0, 4)
      : [];
    const kayitliMusteri = mList.find((m) => waNumara(m.telefon) === waNumara(t.musteri.telefon) && waNumara(t.musteri.telefon).length >= 11);

    return (
      <div className="lg:grid" style={{ gridTemplateColumns: "minmax(0, 640px) minmax(0, 1fr)", gap: 22, padding: "16px 16px 0", alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>{duzenle ? "Raporu düzenle" : "Yeni servis formu"}</h1>
              <div className="num" style={{ fontSize: 12.5, marginTop: 2, color: "var(--muted)", fontWeight: 700 }}>{t.no} · {tarihTR(t.tarih)} {t.saat}</div>
            </div>
            <button className="chip" onClick={() => { if (confirm("Form kapatılsın mı? Kaydedilmeyen bilgiler silinir.")) { setTaslak(null); git("raporlar"); } }}>Vazgeç</button>
          </div>

          {/* Adım göstergesi: numaralı step track (6 adım) */}
          <div style={{ display: "flex", marginTop: 14, border: "1px solid var(--line)", borderRadius: 7, overflow: "hidden", background: "var(--paper)" }}>
            {ADIMLAR.map((a, i) => (
              <button key={a} onClick={() => setAdim(i)} aria-label={`${i + 1}. adım: ${a}`} style={{ flex: 1, minWidth: 0, background: i === adim ? "var(--accent-soft)" : "transparent", border: "none", borderRight: i < ADIMLAR.length - 1 ? "1px solid var(--line)" : "none", padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span className="num" style={{ width: 20, height: 20, borderRadius: 5, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, background: i < adim ? "var(--accent)" : i === adim ? "var(--accent-ink)" : "var(--tile)", color: i <= adim ? "#fff" : "var(--faint)" }}>{i < adim ? <Ikon ad="tik" boy={11} kalinlik={3} /> : i + 1}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: i === adim ? "var(--accent-ink)" : "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{a}</span>
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 16, marginTop: 14 }}>
            <div className="mini" style={{ color: "var(--accent)" }}>Adım {adim + 1} / {ADIMLAR.length}</div>
            <h2 className="font-display" style={{ fontWeight: 600, fontSize: 20, letterSpacing: "-0.01em", margin: "2px 0 16px" }}> {["Müşteri bilgisi", "Cihaz ve şikayet", "Yapılan işlemler", "Parça, işçilik, KDV", "Önce / sonra fotoğrafları", "Müşteri imzası"][adim]}</h2>

            {adim === 0 && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <label className="lbl" htmlFor="mad">Ad soyad / firma</label>
                  <input id="mad" className="field" autoComplete="off" placeholder="Örn. Ayşe Kaplan" value={t.musteri.ad} onChange={(e) => set({ musteri: { ...t.musteri, ad: e.target.value } })} />
                  {oneriler.length > 0 && (
                    <div className="card" style={{ marginTop: 6, overflow: "hidden" }}>
                      <div className="font-mono" style={{ fontSize: 10.5, padding: "8px 12px 4px", color: "var(--muted)", letterSpacing: ".08em" }}>KAYITLI MÜŞTERİ</div>
                      {oneriler.map((m) => (
                        <button key={m.anahtar} className="row-btn" style={{ padding: "10px 12px" }} onClick={() => set({ musteri: { ad: m.ad, telefon: m.telefon, adres: m.adres } })}>
                          <b>{m.ad}</b> <span style={{ color: "var(--muted)", fontSize: 13 }}>· {telefonGoster(m.telefon)}  |  {m.sayi} rapor</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="lbl" htmlFor="mtel">Telefon (WhatsApp)</label>
                  <input id="mtel" className="field" type="tel" inputMode="tel" placeholder="05xx xxx xx xx" value={t.musteri.telefon} onChange={(e) => set({ musteri: { ...t.musteri, telefon: e.target.value } })} />
                  {kayitliMusteri && !duzenle && <div style={{ fontSize: 13, marginTop: 6, color: "var(--accent-ink)", fontWeight: 700 }}>Kayıtlı müşteri: {kayitliMusteri.sayi} önceki servis, son {tarihTR(kayitliMusteri.son)}</div>}
                </div>
                <div>
                  <label className="lbl" htmlFor="madr">Adres</label>
                  <textarea id="madr" className="field" style={{ minHeight: 64 }} placeholder="Mahalle, sokak, no, ilçe / il" value={t.musteri.adres} onChange={(e) => set({ musteri: { ...t.musteri, adres: e.target.value } })} />
                </div>
              </div>
            )}

            {adim === 1 && (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div className="lbl">Hizmet türü (kontrol listesini otomatik doldurur)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sablonlar.map((s) => (
                      <button key={s.id} className={`chip ${t.sablonId === s.id ? "on" : ""}`} onClick={() => setTaslak(sablonUygula({ ...t, cihaz: { ...t.cihaz, tur: t.sablonId === s.id ? t.cihaz.tur : "" } }, s))}>{s.ad}</button>
                    ))}
                  </div>
                </div>
                {kayitliMusteri && kayitliMusteri.cihazlar.length > 0 && (
                  <div>
                    <div className="lbl">Bu müşterinin kayıtlı cihazları</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {kayitliMusteri.cihazlar.map((c, i) => (
                        <button key={i} className="chip" onClick={() => set({ cihaz: { ...c } })}>{[c.tur, c.marka, c.model].filter(Boolean).join(" ")}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="lbl" htmlFor="ctur">Cihaz türü</label><input id="ctur" className="field" value={t.cihaz.tur} onChange={(e) => set({ cihaz: { ...t.cihaz, tur: e.target.value } })} /></div>
                  <div><label className="lbl" htmlFor="cmar">Marka</label><input id="cmar" className="field" value={t.cihaz.marka} onChange={(e) => set({ cihaz: { ...t.cihaz, marka: e.target.value } })} /></div>
                  <div><label className="lbl" htmlFor="cmod">Model</label><input id="cmod" className="field" value={t.cihaz.model} onChange={(e) => set({ cihaz: { ...t.cihaz, model: e.target.value } })} /></div>
                  <div><label className="lbl" htmlFor="cser">Seri no</label><input id="cser" className="field" value={t.cihaz.seriNo} onChange={(e) => set({ cihaz: { ...t.cihaz, seriNo: e.target.value } })} /></div>
                </div>
                <div>
                  <label className="lbl" htmlFor="sik">Şikayet / arıza</label>
                  <textarea id="sik" className="field" placeholder="Müşterinin anlattığı sorun" value={t.sikayet} onChange={(e) => set({ sikayet: e.target.value })} />
                </div>
              </div>
            )}

            {adim === 2 && IslemlerAdim()}

            {adim === 3 && (
              <div style={{ display: "grid", gap: 12 }}>
                <div className="lbl" style={{ marginBottom: 0 }}>Kullanılan parçalar</div>
                {t.parcalar.length === 0 && <div style={{ fontSize: 14, color: "var(--muted)" }}>Parça kullanılmadıysa boş bırak.</div>}
                {t.parcalar.map((p, i) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 46px", gap: 6, alignItems: "end", paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
                    <div style={{ gridColumn: "1 / -1" }}>{i === 0 && <span className="lbl">Parça</span>}<input className="field" aria-label="Parça adı" value={p.ad} placeholder="Parça adı" onChange={(e) => set({ parcalar: t.parcalar.map((x) => (x.id === p.id ? { ...x, ad: e.target.value } : x)) })} /></div>
                    <div><span className="lbl">Adet</span><input className="field" aria-label="Adet" type="number" inputMode="numeric" min={1} value={p.adet || ""} onChange={(e) => set({ parcalar: t.parcalar.map((x) => (x.id === p.id ? { ...x, adet: parseFloat(e.target.value) || 0 } : x)) })} /></div>
                    <div><span className="lbl">Birim fiyat (TL)</span><input className="field" aria-label="Birim fiyat" type="number" inputMode="decimal" min={0} value={p.fiyat || ""} onChange={(e) => set({ parcalar: t.parcalar.map((x) => (x.id === p.id ? { ...x, fiyat: parseFloat(e.target.value) || 0 } : x)) })} /></div>
                    <button aria-label="Parçayı sil" onClick={() => set({ parcalar: t.parcalar.filter((x) => x.id !== p.id) })} style={{ height: 46, border: "1.5px solid var(--line-2)", borderRadius: 8, background: "var(--paper)", cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                ))}
                <button className="chip" style={{ justifySelf: "start" }} onClick={() => set({ parcalar: [...t.parcalar, { id: uid(), ad: "", adet: 1, fiyat: 0 }] })}>+ Parça ekle</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="lbl" htmlFor="isc">İşçilik (TL, KDV hariç)</label><input id="isc" className="field" type="number" inputMode="decimal" min={0} value={t.iscilik || ""} onChange={(e) => set({ iscilik: parseFloat(e.target.value) || 0 })} /></div>
                  <div>
                    <div className="lbl">KDV oranı</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {KDV_ORANLARI.map((k) => <button key={k} className={`chip ${t.kdv === k ? "on" : ""}`} style={{ padding: "9px 11px" }} onClick={() => set({ kdv: k })}>%{k}</button>)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lbl">Ödeme</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(Object.keys(ODEME) as Odeme[]).map((o) => <button key={o} className={`chip ${t.odeme === o ? "on" : ""}`} onClick={() => set({ odeme: o })}>{ODEME[o]}</button>)}
                  </div>
                </div>
                <div style={{ background: "var(--ink)", color: "#fff", borderRadius: 14, padding: "14px 16px", fontVariantNumeric: "tabular-nums" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.7)" }}><span>Parça</span><span>{tl(h.parca)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.7)" }}><span>İşçilik</span><span>{tl(h.iscilik)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.7)" }}><span>KDV %{t.kdv}</span><span>{tl(h.kdv)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.14)", fontSize: 20, fontWeight: 800 }}><span>Toplam</span><span>{tl(h.toplam)}</span></div>
                  {t.odeme === "garanti" && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 4 }}>Garanti kapsamında: parçalar raporda listelenir, ücret yansıtılmaz.</div>}
                </div>
              </div>
            )}

            {adim === 4 && FotoAdim()}

            {adim === 5 && (
              <div style={{ display: "grid", gap: 12 }}>
                <ImzaPad deger={t.imza} onChange={(v) => setTaslak((p) => (p ? { ...p, imza: v } : p))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="lbl" htmlFor="imz">İmzalayan</label><input id="imz" className="field" placeholder={t.musteri.ad || "Müşteri adı"} value={t.imzalayan} onChange={(e) => set({ imzalayan: e.target.value })} /></div>
                  <div><label className="lbl" htmlFor="tek">Teknisyen</label><input id="tek" className="field" value={t.teknisyen} onChange={(e) => set({ teknisyen: e.target.value })} /></div>
                </div>
                {eksik.length > 0 ? (
                  <div style={{ fontSize: 14, color: "var(--bad)", fontWeight: 700 }}>Tamamlamak için eksik: {eksik.join(", ")}</div>
                ) : (
                  <div style={{ fontSize: 14, color: "var(--ok)", fontWeight: 700 }}>Her şey hazır. Toplam {t.odeme === "garanti" ? "garanti kapsamında" : tl(h.toplam)}.</div>
                )}
              </div>
            )}
          </div>

          {/* Alt gezinme */}
          <div style={{ position: "sticky", bottom: 0, zIndex: 10, background: "var(--bg)", borderTop: "1px solid var(--line)", marginTop: 14, padding: "12px 0 calc(12px + env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
            <button className="btn btn-ghost" disabled={adim === 0} onClick={() => { setAdim(adim - 1); window.scrollTo(0, 0); }}>Geri</button>
            {adim < ADIMLAR.length - 1 ? (
              <button className="btn" onClick={() => { setAdim(adim + 1); window.scrollTo(0, 0); }}>İleri: {ADIMLAR[adim + 1]}<Ikon ad="ok" boy={15} /></button>
            ) : (
              <button className="btn btn-dark" onClick={tamamla}><Ikon ad="tik" boy={15} kalinlik={2.6} />{duzenle ? "Raporu güncelle" : "Raporu oluştur"}</button>
            )}
          </div>
        </div>

        {/* Canlı önizleme (masaüstü) */}
        <div className="hidden lg:block" style={{ position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span className="mini">Canlı rapor önizleme</span><span className="pill acc">A4</span></div>
          <div style={{ background: "var(--tile)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}><Olcekli max={0.82}><RaporSayfa r={t} f={firma} /></Olcekli></div>
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
            Hizmet türü seçmedin. Bir önceki adımda şablon seçersen kontrol listesi otomatik gelir, ya da aşağıdan kendi maddeni ekle.
          </div>
        )}
        {t.maddeler.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)" }}>
            <span>{t.maddeler.filter((m) => m.ok).length}/{t.maddeler.length} işlem yapıldı  |  uygulanmayanın üstüne dokun</span>
          </div>
        )}
        {t.maddeler.map((m, i) => (
          <button key={i} aria-pressed={m.ok} className={`check ${m.ok ? "on" : ""}`} onClick={() => set({ maddeler: t.maddeler.map((x, j) => (j === i ? { ...x, ok: !x.ok } : x)) })}>
            <span className="txt">{m.ad}</span><span className="sw" aria-hidden="true" />
          </button>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
          <input className="field" placeholder="Ek işlem yaz" aria-label="Ek işlem" value={yeni} onChange={(e) => setYeni(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && yeni.trim()) { set({ maddeler: [...t.maddeler, { ad: yeni.trim(), ok: true }] }); setYeni(""); } }} />
          <button className="btn btn-ghost" onClick={() => { if (yeni.trim()) { set({ maddeler: [...t.maddeler, { ad: yeni.trim(), ok: true }] }); setYeni(""); } }}>Ekle</button>
        </div>
        <div>
          <label className="lbl" htmlFor="tes">Tespit ve yapılan iş</label>
          <textarea id="tes" className="field" placeholder="Arızanın nedeni ve çözüm" value={t.tespit} onChange={(e) => set({ tespit: e.target.value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label className="lbl" htmlFor="sb">Sonraki bakım</label><input id="sb" className="field" type="date" value={t.sonrakiBakim} onChange={(e) => set({ sonrakiBakim: e.target.value })} /></div>
          <div><label className="lbl" htmlFor="nt">Not (isteğe bağlı)</label><input id="nt" className="field" value={t.not} onChange={(e) => set({ not: e.target.value })} /></div>
        </div>
      </div>
    );
  }

  function FotoAdim() {
    const t = taslak!;
    const ekle = async (tur: "once" | "sonra", dosyalar: FileList | null) => {
      if (!dosyalar || !dosyalar.length) return;
      const yer = MAX_FOTO - t.fotolar.length;
      if (yer <= 0) { flash(`En fazla ${MAX_FOTO} fotoğraf eklenir`); return; }
      setIsleniyor(true);
      const yeni: Rapor["fotolar"] = [];
      for (const f of Array.from(dosyalar).slice(0, yer)) {
        try { yeni.push({ id: uid(), tur, src: await kucult(f, 1000, 0.7) }); } catch { flash("Bir fotoğraf açılamadı"); }
      }
      setIsleniyor(false);
      setTaslak((p) => (p ? { ...p, fotolar: [...p.fotolar, ...yeni] } : p));
    };
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Fotoğraflar telefonda küçültülür (en uzun kenar 1000 px), rapora ve arşive eklenir. En fazla {MAX_FOTO} fotoğraf.</div>
        {(["once", "sonra"] as const).map((tur) => {
          const l = t.fotolar.filter((x) => x.tur === tur);
          return (
            <div key={tur}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="lbl" style={{ margin: 0, fontSize: 14 }}>{tur === "once" ? "Önce" : "Sonra"} ({l.length})</span>
                <label className="chip" style={{ cursor: "pointer" }}>
                  + Fotoğraf çek / seç
                  <input type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => { ekle(tur, e.target.files); e.target.value = ""; }} />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {l.map((x) => (
                  <div key={x.id} style={{ position: "relative" }}>
                    <img src={x.src} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
                    <button aria-label="Fotoğrafı sil" onClick={() => setTaslak((p) => (p ? { ...p, fotolar: p.fotolar.filter((f) => f.id !== x.id) } : p))} style={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, borderRadius: 14, border: "none", background: "rgba(22,25,29,.8)", color: "#fff", cursor: "pointer" }}>×</button>
                  </div>
                ))}
                {l.length === 0 && <div style={{ gridColumn: "1 / -1", border: "1.5px dashed var(--line-2)", borderRadius: 8, padding: 18, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>Henüz fotoğraf yok</div>}
              </div>
            </div>
          );
        })}
        {isleniyor && <div style={{ fontSize: 14, fontWeight: 700 }}>Fotoğraf küçültülüyor...</div>}
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
          <button className="chip" onClick={() => setMusteriSec("")}>← Müşteriler</button>
          <div className="card" style={{ padding: 18, marginTop: 12 }}>
            <div className="tag">Müşteri kartı</div>
            <h1 className="font-display" style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.01em", margin: "6px 0 4px" }}>{m.ad}</h1>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{telefonGoster(m.telefon)}  |  {m.adres}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
              {[["Servis", String(m.sayi)], ["Toplam", tl(m.toplam)], ["Bekleyen", tl(m.bekleyen)]].map(([k, v]) => (
                <div key={k} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                  <div className="font-mono" style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
                  <div className="font-display" style={{ fontWeight: 800, fontSize: 17, marginTop: 2, whiteSpace: "nowrap" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <button className="btn" onClick={() => yeniMusteriden(m)}>+ Bu müşteriye yeni form</button>
              <a className="btn btn-ghost" href={`tel:${m.telefon.replace(/\s/g, "")}`}>Ara</a>
              <a className="btn btn-wa" href={`https://wa.me/${waNumara(m.telefon)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            {m.cihazlar.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="lbl">Kayıtlı cihazlar</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{m.cihazlar.map((c, i) => <span key={i} className="pill mute" style={{ fontSize: 13, padding: "5px 10px" }}>{[c.tur, c.marka, c.model].filter(Boolean).join(" ")}{c.seriNo ? `  |  SN ${c.seriNo}` : ""}</span>)}</div>
              </div>
            )}
          </div>
          <div className="tag" style={{ marginTop: 20 }}>Servis geçmişi</div>
          <div className="card" style={{ marginTop: 8, overflow: "hidden" }}>
            {g.map((r) => (
              <button key={r.id} className="row-btn" onClick={() => { setSecili(r.id); setGor("raporlar"); setMobilDetay(true); setMusteriSec(""); window.scrollTo(0, 0); }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>{r.hizmet}</b><span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.odeme === "garanti" ? "Garanti" : tl(hesapla(r).toplam)}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{tarihTR(r.tarih)}  |  {r.no}  |  {[r.cihaz.marka, r.cihaz.model].filter(Boolean).join(" ")}  |  {r.teknisyen}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }
    const l = mList.filter((x) => !mq.trim() || (x.ad + " " + x.telefon + " " + x.adres).toLocaleLowerCase("tr-TR").includes(mq.toLocaleLowerCase("tr-TR").trim()));
    return (
      <div style={{ padding: "20px 16px 0", maxWidth: 900 }}>
        <h1 className="font-display" style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>Müşteriler</h1>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, margin: "2px 0 14px" }}>{mList.length} müşteri · telefon numarasından birleşen servis geçmişi</div>
        <input className="field" placeholder="Ad, telefon ya da adres ara" aria-label="Müşteri ara" value={mq} onChange={(e) => setMq(e.target.value)} />
        <div className="card" style={{ marginTop: 10, overflow: "hidden" }}>
          {l.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Müşteri bulunamadı.</div>}
          {l.map((x) => (
            <button key={x.anahtar} className="row-btn" onClick={() => setMusteriSec(x.anahtar)}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <b style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.ad}</b>
                <span className="font-mono" style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{x.sayi} servis</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{telefonGoster(x.telefon)}  |  son {tarihTR(x.son)}</span>
                {x.bekleyen > 0 && <span className="pill warn">{tl(x.bekleyen)} bekliyor</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ================= AYARLAR =================
  function AyarlarGorunum() {
    const f = af;
    const setF = setAf;
    const alan = (k: keyof Firma, etiket: string, ph = "") => (
      <div>
        <label className="lbl" htmlFor={`f-${k}`}>{etiket}</label>
        <input id={`f-${k}`} className="field" placeholder={ph} value={String(f[k])} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      </div>
    );
    const yedekAl = () => {
      const blob = new Blob([JSON.stringify({ firma, raporlar, sablonlar: ozelSablon }, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `servis-formu-yedek-${bugun().tarih}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    const yedekYukle = async (fl: FileList | null) => {
      if (!fl?.[0]) return;
      try {
        const d = JSON.parse(await fl[0].text());
        if (!Array.isArray(d.raporlar)) throw new Error();
        if (d.firma) kaydetFirma(d.firma);
        kaydetRaporlar(d.raporlar);
        if (Array.isArray(d.sablonlar)) kaydetSablon(d.sablonlar);
        flash(`${d.raporlar.length} rapor yüklendi`);
      } catch { flash("Yedek dosyası okunamadı"); }
    };
    return (
      <div style={{ padding: "20px 16px 0", maxWidth: 900 }}>
        <h1 className="font-display" style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>Firma ve şablonlar</h1>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, margin: "2px 0 14px" }}>Rapor başlığı, kontrol listeleri ve yedek</div>

        <div className="card" style={{ padding: 16 }}>
          <h2 className="font-display" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 12px" }}>Rapor başlığı</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            {f.logo ? <img src={f.logo} alt="Logo" style={{ height: 52, maxWidth: 140, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 6, padding: 4 }} /> : <div style={{ width: 52, height: 52, borderRadius: 6, background: "var(--ink)", color: "var(--accent)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 24 }} className="font-display">{(f.ad.trim()[0] || "S").toLocaleUpperCase("tr-TR")}</div>}
            <label className="chip" style={{ cursor: "pointer" }}>
              {f.logo ? "Logoyu değiştir" : "Logo yükle"}
              <input type="file" accept="image/*" hidden onChange={async (e) => { const fl = e.target.files?.[0]; if (fl) { const src = await kucult(fl, 400, 0.9, "image/png"); setF({ ...f, logo: src }); } e.target.value = ""; }} />
            </label>
            {f.logo && <button className="chip" onClick={() => setF({ ...f, logo: "" })}>Kaldır</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {alan("ad", "Firma adı", "Örn. Akyol Isı ve Klima Teknik Servis")}
            {alan("telefon", "Telefon")}
            {alan("eposta", "E-posta")}
            {alan("adres", "Adres")}
            {alan("vergiDairesi", "Vergi dairesi")}
            {alan("vergiNo", "Vergi no")}
            {alan("teknisyen", "Varsayılan teknisyen")}
            {alan("onek", "Rapor no ön eki", "SR")}
            <div>
              <div className="lbl">Varsayılan KDV</div>
              <div style={{ display: "flex", gap: 5 }}>{KDV_ORANLARI.map((k) => <button key={k} className={`chip ${f.kdv === k ? "on" : ""}`} onClick={() => setF({ ...f, kdv: k })}>%{k}</button>)}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="lbl" htmlFor="f-alt">Rapor alt notu (garanti şartları)</label>
            <textarea id="f-alt" className="field" value={f.altNot} onChange={(e) => setF({ ...f, altNot: e.target.value })} />
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => { kaydetFirma({ ...f, onek: (f.onek || "SR").toUpperCase().replace(/[^A-Z0-9]/g, "") || "SR" }); flash("Firma bilgileri kaydedildi"); }}>Kaydet</button>
        </div>

        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <h2 className="font-display" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>Kontrol listesi şablonları</h2>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>Hazır 5 şablon her zaman var. Kendi hizmetin için şablon ekle (asansör bakımı, kamera kurulumu, su arıtma...).</div>
          <div style={{ display: "grid", gap: 6 }}>
            {sablonlar.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
                <span><b>{s.ad}</b> <span style={{ color: "var(--muted)", fontSize: 13 }}>· {s.maddeler.length} madde{s.ozel ? "  |  senin şablonun" : ""}</span></span>
                {s.ozel && <button className="chip" style={{ color: "var(--bad)" }} onClick={() => kaydetSablon(ozelSablon.filter((x) => x.id !== s.id))}>Sil</button>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
            <div><label className="lbl" htmlFor="s-ad">Şablon adı</label><input id="s-ad" className="field" placeholder="Asansör periyodik bakım" value={sAd} onChange={(e) => setSAd(e.target.value)} /></div>
            <div><label className="lbl" htmlFor="s-tur">Cihaz türü</label><input id="s-tur" className="field" placeholder="Asansör" value={sTur} onChange={(e) => setSTur(e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="lbl" htmlFor="s-mad">Maddeler (her satıra bir işlem)</label>
            <textarea id="s-mad" className="field" style={{ minHeight: 110 }} placeholder={"Fren sistemi kontrol edildi\nKapı kilitleri test edildi\nHalatlar yağlandı"} value={sMad} onChange={(e) => setSMad(e.target.value)} />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => {
            const maddeler = sMad.split("\n").map((x) => x.trim()).filter(Boolean);
            if (!sAd.trim() || !maddeler.length) { flash("Şablon adı ve en az bir madde gerekli"); return; }
            kaydetSablon([...ozelSablon, { id: "ozel-" + uid(), ad: sAd.trim(), cihazTuru: sTur.trim(), maddeler, ozel: true }]);
            setSAd(""); setSTur(""); setSMad(""); flash("Şablon eklendi");
          }}>+ Şablonu ekle</button>
        </div>

        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <h2 className="font-display" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>Veri</h2>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>Kayıtlar yalnızca bu cihazın tarayıcısında durur (şu an {depoKB()} KB). Düzenli yedek al.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="chip" onClick={yedekAl}>Yedek indir (JSON)</button>
            <button className="chip" onClick={() => dosyaRef.current?.click()}>Yedek yükle</button>
            <input ref={dosyaRef} type="file" accept="application/json" hidden onChange={(e) => { yedekYukle(e.target.files); e.target.value = ""; }} />
            <button className="chip" onClick={() => { kaydetFirma(DEMO_FIRMA); kaydetRaporlar(DEMO_RAPORLAR); setF(DEMO_FIRMA); flash("Örnek kayıtlar yüklendi"); }}>Örnek kayıtları yükle</button>
            <button className="chip" style={{ color: "var(--bad)" }} onClick={() => { if (confirm("Tüm raporlar silinsin mi? Bu geri alınamaz.")) { kaydetRaporlar([]); setSecili(""); flash("Raporlar silindi"); } }}>Tüm raporları sil</button>
          </div>
        </div>
      </div>
    );
  }
}
