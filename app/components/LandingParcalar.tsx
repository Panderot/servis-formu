"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RaporSayfa from "./RaporSayfa";
import Olcekli from "./Olcekli";
import Ikon from "./Ikon";
import { DEMO_FIRMA, DEMO_RAPORLAR, tl } from "../lib/servis";

// ---------- Süre hesaplayıcı (referanstaki "kaç saat" kaydırıcıları) ----------
const YENI_DK = 2; // Fixnote ile rapor başına varsayılan süre (dakika): açıkça yazılı varsayım

type Sureler = { bugun: number; yeni: number; kazanc: number; gun: number };

// Shown numbers glide to new values (350 ms) instead of jumping. Off when "akici" is false
// (the auto demo drives the sliders every frame) or when the user prefers reduced motion.
function useAkis(hedef: Sureler, akici: boolean): Sureler {
  const [goster, setGoster] = useState(hedef);
  const simdi = useRef(hedef);
  const anahtar = `${hedef.bugun}|${hedef.yeni}|${hedef.kazanc}|${hedef.gun}`;
  useEffect(() => {
    if (!akici || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      simdi.current = hedef;
      setGoster(hedef);
      return;
    }
    const bas = simdi.current;
    const t0 = performance.now();
    let raf = 0;
    const adim = (t: number) => {
      const p = Math.min(1, (t - t0) / 350);
      const e = 1 - Math.pow(1 - p, 3);
      const v = {
        bugun: bas.bugun + (hedef.bugun - bas.bugun) * e,
        yeni: bas.yeni + (hedef.yeni - bas.yeni) * e,
        kazanc: bas.kazanc + (hedef.kazanc - bas.kazanc) * e,
        gun: bas.gun + (hedef.gun - bas.gun) * e,
      };
      simdi.current = v;
      setGoster(v);
      if (p < 1) raf = requestAnimationFrame(adim);
    };
    raf = requestAnimationFrame(adim);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anahtar, akici]);
  return goster;
}

export function SureHesap() {
  const [adet, setAdet] = useState(60);
  const [dk, setDk] = useState(15);
  // statik: final values, no demo (server render, reduced motion, or already visible on load)
  // bekliyor: off-screen, waiting; oynuyor: auto demo running; bitti: demo done or user took over
  const [durum, setDurum] = useState<"statik" | "bekliyor" | "oynuyor" | "bitti">("statik");
  const [vurgu, setVurgu] = useState(false);
  const kart = useRef<HTMLDivElement>(null);
  const demo = useRef(0);

  const bugun = (adet * dk) / 60;
  const yeni = (adet * YENI_DK) / 60;
  const kazanc = Math.max(0, bugun - yeni);
  const gun = Math.round((kazanc * 12) / 8);
  const sonKazanc = useRef(kazanc);
  const g = useAkis({ bugun, yeni, kazanc, gun }, durum === "statik" || durum === "bitti");
  const s = (n: number) => (n >= 10 ? Math.round(n).toString() : n.toFixed(1).replace(".", ","));

  // Short highlight when the saved hours change noticeably (not while the demo is sliding).
  useEffect(() => {
    if (durum === "oynuyor" || durum === "bekliyor") return;
    if (Math.abs(kazanc - sonKazanc.current) < 0.5) return;
    sonKazanc.current = kazanc;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVurgu(true);
    const t = setTimeout(() => setVurgu(false), 260);
    return () => clearTimeout(t);
  }, [kazanc, durum]);

  // Auto demo: when the card first scrolls into view, the sliders move 10 -> 60 and 5 -> 15.
  useEffect(() => {
    const el = kart.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ilk = true;
    let kapandi = false;
    const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const kay = (bas: number, son: number, ms: number, adimBoy: number, yaz: (n: number) => void, kimlik: number) =>
      new Promise<boolean>((coz) => {
        const t0 = performance.now();
        const f = (t: number) => {
          if (kapandi || demo.current !== kimlik) return coz(false);
          const p = Math.min(1, (t - t0) / ms);
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          yaz(Math.round((bas + (son - bas) * e) / adimBoy) * adimBoy);
          if (p < 1) requestAnimationFrame(f);
          else coz(true);
        };
        requestAnimationFrame(f);
      });
    const oynat = async () => {
      const kimlik = ++demo.current;
      setDurum("oynuyor");
      await bekle(300);
      if (!(await kay(10, 60, 1100, 5, setAdet, kimlik))) return;
      await bekle(150);
      if (!(await kay(5, 15, 900, 1, setDk, kimlik))) return;
      if (kapandi || demo.current !== kimlik) return;
      setDurum("bitti");
      setVurgu(true);
      setTimeout(() => setVurgu(false), 260);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (ilk) {
          ilk = false;
          if (e.isIntersecting) io.disconnect();
          else {
            setAdet(10);
            setDk(5);
            setDurum("bekliyor");
          }
          return;
        }
        if (!e.isIntersecting) return;
        io.disconnect();
        oynat();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      kapandi = true;
      demo.current++;
      io.disconnect();
    };
  }, []);

  // The user touches a slider: the demo stops and the user is in control.
  const elle = () => {
    demo.current++;
    setDurum((d) => (d === "statik" ? d : "bitti"));
  };

  return (
    <div ref={kart} data-demo={durum} className="card" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
      <div style={{ padding: "22px 22px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label htmlFor="h-adet" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--muted)" }}>Ayda kaç servis raporu</label>
          <b className="num" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{adet}</b>
        </div>
        <input id="h-adet" className="range" type="range" min={10} max={200} step={5} value={adet} onPointerDown={elle} onKeyDown={elle} onChange={(e) => { elle(); setAdet(+e.target.value); }} style={{ marginTop: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 22 }}>
          <label htmlFor="h-dk" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--muted)" }}>Rapor başına bugün harcanan</label>
          <b className="num" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{dk} dk</b>
        </div>
        <input id="h-dk" className="range" type="range" min={5} max={45} step={1} value={dk} onPointerDown={elle} onKeyDown={elle} onChange={(e) => { elle(); setDk(+e.target.value); }} style={{ marginTop: 12 }} />
      </div>
      <div style={{ background: "var(--panel)", borderTop: "1px solid var(--line)", padding: "16px 22px 20px", marginTop: 18 }}>
        <div className="mini" style={{ color: "var(--muted)" }}>Raporlara giden süre, ayda</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginTop: 10 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div className="mini">Bugün</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>{s(g.bugun)} sa</div>
          </div>
          <Ikon ad="ok" boy={16} className={vurgu ? "zh-ok nd" : "zh-ok"} style={{ color: "var(--faint)" }} />
          <div className={vurgu ? "zh-fx pop" : "zh-fx"} style={{ background: "var(--accent)", color: "#fff", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.75)" }}>Fixnote ile</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>{s(g.yeni)} sa</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14, fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
          <span>Ayda <b className={vurgu ? "zh-kazanc pop" : "zh-kazanc"} style={{ color: vurgu ? undefined : "var(--ink)" }}>{s(g.kazanc)} saat</b> geri kazanırsın</span>
          <span className="pill mute" style={{ fontSize: 11.5 }}>yılda ≈ {Math.round(g.gun)} iş günü</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>Hesap: Fixnote ile rapor başına {YENI_DK} dk varsayılır. Kendi rakamınla dene.</div>
      </div>
    </div>
  );
}

