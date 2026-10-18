"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import RaporSayfa from "./RaporSayfa";
import Olcekli from "./Olcekli";
import Ikon from "./Ikon";
import { type Dil, demoFirma, demoRaporlar, sablonlarDil, gecmis, hesapla, musteriler, tarihTR, telefonGoster, para, raporPara, waMetin } from "../lib/servis";
import { useDil } from "../lib/dil";
import { raporEtiket } from "./RaporSayfa";
import { PAKET } from "../lib/paket";

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
  const dil = useDil();
  const en = dil === "en";
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
  const s = (n: number) => (n >= 10 ? Math.round(n).toString() : en ? n.toFixed(1) : n.toFixed(1).replace(".", ","));

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
          <label htmlFor="h-adet" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--muted)" }}>{en ? "Service reports per month" : "Ayda kaç servis raporu"}</label>
          <b className="num" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{adet}</b>
        </div>
        <input id="h-adet" className="range" type="range" min={10} max={200} step={5} value={adet} onPointerDown={elle} onKeyDown={elle} onChange={(e) => { elle(); setAdet(+e.target.value); }} style={{ marginTop: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 22 }}>
          <label htmlFor="h-dk" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--muted)" }}>{en ? "Time per report today" : "Rapor başına bugün harcanan"}</label>
          <b className="num" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{dk} {en ? "min" : "dk"}</b>
        </div>
        <input id="h-dk" className="range" type="range" min={5} max={45} step={1} value={dk} onPointerDown={elle} onKeyDown={elle} onChange={(e) => { elle(); setDk(+e.target.value); }} style={{ marginTop: 12 }} />
      </div>
      <div style={{ background: "var(--panel)", borderTop: "1px solid var(--line)", padding: "16px 22px 20px", marginTop: 18 }}>
        <div className="mini" style={{ color: "var(--muted)" }}>{en ? "Time spent on reports, per month" : "Raporlara giden süre, ayda"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginTop: 10 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div className="mini">{en ? "Today" : "Bugün"}</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>{s(g.bugun)} {en ? "h" : "sa"}</div>
          </div>
          <Ikon ad="ok" boy={16} className={vurgu ? "zh-ok nd" : "zh-ok"} style={{ color: "var(--faint)" }} />
          <div className={vurgu ? "zh-fx pop" : "zh-fx"} style={{ background: "var(--accent)", color: "#fff", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.75)" }}>{en ? "With Fixnote" : "Fixnote ile"}</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>{s(g.yeni)} {en ? "h" : "sa"}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14, fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
          {en ? (
            <span>You get <b className={vurgu ? "zh-kazanc pop" : "zh-kazanc"} style={{ color: vurgu ? undefined : "var(--ink)" }}>{s(g.kazanc)} hours</b> back every month</span>
          ) : (
            <span>Ayda <b className={vurgu ? "zh-kazanc pop" : "zh-kazanc"} style={{ color: vurgu ? undefined : "var(--ink)" }}>{s(g.kazanc)} saat</b> geri kazanırsın</span>
          )}
          <span className="pill mute" style={{ fontSize: 11.5 }}>{en ? `≈ ${Math.round(g.gun)} working days a year` : `yılda ≈ ${Math.round(g.gun)} iş günü`}</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>{en ? `Assumes ${YENI_DK} min per report with Fixnote. Try your own numbers.` : `Hesap: Fixnote ile rapor başına ${YENI_DK} dk varsayılır. Kendi rakamınla dene.`}</div>
      </div>
    </div>
  );
}

