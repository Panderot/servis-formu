"use client";

// Hero product story. Client component so it can run a looping, viewport-gated
// animation while staying decorative (aria-hidden). The engine and demo data are
// never mutated: this is a visual mock only, no localStorage writes.

import { useEffect, useRef, useState } from "react";
import Ikon, { Isaret } from "./Ikon";
import {
  type Rapor, DEMO_FIRMA, DEMO_RAPORLAR, SABLONLAR, hesapla, tl, tarihTR, ozet, yeniNo,
} from "../lib/servis";

// ---------- mock data: all derived from the engine demo records (computed once) ----------
const DEMO_GUN = "2026-10-03";
const AY = DEMO_GUN.slice(0, 7);
const OZ = ozet(DEMO_RAPORLAR, AY);
const SIRALI = [...DEMO_RAPORLAR].sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
const GUNLER = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(2026, 8, 27 + i);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { g: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][d.getDay()], n: DEMO_RAPORLAR.filter((r) => r.tarih === iso).length };
});
const MAXG = Math.max(1, ...GUNLER.map((x) => x.n));
const ORNEK = DEMO_RAPORLAR.find((r) => r.no === "SR-2026-0048")!;
const BEKLEYEN_N = DEMO_RAPORLAR.filter((r) => r.odeme === "bekliyor").length;

// the incoming report: next number, its total, and the "+1 report today" bar height
const YENINO = yeniNo(DEMO_RAPORLAR, DEMO_FIRMA.onek, 2026); // beklenen: SR-2026-0049
const YENI_TOPLAM = hesapla(ORNEK).toplam;
const GUN_YENI = GUNLER[6].n + 1;
const MAXG2 = Math.max(MAXG, GUN_YENI);

const buyuk = (s: string) => s.toLocaleUpperCase("tr-TR");

function Durum({ r }: { r: Rapor }) {
  if (r.odeme === "bekliyor") return <span className="pill warn">Ödeme bekliyor</span>;
  if (r.odeme === "garanti") return <span className="pill info">Garanti</span>;
  return <span className="pill ok">Gönderildi</span>;
}

// ---------- timeline ----------
// step switch times (ms from cycle start), mirrored on data-adim for checks only
type Adim = "bos" | "liste" | "imza" | "pdf" | "gonderildi" | "panel";
const CYCLE = 9800;

function adimOf(t: number): Adim {
  if (t >= 5300) return "panel";
  if (t >= 4600) return "gonderildi";
  if (t >= 3800) return "pdf";
  if (t >= 2300) return "imza";
  if (t >= 600) return "liste";
  return "bos";
}
function rowsOf(t: number): number {
  return t >= 1740 ? 4 : t >= 1360 ? 3 : t >= 980 ? 2 : t >= 600 ? 1 : 0;
}

type Durum2 = { adim: Adim; rows: number; imzaOn: boolean; toast: boolean; ciro: number };
// pure derivation of every visual state from the elapsed time
function deriveState(t: number): Durum2 {
  let ciro = OZ.ciro;
  if (t >= 5300) {
    const p = Math.min(1, (t - 5300) / 900);
    ciro = OZ.ciro + YENI_TOPLAM * (1 - Math.pow(1 - p, 3)); // ease-out
  }
  return { adim: adimOf(t), rows: rowsOf(t), imzaOn: t >= 2300, toast: t >= 4600 && t < 5900, ciro };
}

// representative time for a step, used by the #maket=<adim> check pin
const PIN_T: Record<Adim, number> = { bos: 0, liste: 1000, imza: 2600, pdf: 4000, gonderildi: 4900, panel: 6600 };