// ---------- Örnek rapor seçici (referanstaki "6 görünüm" listesi) ----------
const ORNEKLER = [
  { no: "SR-2026-0048", ad: "Kombi bakımı", d: "Parça değişimi, KDV'li toplam, sonraki bakım tarihi." },
  { no: "SR-2026-0047", ad: "Klima bakımı", d: "Önce / sonra fotoğraflı, havale ile ödendi." },
  { no: "SR-2026-0046", ad: "Beyaz eşya tamiri", d: "Uygulanmayan madde üstü çizili, ödeme bekliyor." },
  { no: "SR-2026-0045", ad: "Elektrik arızası", d: "Parça tablosu metre ve adetle." },
  { no: "SR-2026-0044", ad: "İlaçlama", d: "Site yönetimine, kontrol tarihiyle." },
  { no: "SR-2026-0042", ad: "Garanti işi", d: "Parçalar listelenir, ücret yansıtılmaz." },
];

export function OrnekRapor() {
  const [i, setI] = useState(0);
  const r = DEMO_RAPORLAR.find((x) => x.no === ORNEKLER[i].no)!;
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, margin: "0 0 10px 4px" }}>Bir iş seç, raporunu gör.</div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {ORNEKLER.map((o, j) => {
            const on = i === j;
            return (
              <button key={o.no} onClick={() => setI(j)} aria-pressed={on} style={{ textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "11px 13px", border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`, background: on ? "var(--ink)" : "#fff", color: on ? "#fff" : "var(--ink)", display: "flex", gap: 10, alignItems: "flex-start", boxShadow: on ? "var(--shadow-md)" : "none" }}>
                <span className="num" style={{ flex: "none", width: 20, height: 20, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, background: on ? "rgba(255,255,255,.14)" : "var(--tile)", color: on ? "#fff" : "var(--muted)", marginTop: 1 }}>{j + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 14 }}>{o.ad}</span>
                  <span className="hidden sm:block" style={{ fontSize: 12, marginTop: 2, color: on ? "rgba(255,255,255,.7)" : "var(--muted)", lineHeight: 1.4 }}>{o.d}</span>
                </span>
                {on && <Ikon ad="sag" boy={16} style={{ marginLeft: "auto", marginTop: 2 }} />}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ minWidth: 0, background: "var(--tile)", borderRadius: 20, padding: "16px 16px 0", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 700 }}><span className="mini" style={{ color: "var(--accent)", marginRight: 6 }}>Örnek</span>{r.no} · {r.musteri.ad}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <span className="pill" style={{ background: "#fff" }}>A4</span>
            <span className="pill" style={{ background: "#fff" }}>PDF</span>
            <span className="pill ok">İmzalı</span>
          </span>
        </div>
        <div style={{ maxHeight: 640, maxWidth: 635, margin: "0 auto", overflow: "hidden", borderRadius: "10px 10px 0 0", boxShadow: "var(--shadow-md)" }}>
          <Olcekli max={0.8}><RaporSayfa r={r} f={DEMO_FIRMA} /></Olcekli>
        </div>
      </div>
    </div>
  );
}

// ---------- Dönen iş adı (referanstaki "métier" bandı) ----------
const ISLER = ["Kombi bakımı", "Klima servisi", "Beyaz eşya tamiri", "İlaçlama", "Elektrik arızası", "Asansör bakımı", "Su arıtma servisi"];
export function IsDongu() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % ISLER.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span key={i} className="sf-dongu" style={{ display: "inline-block" }}>
      {ISLER[i]}
      <style>{`.sf-dongu{animation:sfgir .45s ease both}@keyframes sfgir{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion: reduce){.sf-dongu{animation:none}}`}</style>
    </span>
  );
}

// ---------- Fiyat (teknisyen sayacı + aylık/yıllık) ----------
const FIYAT = 299;
export function Fiyat() {
  const [yillik, setYillik] = useState(false);
  const [n, setN] = useState(2);
  const aylik = yillik ? (FIYAT * 10) / 12 : FIYAT;
  const toplam = aylik * n;
  const DAHIL = [
    "Sınırsız servis raporu",
    "5 hazır kontrol listesi + kendi şablonların",
    "Firma logolu A4 rapor, tek tuşla PDF",
    "WhatsApp'a hazır rapor özeti",
    "Önce / sonra fotoğraf, parmakla imza",
    "Müşteri geçmişi, kayıtlı cihazlar, arşiv arama",
    "Bekleyen tahsilat ve sonraki bakım takibi",
    "JSON yedek indir / yükle",
  ];
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="card flex flex-wrap items-center gap-x-3 gap-y-2" style={{ borderRadius: 999, padding: "7px 7px 7px 18px", boxShadow: "none" }}>
          <b style={{ fontSize: 14 }}>Deneme</b>
          <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>14 gün · tüm özellikler · kart istemez</span>
          <Link href="/app?yeni=1" className="btn btn-dark" style={{ borderRadius: 999, padding: "9px 16px", fontSize: 13 }}>Denemeye başla</Link>
        </div>
        <div className="card flex items-center gap-1 self-start md:self-auto" style={{ borderRadius: 999, padding: 5, boxShadow: "none" }} role="group" aria-label="Ödeme dönemi">
          {[["Aylık", false], ["Yıllık", true]].map(([t, v]) => (
            <button key={String(t)} onClick={() => setYillik(v as boolean)} aria-pressed={yillik === v} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 16px", fontWeight: 700, fontSize: 13, background: yillik === v ? "var(--ink)" : "transparent", color: yillik === v ? "#fff" : "var(--muted)" }}>{t as string}</button>
          ))}
          <span className="pill ok" style={{ marginRight: 6 }}>2 ay hediye</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <div className="card" style={{ borderRadius: 20, padding: 26, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ fontSize: 17 }}>Teknisyen</b>
            <span className="pill acc">En çok seçilen</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
            <span className="num" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em" }}>{tl(aylik, false).replace(",00", "")} TL</span>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>/ ay, teknisyen başı</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600 }}>KDV hariç{yillik ? `, yıllık ${tl(FIYAT * 10)} peşin` : ""}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
            <span className="mini" style={{ color: "var(--muted)" }}>Teknisyen</span>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <button aria-label="Azalt" onClick={() => setN(Math.max(1, n - 1))} style={{ width: 36, height: 34, border: "none", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>−</button>
              <span className="num" style={{ width: 38, textAlign: "center", fontWeight: 800 }}>{n}</span>
              <button aria-label="Artır" onClick={() => setN(Math.min(50, n + 1))} style={{ width: 36, height: 34, border: "none", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>+</button>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", fontSize: 13.5, fontWeight: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>{n} teknisyen, aylık</span><span className="num">{tl(toplam)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span style={{ color: "var(--muted)" }}>KDV dahil (%20)</span><b className="num">{tl(toplam * 1.2)}</b></div>
          </div>
          <Link href="/app?yeni=1" className="btn" style={{ width: "100%", marginTop: 18, padding: "14px 20px" }}>İlk raporu oluştur</Link>
          <div style={{ fontSize: 12, color: "var(--faint)", textAlign: "center", marginTop: 10, fontWeight: 600 }}>Rapor başına ücret yok, sözleşme yok.</div>
        </div>

        <div className="card" style={{ borderRadius: 20, padding: 26 }}>
          <div className="mini" style={{ color: "var(--muted)" }}>Dahil olanlar</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 11 }}>
            {DAHIL.map((x) => (
              <li key={x} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, fontWeight: 600 }}>
                <Ikon ad="tik" boy={17} kalinlik={2.4} style={{ color: "var(--accent)", marginTop: 1 }} />{x}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)", display: "grid", gap: 9 }}>
            {["Merkezi bulut arşivi (kurulumda eklenir)", "E-fatura (bu bir iş teslim raporudur)"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "var(--faint)", fontWeight: 600 }}><Ikon ad="carpi" boy={16} style={{ marginTop: 1 }} />{x}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