// ---------- Örnek rapor seçici: seçilen işin öne çıkan kısmına kayan A4 sayfa ----------
// "hedef" is the exact <h4> text of the block in RaporSayfa that the description talks about
// (taken from the report's own labels, so both languages stay in step).
type Ornek = { no: string; ad: string; d: string; hedef: string; etiket: string };
const ORNEKLER: Record<Dil, Ornek[]> = (() => {
  const t = raporEtiket("tr");
  const e = raporEtiket("en");
  return {
    tr: [
      { no: "SR-2026-0048", ad: "Kombi bakımı", d: "Parça değişimi, KDV'li toplam, sonraki bakım tarihi.", hedef: t.parcaIscilik, etiket: "Parça, KDV ve sonraki bakım" },
      { no: "SR-2026-0047", ad: "Klima bakımı", d: "Önce / sonra fotoğraflı, havale ile ödendi.", hedef: t.fotolar, etiket: "Önce / sonra fotoğraflar" },
      { no: "SR-2026-0046", ad: "Beyaz eşya tamiri", d: "Uygulanmayan madde üstü çizili, ödeme bekliyor.", hedef: t.liste, etiket: "Yapılmayan madde çizili" },
      { no: "SR-2026-0045", ad: "Elektrik arızası", d: "Parça tablosu metre ve adetle.", hedef: t.parcaIscilik, etiket: "Metre ve adetle parçalar" },
      { no: "SR-2026-0044", ad: "İlaçlama", d: "Site yönetimine, kontrol tarihiyle.", hedef: t.parcaIscilik, etiket: "Sonraki kontrol tarihi" },
      { no: "SR-2026-0042", ad: "Garanti işi", d: "Parçalar listelenir, ücret yansıtılmaz.", hedef: t.parcaIscilik, etiket: "Ücret yansıtılmaz" },
    ],
    en: [
      { no: "SR-2026-0048", ad: "Boiler service", d: "Parts replaced, total with VAT, next service date.", hedef: e.parcaIscilik, etiket: "Parts, VAT and next service" },
      { no: "SR-2026-0047", ad: "Air conditioner service", d: "Before / after photos, paid by bank transfer.", hedef: e.fotolar, etiket: "Before / after photos" },
      { no: "SR-2026-0046", ad: "Appliance repair", d: "Skipped step crossed out, payment pending.", hedef: e.liste, etiket: "Skipped step crossed out" },
      { no: "SR-2026-0045", ad: "Electrical fault", d: "Parts listed by metre and quantity.", hedef: e.parcaIscilik, etiket: "Parts by metre and quantity" },
      { no: "SR-2026-0044", ad: "Pest control", d: "For a building manager, with the next visit date.", hedef: e.parcaIscilik, etiket: "Next visit date" },
      { no: "SR-2026-0042", ad: "Warranty job", d: "Parts listed, nothing charged.", hedef: e.parcaIscilik, etiket: "No charge" },
    ],
  };
})();
const IMZA_SPOT: Record<Dil, Spot> = { tr: { hedef: raporEtiket("tr").onay, etiket: "Müşteri imzası" }, en: { hedef: raporEtiket("en").onay, etiket: "Customer signature" } };
const TUR_MS = 5500;
type Spot = { hedef: string; etiket: string };
const hareketsiz = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function OrnekRapor() {
  const dil = useDil();
  const ornekler = ORNEKLER[dil];
  const [i, setI] = useState(0);
  // which block is highlighted: an example's block, the signature, or nothing (top of the page)
  const [spotNe, setSpotNe] = useState<number | "imza" | null>(null);
  const spot: Spot | null = spotNe === null ? null : spotNe === "imza" ? IMZA_SPOT[dil] : { hedef: ornekler[spotNe].hedef, etiket: ornekler[spotNe].etiket };
  const setSpot = setSpotNe;
  const [kutu, setKutu] = useState<{ y: number; top: number; left: number; w: number; h: number } | null>(null);
  const [nabiz, setNabiz] = useState(0);
  const [gecis, setGecis] = useState(false);
  const [gorunur, setGorunur] = useState(false);
  const [tur, setTur] = useState<"acik" | "durdu" | "bitti">("acik");
  const kok = useRef<HTMLDivElement>(null);
  const pencere = useRef<HTMLDivElement>(null);
  const kayan = useRef<HTMLDivElement>(null);
  const r = demoRaporlar(dil).find((x) => x.no === ornekler[i].no)!;

  // Find the target block inside the scaled A4 and move the page so it sits in view.
  const olc = useCallback(() => {
    const p = pencere.current;
    const k = kayan.current;
    if (!p || !k) return;
    if (!spot) {
      setKutu(null);
      return;
    }
    const baslik = Array.from(k.querySelectorAll(".a4 h4")).find((e) => e.textContent?.trim() === spot.hedef);
    const blok = baslik?.parentElement;
    if (!blok) {
      setKutu(null);
      return;
    }
    const kb = k.getBoundingClientRect();
    const bb = blok.getBoundingClientRect();
    const top = bb.top - kb.top;
    const left = bb.left - kb.left;
    // Scroll only as far as needed to show the whole block (tall blocks align to the top).
    const ist = bb.height + 100 > p.clientHeight ? top - 40 : top + bb.height + 60 - p.clientHeight;
    const y = Math.max(0, Math.min(k.offsetHeight - p.clientHeight, ist));
    setKutu({ y, top, left, w: bb.width, h: bb.height });
  }, [spot?.hedef]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(olc, 60);
    const ro = new ResizeObserver(() => olc());
    if (kayan.current) ro.observe(kayan.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [olc, i, dil]);

  // Replay the ring pulse whenever the highlighted block changes.
  useEffect(() => {
    if (spotNe !== null) setNabiz((n) => n + 1);
  }, [spotNe]);

  // Is the section on screen (and the tab visible)?
  useEffect(() => {
    const el = kok.current;
    if (!el) return;
    let ekranda = false;
    const guncelle = () => setGorunur(ekranda && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      ekranda = e.isIntersecting;
      guncelle();
    }, { threshold: 0.35 });
    io.observe(el);
    document.addEventListener("visibilitychange", guncelle);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", guncelle);
    };
  }, []);

  const sec = (j: number, elle: boolean) => {
    if (elle) setTur("durdu");
    const yeni = j;
    if (j === i || hareketsiz()) {
      setI(j);
      setSpot(yeni);
      return;
    }
    setGecis(true);
    setTimeout(() => {
      setI(j);
      setSpot(yeni);
      setGecis(false);
    }, 180);
  };

  // First time on screen: show the header (logo, tax info) for a moment, then the first example's highlight.
  useEffect(() => {
    if (!gorunur || spot || hareketsiz()) return;
    const t = setTimeout(() => setSpot(0), 1200);
    return () => clearTimeout(t);
  }, [gorunur, spot]);

  // Auto tour: one round through the examples while the section is on screen; any touch stops it.
  useEffect(() => {
    if (tur !== "acik" || !gorunur || !spot || hareketsiz()) return;
    if (i === ornekler.length - 1) {
      setTur("bitti");
      return;
    }
    const t = setTimeout(() => sec(i + 1, false), TUR_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, spot, tur, gorunur]);

  const imzaya = () => {
    setTur("durdu");
    setSpot("imza");
  };
  const ilerliyor = tur === "acik" && gorunur && !!spot;

  return (
    <div ref={kok} data-ornek={i} data-tur={tur} data-spot={spot ? spot.hedef : ""} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, margin: "0 0 10px 4px" }}>{dil === "en" ? "Pick a job to see its report." : "Bir iş seç, raporunu gör."}</div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {ornekler.map((o, j) => {
            const on = i === j;
            return (
              <button key={o.no} onClick={() => sec(j, true)} aria-pressed={on} style={{ position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "11px 13px", border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`, background: on ? "var(--ink)" : "#fff", color: on ? "#fff" : "var(--ink)", display: "flex", gap: 10, alignItems: "flex-start", boxShadow: on ? "var(--shadow-md)" : "none" }}>
                <span className="num" style={{ flex: "none", width: 20, height: 20, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, background: on ? "rgba(255,255,255,.14)" : "var(--tile)", color: on ? "#fff" : "var(--muted)", marginTop: 1 }}>{j + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 14 }}>{o.ad}</span>
                  <span className="hidden sm:block" style={{ fontSize: 12, marginTop: 2, color: on ? "rgba(255,255,255,.7)" : "var(--muted)", lineHeight: 1.4 }}>{o.d}</span>
                </span>
                {on && <Ikon ad="sag" boy={16} style={{ marginLeft: "auto", marginTop: 2 }} />}
                {on && ilerliyor && <span key={`${i}-${spot ? spot.hedef : ""}`} className="or-ilerleme" style={{ "--sure": `${TUR_MS}ms` } as React.CSSProperties} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ minWidth: 0, background: "var(--tile)", borderRadius: 20, padding: "16px 16px 0", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 700 }}><span className="mini" style={{ color: "var(--accent)", marginRight: 6 }}>{dil === "en" ? "Sample" : "Örnek"}</span>{r.no} · {r.musteri.ad}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <span className="pill" style={{ background: "#fff" }}>A4</span>
            <span className="pill" style={{ background: "#fff" }}>PDF</span>
            <button type="button" className="pill ok or-imza" onClick={imzaya} aria-label={dil === "en" ? "Go to signature" : "İmzaya git"}>{dil === "en" ? "Signed" : "İmzalı"}<Ikon ad="asagi" boy={11} kalinlik={3} /></button>
          </span>
        </div>
        <div ref={pencere} onPointerDown={() => setTur("durdu")} style={{ maxHeight: 640, maxWidth: 635, margin: "0 auto", overflow: "hidden", borderRadius: "10px 10px 0 0", boxShadow: "var(--shadow-md)" }}>
          <div ref={kayan} className="or-kayan" style={{ transform: `translateY(${-(kutu ? kutu.y : 0)}px)`, opacity: gecis ? 0 : 1 }}>
            <Olcekli max={0.8}><RaporSayfa r={r} f={demoFirma(dil)} /></Olcekli>
            {kutu && spot && (
              <div key={nabiz} className="or-halka" aria-hidden="true" style={{ top: kutu.top - 6, left: kutu.left - 8, width: kutu.w + 16, height: kutu.h + 12 }}>
                <span className="or-etiket">{spot.etiket}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Şablon editörü: maddeler yazılarak dolar, hazır şablonlara dokununca maddeleri görünür ----------
type OzelSablon = { id: string; ad: string; cihazTuru: string; maddeler: string[] };
const OZEL: Record<Dil, OzelSablon> = {
  tr: {
    id: "ozel",
    ad: "Asansör periyodik bakım",
    cihazTuru: "Asansör",
    maddeler: ["Fren sistemi kontrol edildi", "Kapı kilitleri ve emniyet devresi test edildi", "Halat ve makaralar kontrol edilip yağlandı", "Kabin aydınlatması ve acil alarm butonu test edildi"],
  },
  en: {
    id: "ozel",
    ad: "Lift maintenance",
    cihazTuru: "Lift",
    maddeler: ["Brake system checked", "Door locks and safety circuit tested", "Ropes and pulleys checked and lubricated", "Car lighting and emergency alarm tested"],
  },
};
type SablonAdim = { t: "ad" | "tur" | "ekle" | "harf" | "ac" | "kaydet"; ms: number };
// One step per typed character; "ms" is the wait before the step.
const adimlar = (o: OzelSablon): SablonAdim[] => [
  ...Array.from(o.ad, (_, k): SablonAdim => ({ t: "ad", ms: k === 0 ? 300 : 32 })),
  ...Array.from(o.cihazTuru, (): SablonAdim => ({ t: "tur", ms: 40 })),
  ...o.maddeler.flatMap((m): SablonAdim[] => [{ t: "ekle", ms: 180 }, ...Array.from(m, (): SablonAdim => ({ t: "harf", ms: 24 })), { t: "ac", ms: 220 }]),
  { t: "kaydet", ms: 350 },
];
const ADIMLAR: Record<Dil, SablonAdim[]> = { tr: adimlar(OZEL.tr), en: adimlar(OZEL.en) };

function sablonDurumu(n: number, SABLON_ADIMLAR: SablonAdim[]) {
  let ad = 0, tur = 0, satir = 0, acik = 0, kayit = false;
  const harf = [0, 0, 0, 0];
  for (let k = 0; k < Math.min(n, SABLON_ADIMLAR.length); k++) {
    const t = SABLON_ADIMLAR[k].t;
    if (t === "ad") ad++;
    else if (t === "tur") tur++;
    else if (t === "ekle") satir++;
    else if (t === "harf") harf[satir - 1]++;
    else if (t === "ac") acik++;
    else kayit = true;
  }
  return { ad, tur, satir, harf, acik, kayit };
}

// Typed part + the untyped rest kept invisible, so the row never changes height while typing.
function Yazilan({ metin, adet, imlec }: { metin: string; adet: number; imlec: boolean }) {
  return (
    <>
      {metin.slice(0, adet)}
      {imlec && <span className="se-imlec" aria-hidden="true" />}
      <span className="se-gizli" aria-hidden="true">{metin.slice(adet)}</span>
    </>
  );
}

export function SablonEditoru() {
  const dil = useDil();
  const en = dil === "en";
  const OZEL_SABLON = OZEL[dil];
  const SABLON_ADIMLAR = ADIMLAR[dil];
  const SABLONLAR = sablonlarDil(dil);
  const SON = SABLON_ADIMLAR.length;
  const adimRef = useRef(SABLON_ADIMLAR);
  adimRef.current = SABLON_ADIMLAR;
  // statik: final state, no demo (server render, reduced motion, or already visible on load)
  // bekliyor: off-screen, empty; oynuyor: typing demo; bitti: demo done or the user picked a template
  const [demo, setDemo] = useState<"statik" | "bekliyor" | "oynuyor" | "bitti">("statik");
  const [n, setN] = useState(SON);
  const [secili, setSecili] = useState("ozel");
  const [tost, setTost] = useState(false);
  const kok = useRef<HTMLDivElement>(null);
  const zaman = useRef<ReturnType<typeof setTimeout>[]>([]);

  const temizle = () => {
    zaman.current.forEach(clearTimeout);
    zaman.current = [];
  };

  useEffect(() => {
    const el = kok.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ilk = true;
    const oynat = () => {
      setDemo("oynuyor");
      let t = 0;
      adimRef.current.forEach((a, k) => {
        t += a.ms;
        zaman.current.push(setTimeout(() => setN(k + 1), t));
      });
      zaman.current.push(setTimeout(() => { setDemo("bitti"); setTost(true); }, t));
      zaman.current.push(setTimeout(() => setTost(false), t + 1800));
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (ilk) {
          ilk = false;
          if (e.isIntersecting) io.disconnect();
          else {
            setN(0);
            setDemo("bekliyor");
          }
          return;
        }
        if (!e.isIntersecting) return;
        io.disconnect();
        oynat();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      temizle();
    };
  }, []);

  // The user picks a template: the demo stops at once and shows its final state.
  const sec = (id: string) => {
    temizle();
    setN(Number.MAX_SAFE_INTEGER);
    setTost(false);
    setDemo((d) => (d === "statik" ? d : "bitti"));
    setSecili(id);
  };

  // a finished demo (or no demo) always shows the whole template of the current language
  const d = sablonDurumu(demo === "statik" || demo === "bitti" ? SON : n, SABLON_ADIMLAR);
  const hazir = SABLONLAR.find((s) => s.id === secili);
  const oynuyor = demo === "oynuyor" || demo === "bekliyor";
  const basili = demo === "oynuyor" && SABLON_ADIMLAR[n]?.t === "ekle";
  const alanImlec = oynuyor && d.satir === 0 ? (d.tur > 0 || SABLON_ADIMLAR[n]?.t === "tur" ? "tur" : "ad") : null;
  const aktif = hazir ? -1 : d.satir - 1;

  const ad = hazir ? hazir.ad : OZEL_SABLON.ad;
  const tur = hazir ? hazir.cihazTuru : OZEL_SABLON.cihazTuru;
  const maddeler = hazir ? hazir.maddeler.slice(0, 4) : OZEL_SABLON.maddeler;

  return (
    <div ref={kok} data-sablon={demo} data-secili={secili} className="mt-12 grid gap-4 md:grid-cols-[1fr_300px]">
      <div style={{ background: "var(--tile)", border: "1px solid var(--line)", borderRadius: 20, padding: 14, display: "grid", gap: 10 }}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {([["belge", en ? "Template name" : "Şablon adı", ad, d.ad, "ad"], ["anahtar", en ? "Appliance type" : "Cihaz türü", tur, d.tur, "tur"]] as const).map(([ik, k, v, adet, alan]) => (
            <div key={k} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
              <span className="doc-ico" style={{ width: 28, height: 28 }}><Ikon ad={ik} boy={14} /></span>
              <div style={{ minWidth: 0 }}><div className="mini">{k}</div><div style={{ fontWeight: 800, fontSize: 13.5 }}>{hazir ? v : <Yazilan metin={v} adet={adet} imlec={alanImlec === alan} />}</div></div>
            </div>
          ))}
        </div>
        <div key={secili} style={{ display: "grid", gap: 10 }}>
          {maddeler.map((m, i) => {
            const gorunur = hazir ? true : i < d.satir;
            const acik = hazir ? true : i < d.acik;
            const akt = i === aktif;
            return (
              <div key={m} className={`se-satir${gorunur ? "" : " se-bos"}${hazir ? " se-gel" : ""}`} style={{ "--i": i, background: "#fff", border: akt ? "1.5px solid var(--accent)" : "1px solid var(--line)", borderRadius: 12, padding: akt ? "10.5px 11.5px" : "11px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: akt ? "0 0 0 4px var(--accent-soft)" : "none" } as React.CSSProperties}>
                <span className="num" style={{ fontSize: 11, color: "var(--faint)", fontWeight: 800, width: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{hazir ? m : <Yazilan metin={m} adet={d.harf[i]} imlec={akt} />}</span>
                <span className={acik ? "se-anahtar se-acik" : "se-anahtar"} aria-hidden="true" />
              </div>
            );
          })}
        </div>
        <div className={basili ? "se-ekle se-bas" : "se-ekle"} style={{ border: "1.5px dashed var(--line-2)", borderRadius: 12, padding: "11px 12px", fontSize: 13, fontWeight: 700, color: "var(--faint)", display: "flex", gap: 8, alignItems: "center" }}>
          <Ikon ad="arti" boy={14} />{hazir ? (en ? `${hazir.maddeler.length - 4} more steps` : `${hazir.maddeler.length - 4} madde daha`) : en ? "Add step" : "Madde ekle"}
        </div>
      </div>
      <div className="card" style={{ borderRadius: 20, padding: 12, position: "relative" }}>
        <div className="mini" style={{ padding: "4px 6px 8px" }}>{en ? "Ready-made templates" : "Hazır şablonlar"}</div>
        {SABLONLAR.map((s) => {
          const on = secili === s.id;
          return (
            <button key={s.id} type="button" className="se-sablon" aria-pressed={on} onClick={() => sec(s.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent-soft)" : "#fff", color: on ? "var(--accent-ink)" : "var(--ink)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, fontSize: 13, fontWeight: 700, fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="liste" boy={14} style={{ color: on ? "var(--accent)" : "var(--faint)" }} />{s.ad}</span>
              <span className="num" style={{ fontSize: 11, color: on ? "var(--accent)" : "var(--faint)" }}>{s.maddeler.length} {en ? "steps" : "madde"}</span>
            </button>
          );
        })}
        <button type="button" className={d.kayit ? "se-sablon se-ozel" : "se-sablon se-ozel se-sakli"} aria-pressed={secili === "ozel"} onClick={() => sec("ozel")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "var(--ink)", color: "#fff", border: "1px solid var(--ink)", borderRadius: 10, padding: "9px 10px", fontSize: 13, fontWeight: 800, fontFamily: "inherit", textAlign: "left", cursor: "pointer", boxShadow: secili === "ozel" ? "0 0 0 3px var(--accent-soft)" : "none" }}>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="tik" boy={14} kalinlik={2.6} />{OZEL_SABLON.ad}</span>
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.6)" }}>{en ? "yours" : "senin"}</span>
        </button>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "10px 6px 2px" }}>{en ? "Pick a template to see its steps." : "Maddelerini görmek için bir şablon seç."}</div>
        <div className={tost ? "se-tost se-tost-on" : "se-tost"} role="status">
          <Ikon ad="tik" boy={13} kalinlik={3} />{en ? "Template added" : "Şablon eklendi"}
        </div>
      </div>
    </div>
  );
}

// ---------- Müşteri geçmişi: numara yazılır, kayıtlı müşteri bulunur, kart ve geçmiş açılır ----------
function mgVeri(dil: Dil) {
  const l = demoRaporlar(dil);
  const musteri = musteriler(l).find((m) => m.ad === (dil === "en" ? "Sarah Collins" : "Ayşe Kaplan"))!;
  return { musteri, gecmis: gecmis(l, musteri.anahtar).slice(0, 2), tel: telefonGoster(musteri.telefon), semt: dil === "en" ? "Hackney" : "Bornova" };
}
const MG: Record<Dil, ReturnType<typeof mgVeri>> = { tr: mgVeri("tr"), en: mgVeri("en") };
const MG_MADDELER: Record<Dil, string[][]> = {
  tr: [
    ["Numarayla tüm servis geçmişi", "Hangi cihaza ne zaman bakıldı, hangi parça değişti, ne kadar ödendi."],
    ["Kayıtlı cihaz tek dokunuşla forma", "Marka, model ve seri numarası yeni forma otomatik gelir."],
    ["Sonraki bakım tarihi kayıtta", "Tarih raporda yazar, panelinde yaklaşan bakımlar listesine düşer."],
    ["Bekleyen tahsilat gözden kaçmaz", "Ödemesi alınmamış raporlar ayrı rozetle işaretlenir."],
  ],
  en: [
    ["Full service history from a phone number", "Which appliance was serviced when, which part was replaced, how much was paid."],
    ["Saved appliances go into the form in one tap", "Make, model and serial number fill in the new form for you."],
    ["Next service date on record", "The date is printed on the report and shows up in your upcoming services."],
    ["Unpaid jobs never slip through", "Reports that are still unpaid carry their own badge."],
  ],
};
// Stage switch times (ms after the start). Stage: 1 found, 2 card, 3 first row, 4 second row,
// 5 device, 6 next service, 7 "Bekleyen" highlight, 8 done.
const MG_ZAMAN = [1100, 1450, 1900, 2150, 2800, 3450, 4100, 5000];
function MgDurum({ odeme, en }: { odeme: string; en: boolean }) {
  if (odeme === "bekliyor") return <span className="pill warn">{en ? "Payment pending" : "Ödeme bekliyor"}</span>;
  if (odeme === "garanti") return <span className="pill info">{en ? "Warranty" : "Garanti"}</span>;
  return <span className="pill ok">{en ? "Paid" : "Ödendi"}</span>;
}

export function MusteriGecmisi() {
  const dil = useDil();
  const en = dil === "en";
  const { musteri: MG_MUSTERI, gecmis: MG_GECMIS, tel: MG_TEL, semt } = MG[dil];
  const birim = raporPara(MG_GECMIS[0]);
  const mgTutar = (n: number) => para(Math.round(n), birim, dil, true);
  const telRef = useRef(MG_TEL);
  telRef.current = MG_TEL;
  const SON = MG_ZAMAN.length;
  // statik: final state, no demo (server render, reduced motion, or already on screen at load)
  // bekliyor: off-screen, empty; oynuyor: demo running; bitti: demo done
  const [demo, setDemo] = useState<"statik" | "bekliyor" | "oynuyor" | "bitti">("statik");
  const [harf, setHarf] = useState(MG_TEL.length);
  const [asama, setAsama] = useState(SON);
  const [sayac, setSayac] = useState(1);
  const kok = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = kok.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ilk = true;
    let raf = 0;
    const zaman: ReturnType<typeof setTimeout>[] = [];
    const oynat = () => {
      setDemo("oynuyor");
      for (let i = 1; i <= telRef.current.length; i++) zaman.push(setTimeout(() => setHarf(i), 300 + (i - 1) * 55));
      MG_ZAMAN.forEach((ms, k) => zaman.push(setTimeout(() => setAsama(k + 1), ms)));
      zaman.push(setTimeout(() => {
        const t0 = performance.now();
        const f = (t: number) => {
          const p = Math.min(1, (t - t0) / 900);
          setSayac(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(f);
        };
        raf = requestAnimationFrame(f);
      }, MG_ZAMAN[1]));
      zaman.push(setTimeout(() => setDemo("bitti"), MG_ZAMAN[SON - 1]));
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (ilk) {
          ilk = false;
          if (e.isIntersecting) io.disconnect();
          else {
            setHarf(0);
            setAsama(0);
            setSayac(0);
            setDemo("bekliyor");
          }
          return;
        }
        if (!e.isIntersecting) return;
        io.disconnect();
        oynat();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      zaman.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  const yaziyor = demo === "oynuyor" && asama === 0;
  const harfGoster = demo === "statik" || demo === "bitti" ? MG_TEL.length : harf;
  const ac = (k: number) => (asama >= k ? " mg-on" : "");
  const isaret = [2, 5, 6, 7]; // stage that ticks each list item
  const cihaz = MG_MUSTERI.cihazlar[0];
  const sonBakim = MG_GECMIS[0].sonrakiBakim;

  return (
    <div ref={kok} data-musteri={demo} data-musteri-asama={asama} className="mt-12 grid items-center gap-10 md:grid-cols-2" style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(20px, 4vw, 44px)" }}>
      <div>
        <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>{en ? "“What did you do to our boiler last year?” Answer it without digging through old paperwork." : "“Geçen yıl kombiye ne yapmıştınız?” sorusunu arşiv karıştırmadan yanıtla."}</h3>
        <div style={{ marginTop: 20 }}>
          {MG_MADDELER[dil].map(([t, d], i) => (
            <div key={t} className={`mg-madde${ac(isaret[i])}`} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
              <Ikon ad="tik" boy={17} kalinlik={2.4} className="mg-tik" style={{ marginTop: 1 }} />
              <div><div className="mg-baslik" style={{ fontWeight: 800, fontSize: 14 }}>{t}</div><div className="mg-acik" style={{ fontSize: 12.5, fontWeight: 600 }}>{d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full" style={{ maxWidth: 400 }}>
        <div className={`mg-tel${ac(1)}`} style={{ marginRight: 30, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: 40 }}>
          <Ikon ad="telefon" boy={14} style={{ color: "var(--muted)" }} />
          <span className="num" style={{ fontSize: 13, fontWeight: 800 }}>
            {MG_TEL.slice(0, harfGoster)}
            {yaziyor && <span className="se-imlec" aria-hidden="true" />}
            <span className="se-gizli" aria-hidden="true">{MG_TEL.slice(harfGoster)}</span>
          </span>
          <span className="pill ok mg-bulundu" style={{ marginLeft: "auto", display: "inline-flex", gap: 5, alignItems: "center", padding: "4px 10px", fontSize: 11 }}><Ikon ad="tik" boy={11} kalinlik={3} />{en ? "Existing customer found" : "Kayıtlı müşteri bulundu"}</span>
        </div>
        <div className={`card mg-kart${ac(2)}`} style={{ marginTop: 12, marginRight: 30, borderRadius: 14, padding: "16px 16px 22px", boxShadow: "var(--shadow-md)" }}>
          <div className="mini">{en ? "Customer card" : "Müşteri kartı"}</div>
          <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{MG_MUSTERI.ad}</div>
          <div className="num" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{MG_TEL} · {semt}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
            {[[en ? "Visits" : "Servis", String(Math.round(MG_MUSTERI.sayi * sayac))], [en ? "Total" : "Toplam", mgTutar(MG_MUSTERI.toplam * sayac)], [en ? "Unpaid" : "Bekleyen", mgTutar(MG_MUSTERI.bekleyen)]].map(([k, v], i) => (
              <div key={k} className={i === 2 && asama === 7 ? "mg-kutu mg-vurgu" : "mg-kutu"} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 9, padding: "7px 9px" }}><div className="mini" style={{ fontSize: 8.5 }}>{k}</div><div className="num" style={{ fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>{v}</div></div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 8 }}>
            <div className="mini" style={{ fontSize: 8.5 }}>{en ? "Service history" : "Servis geçmişi"}</div>
            {MG_GECMIS.map((r, i) => (
              <div key={r.no} className={`mg-satir${ac(3 + i)}`} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}><span className="num">{tarihTR(r.tarih, dil)}</span> · {r.hizmet}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{r.cihaz.marka} · {r.parcalar.length ? r.parcalar.map((p) => p.ad).join(", ") : en ? "no parts replaced" : "parça değişmedi"}</div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="num" style={{ fontSize: 12, fontWeight: 800 }}>{mgTutar(hesapla(r).toplam)}</div>
                  <MgDurum odeme={r.odeme} en={en} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* The two small cards overlap only the card's empty bottom padding (14 of 22 px). */}
        <div style={{ display: "flex", flexWrap: "wrap-reverse", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginTop: -14, position: "relative" }}>
          <div className="suz2" style={{ marginLeft: 14, marginTop: 22 }}>
            <div className={`card mg-yuz${ac(6)}`} style={{ borderRadius: 12, padding: "9px 12px", boxShadow: "var(--shadow-md)", display: "flex", gap: 9, alignItems: "center" }}>
              <span className="doc-ico" style={{ width: 28, height: 28, background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="takvim" boy={14} /></span>
              <div><div className="mini" style={{ fontSize: 8.5 }}>{en ? "Next service" : "Sonraki bakım"}</div><div className="num" style={{ fontSize: 12.5, fontWeight: 800 }}>{tarihTR(sonBakim, dil)} · {cihaz.tur.toLocaleLowerCase(en ? "en-GB" : "tr-TR")}</div></div>
            </div>
          </div>
          <div className="suz" style={{ marginLeft: "auto", maxWidth: 250 }}>
            <div className={`card mg-yuz${ac(5)}`} style={{ borderRadius: 12, padding: "9px 12px", boxShadow: "var(--shadow-md)" }}>
              <div className="mini" style={{ fontSize: 8.5 }}>{en ? "Saved appliance" : "Kayıtlı cihaz"}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>{cihaz.marka} {cihaz.model}</div>
              <div className="num" style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>SN {cihaz.seriNo}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- WhatsApp bölümü: hazır mesaj gönderilir, sohbet kayar, PDF aynı sohbete düşer ----------
const WA: Record<Dil, { rapor: ReturnType<typeof demoRaporlar>[number]; metin: string }> = (() => {
  const v = (dil: Dil) => {
    const rapor = demoRaporlar(dil).find((r) => r.no === "SR-2026-0048")!;
    return { rapor, metin: waMetin(rapor, demoFirma(dil)) };
  };
  return { tr: v("tr"), en: v("en") };
})();
// Stage switch times (ms after the start): 1 send pressed, 2 message sent, 3 chat scrolls,
// 4 PDF arrives + delivered ticks, 5 done.
const WA_ZAMAN = [700, 1000, 2200, 4000, 4600];
const WA_OZELLIK = {
  tr: [
    ["indir", "PDF olarak kaydet", "Telefonun yazdırma ekranından A4 PDF; Android ve iPhone'da aynı adımlar.", 4],
    ["mesaj", "Hazır mesaj", "Numara 05xx biçiminde yazılsa da doğru formata çevrilir; mesajı göndermeden önce kontrol edersin.", 2],
  ],
  en: [
    ["indir", "Save as PDF", "An A4 PDF from your phone's print screen; the same steps on Android and iPhone.", 4],
    ["mesaj", "Ready-made message", "Enter the number with its country code (+44, +1...); you check the message before you send it.", 2],
  ],
} as const;

// Renders WhatsApp's *bold* markup the way the app shows it.
function WaYazi({ metin }: { metin: string }) {
  return (
    <>
      {metin.split(/(\*[^*\n]+\*)/).map((p, i) =>
        p.length > 2 && p.startsWith("*") && p.endsWith("*") ? <b key={i} style={{ fontWeight: 800 }}>{p.slice(1, -1)}</b> : p,
      )}
    </>
  );
}

function WaSaat({ cift }: { cift: boolean }) {
  return (
    <span style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 3, fontSize: 9, color: "#5f7284", fontWeight: 600 }}>
      <span className="num">15:40</span>
      <span style={{ display: "inline-flex" }}>
        <Ikon ad="tik" boy={10} kalinlik={2.6} />
        {cift && <Ikon ad="tik" boy={10} kalinlik={2.6} style={{ marginLeft: -6 }} />}
      </span>
    </span>
  );
}

export function WhatsAppBolum() {
  const dil = useDil();
  const en = dil === "en";
  const { rapor: WA_RAPOR, metin: WA_METIN } = WA[dil];
  const basHarf = WA_RAPOR.musteri.ad.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toLocaleUpperCase(en ? "en-GB" : "tr-TR");
  const SON = WA_ZAMAN.length;
  // statik: final state, no demo (server render, reduced motion, or already on screen at load)
  // bekliyor: off-screen, nothing sent yet; oynuyor: demo running; bitti: demo done
  const [demo, setDemo] = useState<"statik" | "bekliyor" | "oynuyor" | "bitti">("statik");
  const [asama, setAsama] = useState(SON);
  const [fark, setFark] = useState(0); // how far the chat overflows its window (px)
  const kok = useRef<HTMLDivElement>(null);
  const pencere = useRef<HTMLDivElement>(null);
  const icerik = useRef<HTMLDivElement>(null);

  // The chat sits on the window's bottom edge; its top overflows. Measure by how much.
  useEffect(() => {
    const p = pencere.current;
    const c = icerik.current;
    if (!p || !c) return;
    const olc = () => setFark(Math.max(0, c.offsetHeight - p.clientHeight));
    olc();
    const ro = new ResizeObserver(olc);
    ro.observe(p);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = kok.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ilk = true;
    const zaman: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (ilk) {
          ilk = false;
          if (e.isIntersecting) io.disconnect();
          else {
            setAsama(0);
            setDemo("bekliyor");
          }
          return;
        }
        if (!e.isIntersecting) return;
        io.disconnect();
        setDemo("oynuyor");
        WA_ZAMAN.forEach((ms, k) => zaman.push(setTimeout(() => setAsama(k + 1), ms)));
        zaman.push(setTimeout(() => setDemo("bitti"), WA_ZAMAN[SON - 1]));
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      zaman.forEach(clearTimeout);
    };
  }, []);

  const ac = (k: number) => (asama >= k ? " wa-on" : "");
  // Before stage 3 the chat is pushed down so the start of the message shows; then it slides up.
  const kaydir = asama < 3 ? fark : 0;

  return (
    <div ref={kok} data-wa={demo} data-wa-asama={asama} className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
      <div>
        <span className="pill ok" style={{ fontSize: 11.5, padding: "4px 10px" }}>{en ? "On the app your customers already use" : "Müşterinin her gün kullandığı kanaldan"}</span>
        <h2 className="h2 mt-4">{en ? "The report reaches your customer on WhatsApp." : "Rapor müşteriye WhatsApp'tan ulaşır."}</h2>
        <p className="sub mt-4" style={{ maxWidth: 460 }}>{en ? "One tap opens the customer's WhatsApp chat with a ready-made message: report number, work carried out, parts replaced, total including VAT and the technician. You add the signed PDF to the same chat." : "Tek dokunuşla müşterinin WhatsApp sohbeti hazır bir mesajla açılır: rapor numarası, yapılan işlemler, değişen parçalar, KDV dahil toplam ve teknisyen. İmzalı PDF'i aynı sohbete eklersin."}</p>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {WA_OZELLIK[dil].map(([ik, t, d, k]) => (
            <div key={t} className={`wa-ozellik${ac(k)}`} style={{ display: "flex", gap: 12 }}>
              <span className="doc-ico wa-ikon" style={{ width: 34, height: 34 }}><Ikon ad={ik} boy={16} /></span>
              <div><div style={{ fontWeight: 800, fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="/giris?kayit=1" className="btn">{en ? "Create your first report" : "İlk raporu oluştur"}</a>
          <a href="#rapor" className="btn btn-ghost">{en ? "See sample reports" : "Örnek raporları gör"}</a>
        </div>
      </div>
      <div style={{ background: "var(--dark)", borderRadius: 22, padding: "36px 16px 0", display: "flex", justifyContent: "center", overflow: "hidden", height: 470 }}>
        <div style={{ width: 290, background: "#fff", borderRadius: "40px 40px 0 0", padding: "6px 6px 0" }}>
          <div style={{ background: "#efeae2", borderRadius: "34px 34px 0 0", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#fff", padding: "16px 14px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)", flex: "none" }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, background: "var(--tile)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, color: "var(--muted)" }}>{basHarf}</span>
              <div><div style={{ fontSize: 12.5, fontWeight: 800 }}>{WA_RAPOR.musteri.ad}</div><div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{telefonGoster(WA_RAPOR.musteri.telefon)}</div></div>
            </div>
            <div ref={pencere} style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <div ref={icerik} className={demo === "oynuyor" ? "wa-akis wa-kayar" : "wa-akis"} style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, transform: `translateY(${kaydir}px)` }}>
                <div className={`wa-balon${ac(2)}`} style={{ background: "#dcf3d0", borderRadius: "12px 4px 12px 12px", padding: "9px 10px 6px", fontSize: 10.5, lineHeight: 1.45, color: "#1c2735", boxShadow: "0 1px 1px rgba(0,0,0,.06)", marginLeft: 18 }}>
                  <span style={{ whiteSpace: "pre-wrap" }}><WaYazi metin={WA_METIN} /></span>
                  <WaSaat cift={asama >= 4} />
                </div>
                <div className={`wa-balon${ac(4)}`} style={{ background: "#dcf3d0", borderRadius: 10, padding: "8px 10px 6px", marginTop: 8, marginLeft: 18 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 26, height: 30, borderRadius: 4, background: "#fff", display: "grid", placeItems: "center", color: "var(--bad)", fontSize: 8, fontWeight: 800, flex: "none" }}>PDF</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 10.5, fontWeight: 800 }}>{WA_RAPOR.no} {WA_RAPOR.musteri.ad}.pdf</span>
                      <span style={{ display: "block", fontSize: 9, color: "#5f7284", fontWeight: 600 }}>{en ? "1 page · PDF" : "1 sayfa · PDF"}</span>
                    </span>
                  </div>
                  <WaSaat cift={asama >= 4} />
                </div>
              </div>
            </div>
            <div style={{ flex: "none", display: "flex", gap: 6, alignItems: "center", padding: "8px 8px 10px" }}>
              <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: 18, padding: "8px 12px", fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: asama < 2 ? "#1c2735" : "#94a3b2" }}>
                {asama < 2 ? WA_METIN.split("\n").slice(0, 2).join(" ").replace(/\*/g, "") : en ? "Message" : "Mesaj"}
              </div>
              <span className={asama === 1 ? "wa-gonder wa-basili" : "wa-gonder"} aria-hidden="true" style={{ flex: "none", width: 32, height: 32, borderRadius: 16, background: "#16794c", color: "#fff", display: "grid", placeItems: "center" }}><Ikon ad="sag" boy={15} kalinlik={2.6} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Dönen iş adı (referanstaki "métier" bandı) ----------
const ISLER: Record<Dil, string[]> = {
  tr: ["Kombi bakımı", "Klima servisi", "Beyaz eşya tamiri", "İlaçlama", "Elektrik arızası", "Asansör bakımı", "Su arıtma servisi"],
  en: ["Boiler servicing", "Air conditioning", "Appliance repair", "Pest control", "Electrical repairs", "Lift maintenance", "Water treatment"],
};
export function IsDongu() {
  const dil = useDil();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % ISLER.tr.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span key={i} className="sf-dongu" style={{ display: "inline-block" }}>
      {ISLER[dil][i]}
      <style>{`.sf-dongu{animation:sfgir .45s ease both}@keyframes sfgir{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion: reduce){.sf-dongu{animation:none}}`}</style>
    </span>
  );
}

// ---------- Fiyat: iki paket (Usta: 1 teknisyen, Firma: sınırsız). Sitede sadece ABD doları görünür. ----------
// Tutarlar app/lib/paket.ts içinde (PAKET); ödeme sayfası ve ödeme API'si de oradan okur.
const KAYIT = "/giris?kayit=1";
const sent = (usd: number) => Math.round(usd * 100); // amounts are compared and shown in whole cents
const dolar = (c: number, dil: Dil = "tr") => `$${c % 100 === 0 ? c / 100 : dil === "en" ? (c / 100).toFixed(2) : (c / 100).toFixed(2).replace(".", ",")}`;
// Texts of the pricing section. In English the packages are called Solo (Usta) and Team (Firma).
const FT = {
  tr: {
    donem: "Ödeme dönemi", aylik: "Aylık", yillik: "Yıllık", indirim: "%20 indirim", ay: "/ ay",
    yillikAlt: (t: string) => `Yıllık ${t} peşin · KDV hariç`, aylikAlt: "Aylık ödeme · KDV hariç",
    usta: "Usta", ustaRozet: "1 teknisyen", ustaAcik: "Sahaya tek başına çıkan usta için. Raporun cebinde, akşamın sana kalır.",
    ustaMadde: ["1 teknisyen", "Sınırsız servis raporu, rapor başına ücret yok", "Raporların, müşterilerin ve fotoğrafların bulutta", "Ekip kurunca tek mesajla Firma'ya geçersin", "Aşağıdaki her şey dahil"],
    firma: "Firma", firmaRozet: "Sınırsız teknisyen", firmaAcik: "Ekibi olan servis firması için. Ekip kaç kişi olursa olsun tek fiyat.",
    ekip: "Ekibin kaç kişi?", azalt: "Azalt", artir: "Artır", kisiBasi: "Kişi başı",
    ucuz: (t: string) => `Usta paketinden kişi başı ${t} ucuz`, ucuzDegil: "3. teknisyenden itibaren Usta'dan ucuz",
    firmaMadde: ["Sınırsız teknisyen ve cihaz", "Sınırsız servis raporu, rapor başına ücret yok", "Ekibe yeni biri katılınca ek ücret yok", "Bütün ekibin raporları ofiste tek ekranda", "Aşağıdaki her şey dahil"],
    dene: "3 gün ücretsiz dene",
    guven: ["Kart istemez", "Sözleşme yok", "Rapor başına ücret yok", "İstediğin ay bırakırsın"],
    dahilBaslik: "İki pakette de dahil, ek ücret yok",
    dahil: [
      "Sınırsız servis raporu: yoğun ayda da aynı fiyat",
      "5 hazır kontrol listesi ve istediğin kadar kendi şablonun",
      "Logolu, kurumsal A4 rapor; tek dokunuşla PDF",
      "Müşterinin WhatsApp'ına hazır rapor mesajı",
      "İtirazı bitiren kanıt: önce / sonra fotoğraf ve imza",
      "Numarayla müşteri geçmişi, kayıtlı cihazlar, arşiv arama",
      "Tahsil bekleyenler ve yaklaşan bakımlar tek ekranda",
      "Bulut arşiv: telefon değişse de raporların hesabında",
    ],
    notlar: [
      ["E-fatura değildir.", "Fixnote iş teslim raporu üretir; faturanı bugünkü yönteminle kesersin."],
      ["İnternet yokken de kaydeder.", "Rapor telefonda bekler, bağlantı gelince hesabına gönderilir."],
      ["Paket değiştirmek kolay.", "Ekibin büyüyünce Firma'ya geçersin; hesabın ve kayıtların aynen kalır."],
      ["Kurulum ücreti yok.", "Hesabını açarsın, ilk raporu aynı gün yazarsın."],
    ],
  },
  en: {
    donem: "Billing period", aylik: "Monthly", yillik: "Yearly", indirim: "20% off", ay: "/ month",
    yillikAlt: (t: string) => `${t} billed yearly · excl. VAT`, aylikAlt: "Billed monthly · excl. VAT",
    usta: "Solo", ustaRozet: "1 technician", ustaAcik: "For the technician who works alone. Reports done on site, evenings back to you.",
    ustaMadde: ["1 technician", "Unlimited service reports, no per-report fee", "Your reports, customers and photos in the cloud", "Move to Team with one message when you grow", "Everything below included"],
    firma: "Team", firmaRozet: "Unlimited technicians", firmaAcik: "For service companies with a crew. One price, however big the team.",
    ekip: "How big is your team?", azalt: "Fewer", artir: "More", kisiBasi: "Per person",
    ucuz: (t: string) => `${t} less per person than Solo`, ucuzDegil: "Cheaper than Solo from the 3rd technician",
    firmaMadde: ["Unlimited technicians and devices", "Unlimited service reports, no per-report fee", "No extra cost when someone joins the team", "The whole team's reports on one screen in the office", "Everything below included"],
    dene: "Try free for 3 days",
    guven: ["No card needed", "No contract", "No per-report fee", "Cancel any month"],
    dahilBaslik: "Included in both plans, no extra fees",
    dahil: [
      "Unlimited service reports: same price in your busiest month",
      "5 ready-made checklists and as many of your own as you like",
      "Branded A4 report with your logo; PDF in one tap",
      "A ready-to-send report message for the customer's WhatsApp",
      "Proof that settles disputes: before / after photos and signature",
      "Customer history by phone number, saved appliances, archive search",
      "Unpaid jobs and upcoming services on one screen",
      "Cloud archive: your reports stay in your account if you change phones",
    ],
    notlar: [
      ["Not an invoice.", "Fixnote produces a job completion report; keep invoicing the way you do today."],
      ["Works without signal.", "The report waits on the phone and goes to your account when you're back online."],
      ["Switching plans is easy.", "Move to Team when you grow; your account and records stay as they are."],
      ["No setup fee.", "Open your account and write your first report the same day."],
    ],
  },
};

function Madde({ children, koyu }: { children: React.ReactNode; koyu?: boolean }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>
      <span style={{ flex: "none", width: 20, height: 20, borderRadius: 10, background: koyu ? "rgba(124,196,214,.16)" : "var(--accent-soft)", color: koyu ? "#7cc4d6" : "var(--accent)", display: "grid", placeItems: "center", marginTop: 0 }}><Ikon ad="tik" boy={12} kalinlik={3} /></span>
      <span>{children}</span>
    </li>
  );
}

function FiyatSatiri({ p, yillik, koyu, dil }: { p: { ay: number; yil: number }; yillik: boolean; koyu?: boolean; dil: Dil }) {
  const t = FT[dil];
  const soluk = koyu ? "rgba(255,255,255,.62)" : "var(--muted)";
  const aylik = sent(yillik ? p.yil / 12 : p.ay);
  return (
    <div data-fiyat-tutar>
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px" }}>
        <span className="num" style={{ fontSize: "clamp(38px, 10vw, 48px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1 }}>{dolar(aylik, dil)}</span>
        <span style={{ fontSize: 14, color: soluk, fontWeight: 700 }}>{t.ay}</span>
        {yillik && <s className="num" style={{ fontSize: 14, color: soluk, fontWeight: 600 }}>{dolar(sent(p.ay), dil)}</s>}
      </div>
      <div style={{ fontSize: 12.5, color: soluk, fontWeight: 600, marginTop: 8, lineHeight: 1.5 }}>
        {yillik ? t.yillikAlt(dolar(sent(p.yil), dil)) : t.aylikAlt}
      </div>
    </div>
  );
}

export function Fiyat() {
  const dil = useDil();
  const t = FT[dil];
  const [yillik, setYillik] = useState(true);
  const [ekip, setEkip] = useState(4);
  const firmaAylik = yillik ? PAKET.firma.yil / 12 : PAKET.firma.ay;
  const kisiBasi = sent(firmaAylik / ekip);
  const ustaAylik = sent(yillik ? PAKET.usta.yil / 12 : PAKET.usta.ay);
  const soluk = "rgba(255,255,255,.62)";
  const cizgi = "rgba(255,255,255,.14)";
  const sayacDugme: React.CSSProperties = { width: 44, height: 44, border: "none", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 19, fontWeight: 700 };
  return (
    <div data-fiyat={yillik ? "yillik" : "aylik"}>
      <div className="flex justify-center">
        <div className="card flex items-center gap-1" style={{ borderRadius: 999, padding: 5, boxShadow: "none" }} role="group" aria-label={t.donem}>
          {([[t.aylik, false], [t.yillik, true]] as const).map(([ad, v]) => (
            <button key={String(v)} onClick={() => setYillik(v)} aria-pressed={yillik === v} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "10px 20px", fontWeight: 700, fontSize: 13.5, background: yillik === v ? "var(--ink)" : "transparent", color: yillik === v ? "#fff" : "var(--muted)" }}>{ad}</button>
          ))}
          <span className="pill ok" style={{ marginRight: 6 }}>{t.indirim}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 md:items-stretch">
        {/* USTA (Solo) */}
        <div data-paket="usta" className="card" style={{ borderRadius: 24, padding: "clamp(22px, 4vw, 30px)", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <b style={{ fontSize: 19, letterSpacing: "-0.02em" }}>{t.usta}</b>
            <span className="pill mute">{t.ustaRozet}</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600, margin: "6px 0 18px", lineHeight: 1.5 }}>{t.ustaAcik}</p>
          <FiyatSatiri p={PAKET.usta} yillik={yillik} dil={dil} />
          <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 11 }}>
            {t.ustaMadde.map((x) => <Madde key={x}>{x}</Madde>)}
          </ul>
          <div style={{ marginTop: "auto", paddingTop: 24 }}>
            <a href={KAYIT} className="btn btn-ghost" style={{ width: "100%", padding: "14px 20px" }}>{t.dene}</a>
          </div>
        </div>

        {/* FIRMA (Team) */}
        <div data-paket="firma" style={{ borderRadius: 24, padding: "clamp(22px, 4vw, 30px)", display: "flex", flexDirection: "column", background: "var(--ink)", color: "#fff", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <b style={{ fontSize: 19, letterSpacing: "-0.02em" }}>{t.firma}</b>
            <span style={{ fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#7cc4d6", color: "var(--ink)", whiteSpace: "nowrap" }}>{t.firmaRozet}</span>
          </div>
          <p style={{ fontSize: 14, color: soluk, fontWeight: 600, margin: "6px 0 18px", lineHeight: 1.5 }}>{t.firmaAcik}</p>
          <FiyatSatiri p={PAKET.firma} yillik={yillik} koyu dil={dil} />

          <div data-fiyat-ekip style={{ marginTop: 20, border: `1px solid ${cizgi}`, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>{t.ekip}</span>
              <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${cizgi}`, borderRadius: 10, overflow: "hidden", flex: "none" }}>
                <button aria-label={t.azalt} data-ekip="azalt" onClick={() => setEkip(Math.max(2, ekip - 1))} disabled={ekip <= 2} style={{ ...sayacDugme, opacity: ekip <= 2 ? 0.35 : 1 }}>−</button>
                <span className="num" aria-live="polite" style={{ width: 36, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{ekip}</span>
                <button aria-label={t.artir} data-ekip="artir" onClick={() => setEkip(Math.min(50, ekip + 1))} disabled={ekip >= 50} style={{ ...sayacDugme, opacity: ekip >= 50 ? 0.35 : 1 }}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cizgi}` }}>
              <span style={{ fontSize: 13, color: soluk, fontWeight: 600 }}>{t.kisiBasi}</span>
              <span><b data-kisi-basi className="num" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>{dolar(kisiBasi, dil)}</b><span style={{ fontSize: 12.5, color: soluk, fontWeight: 600 }}> {t.ay}</span></span>
            </div>
            <div data-fiyat-kiyas style={{ fontSize: 12.5, color: "#7cc4d6", fontWeight: 700, marginTop: 4, textAlign: "right" }}>
              {kisiBasi < ustaAylik ? t.ucuz(dolar(ustaAylik - kisiBasi, dil)) : t.ucuzDegil}
            </div>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 11 }}>
            {t.firmaMadde.map((x) => <Madde key={x} koyu>{x}</Madde>)}
          </ul>
          <div style={{ marginTop: "auto", paddingTop: 24 }}>
            <a href={KAYIT} className="btn" style={{ width: "100%", padding: "14px 20px", background: "#fff", color: "var(--ink)" }}>{t.dene}</a>
          </div>
        </div>
      </div>

      <div data-fiyat-guven style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", fontSize: 12.5, color: "var(--muted)", marginTop: 14, fontWeight: 700 }}>
        {t.guven.map((x) => (
          <span key={x} style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}><Ikon ad="tik" boy={12} kalinlik={3} style={{ color: "var(--accent)" }} />{x}</span>
        ))}
      </div>

      <div className="card mt-8" style={{ borderRadius: 24, padding: "clamp(22px, 4vw, 30px)", boxShadow: "none" }}>
        <div className="mini" style={{ color: "var(--muted)" }}>{t.dahilBaslik}</div>
        <ul className="grid gap-3 md:grid-cols-2 md:gap-x-8" style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
          {t.dahil.map((x) => <Madde key={x}>{x}</Madde>)}
        </ul>
        <div className="grid gap-2 md:grid-cols-2 md:gap-x-8" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
          {t.notlar.map(([b, x]) => <div key={b}><b style={{ color: "var(--ink)" }}>{b}</b> {x}</div>)}
        </div>
      </div>
    </div>
  );
}