// knob switch styled like .check .sw
function Switch({ on }: { on: boolean }) {
  return (
    <span style={{ flex: "none", width: 38, height: 22, borderRadius: 999, background: on ? "var(--accent)" : "var(--line-2)", position: "relative", transition: "background .25s" }}>
      <span style={{ position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(16,39,58,.25)", transform: on ? "translateX(16px)" : "none", transition: "transform .25s" }} />
    </span>
  );
}

// ---------- desktop panel ----------
function PanelMaket({ adim, ciro }: { adim: Adim; ciro: number }) {
  const panelOn = adim === "panel";
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "20px 20px 0 0", boxShadow: "0 -2px 40px rgba(16,39,58,.07)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: "var(--line-2)" }} />)}
        <span style={{ margin: "0 auto", fontSize: 11, color: "var(--faint)", fontWeight: 600, paddingRight: 40 }}>Fixnote · panel</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", minHeight: 430 }}>
        <div style={{ borderRight: "1px solid var(--line)", padding: "16px 10px", background: "var(--panel)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13, padding: "0 6px 14px" }}><Isaret boy={18} />Fixnote</div>
          {[["belge", "Raporlar", true], ["kisiler", "Müşteriler", false], ["ayar", "Firma ve şablonlar", false]].map(([ik, t, on]) => (
            <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: on ? "var(--ink)" : "var(--muted)", background: on ? "var(--tile)" : "none" }}>
              <Ikon ad={ik as string} boy={14} style={{ color: on ? "var(--accent)" : "var(--faint)" }} />{t as string}
            </div>
          ))}
          <div className="mini" style={{ padding: "18px 8px 6px" }}>Şablonlar</div>
          {SABLONLAR.slice(0, 4).map((s) => <div key={s.id} style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "4px 8px", display: "flex", justifyContent: "space-between" }}>{s.ad}<span style={{ color: "var(--faint)" }}>{s.maddeler.length}</span></div>)}
        </div>
        <div style={{ padding: "18px 20px", paddingRight: 250, background: "#fff" }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em" }}>Günaydın Emre.</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{DEMO_FIRMA.ad} · 3 Ekim 2026</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mini">Bu ay rapor</span><span className="pill ok" style={{ fontSize: 9 }}>%{OZ.imzali} imzalı</span></div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 4 }}>
                <span className={"num hero-pop" + (panelOn ? " on" : "")} style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>{panelOn ? OZ.adet + 1 : OZ.adet}</span>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 34, flex: 1 }}>
                  {GUNLER.map((x, i) => {
                    const h = i === 6 ? (panelOn ? 4 + (GUN_YENI / MAXG2) * 22 : 4 + (x.n / MAXG) * 22) : 4 + (x.n / MAXG) * 22;
                    return (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ height: h, borderRadius: 3, background: i === 6 ? "var(--accent)" : x.n ? "#a9cfdb" : "var(--tile)", transition: "height .6s ease" }} />
                        <div style={{ fontSize: 7.5, color: "var(--faint)", fontWeight: 700, marginTop: 2 }}>{x.g}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <span className="mini">Bu ay tutar</span>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6 }}>{tl(Math.round(ciro))}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>KDV dahil</div>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <span className="mini">Tahsil bekleyen</span>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6 }}>{tl(OZ.bekleyen)}</div>
              <span className="pill warn" style={{ fontSize: 9, marginTop: 3 }}>{BEKLEYEN_N} rapor</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="arti" boy={13} kalinlik={2.6} /></span>Yeni servis formu</div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "9px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}><Ikon ad="ara" boy={14} />Müşteri, telefon, seri no ara</div>
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, marginTop: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", fontSize: 12, fontWeight: 800 }}>Son raporlar<span style={{ fontSize: 10.5, color: "var(--faint)" }}>Tümü</span></div>
            {/* incoming report row: expands and flashes when the story reaches the panel */}
            <div className={"hero-newrow" + (panelOn ? " on" : "")}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderTop: "1px solid var(--line)" }}>
                <span className="doc-ico" style={{ width: 26, height: 26, borderRadius: 7 }}><Ikon ad="belge" boy={13} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{YENINO} · {buyuk(ORNEK.musteri.ad)}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}><span className="pill ok">Gönderildi</span><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>Kombi bakımı · {ORNEK.cihaz.marka}</span></div>
                </div>
                <span className="num" style={{ fontSize: 10, color: "var(--faint)", fontWeight: 700 }}>03.10</span>
                <Ikon ad="sag" boy={12} style={{ color: "var(--faint)" }} />
              </div>
            </div>
            {SIRALI.slice(0, 4).map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderTop: "1px solid var(--line)" }}>
                <span className="doc-ico" style={{ width: 26, height: 26, borderRadius: 7 }}><Ikon ad="belge" boy={13} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.no} · {buyuk(r.musteri.ad)}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}><Durum r={r} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{r.hizmet} · {r.cihaz.marka || r.cihaz.model}</span></div>
                </div>
                <span className="num" style={{ fontSize: 10, color: "var(--faint)", fontWeight: 700 }}>{tarihTR(r.tarih).slice(0, 5)}</span>
                <Ikon ad="sag" boy={12} style={{ color: "var(--faint)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- phone: a service form being filled in ----------
function TelefonMaket({ kucuk = false, adim, rows, imzaOn, toast }: { kucuk?: boolean; adim: Adim; rows: number; imzaOn: boolean; toast: boolean }) {
  const gonderildi = adim === "gonderildi" || adim === "panel";
  const butonText = adim === "pdf" ? "PDF hazır" : gonderildi ? "WhatsApp'la gönderildi" : "İmza bekleniyor";
  const butonBg = adim === "pdf" ? "var(--accent)" : gonderildi ? "#16794c" : "var(--tile)";
  const butonFg = adim === "pdf" || gonderildi ? "#fff" : "var(--muted)";
  return (
    <div style={{ width: kucuk ? 280 : 292, background: "#fff", borderRadius: 46, padding: 6, border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ position: "relative", borderRadius: 40, background: "var(--panel)", boxShadow: "inset 0 0 0 1px var(--line)", padding: "14px 14px 18px", overflow: "hidden" }}>
        {/* toast slides down from the top of the phone screen */}
        <div style={{ position: "absolute", left: 12, right: 12, top: 12, zIndex: 5, background: "var(--ink)", color: "#fff", borderRadius: 10, padding: "9px 11px", fontSize: 11, fontWeight: 700, display: "flex", gap: 8, alignItems: "center", boxShadow: "0 12px 26px rgba(16,39,58,.32)", transform: toast ? "translateY(0)" : "translateY(calc(-100% - 22px))", opacity: toast ? 1 : 0, transition: "transform .4s cubic-bezier(.2,.7,.2,1), opacity .4s" }}>
          <Ikon ad="mesaj" boy={14} />Rapor Ayşe Hanım&apos;a gitti
        </div>
        <div style={{ width: 70, height: 6, borderRadius: 4, background: "var(--line)", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Isaret boy={22} />
          <span style={{ display: "flex", gap: 6 }}>
            {["takvim", "ayar"].map((x) => <span key={x} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", display: "grid", placeItems: "center", color: "var(--muted)" }}><Ikon ad={x} boy={13} /></span>)}
          </span>
        </div>
        <div className="mini" style={{ marginTop: 14 }}>{buyuk(ORNEK.hizmet)} · ADIM 3/6</div>
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 3 }}>{ORNEK.musteri.ad}</div>
        <div style={{ marginTop: 10 }}>
          {ORNEK.maddeler.slice(0, 4).map((m, i) => {
            const on = i < rows;
            return (
              <div key={m.ad} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: on ? "var(--ink)" : "var(--faint)", transition: "color .25s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.ad}</span>
                <Switch on={on} />
              </div>
            );
          })}
        </div>
        <div style={{ background: "#fff", border: "1px dashed var(--line-2)", borderRadius: 10, height: 54, marginTop: 8, display: "grid", placeItems: "center", overflow: "hidden" }}>
          <svg className={"hero-sign" + (imzaOn ? " on" : "")} width="160" height="42" viewBox="0 0 160 42" fill="none" aria-hidden="true">
            <path d="M8 30 C20 8 28 34 42 22 C56 10 66 32 82 20 C98 8 108 32 124 18 C136 9 146 22 154 15" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ marginTop: 10, borderRadius: 10, padding: "11px 12px", textAlign: "center", fontSize: 12.5, fontWeight: 800, background: butonBg, color: butonFg, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "background .3s, color .3s" }}>
          {gonderildi && <Ikon ad="mesaj" boy={14} />}{butonText}
        </div>
      </div>
    </div>
  );
}

export default function HeroMaket() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [adim, setAdim] = useState<Adim>("bos");
  const [rows, setRows] = useState(0);
  const [imzaOn, setImzaOn] = useState(false);
  const [toast, setToast] = useState(false);
  const [ciro, setCiro] = useState(OZ.ciro);

  useEffect(() => {
    const show = (s: Durum2) => { setAdim(s.adim); setRows(s.rows); setImzaOn(s.imzaOn); setToast(s.toast); setCiro(s.ciro); };

    // check pin: ?maket=<adim> or #maket=<adim> renders one fixed step with no loop (for screenshots)
    const pin = (window.location.search + window.location.hash).match(/maket=(bos|liste|imza|pdf|gonderildi|panel)/)?.[1] as Adim | undefined;
    if (pin) { show(deriveState(PIN_T[pin])); return; }

    // reduced motion: show the final state (data-adim="panel") with no loop, no count-up
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show({ adim: "panel", rows: 4, imzaOn: true, toast: false, ciro: OZ.ciro + YENI_TOPLAM });
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let last: number | null = null;
    let elapsed = 0;
    let visible = document.visibilityState === "visible";
    let onscreen = false;

    // derive every visual state from the elapsed time; identical values are a no-op in React
    const apply = (t: number) => show(deriveState(t));

    const frame = (now: number) => {
      if (last == null) last = now;
      elapsed += now - last;
      last = now;
      if (elapsed >= CYCLE) elapsed = 0; // loop back to the initial state
      apply(elapsed);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !visible || !onscreen) return;
      last = null;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      last = null;
    };

    const io = new IntersectionObserver((es) => {
      onscreen = es[0].isIntersecting;
      if (onscreen) start(); else stop();
    }, { threshold: 0.15 });
    io.observe(root);

    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible) start(); else stop();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" data-adim={adim} className="relative mx-auto mt-14 max-w-[1160px] px-4">
      <div className="hidden lg:block" style={{ marginRight: 40, height: 440, overflow: "hidden" }}><PanelMaket adim={adim} ciro={ciro} /></div>
      <div className="hidden lg:block suz" style={{ position: "absolute", right: 16, top: -28 }}><TelefonMaket adim={adim} rows={rows} imzaOn={imzaOn} toast={toast} /></div>
      <div className="flex justify-center lg:hidden" style={{ height: 520, overflow: "hidden" }}><TelefonMaket kucuk adim={adim} rows={rows} imzaOn={imzaOn} toast={toast} /></div>
    </div>
  );
}
