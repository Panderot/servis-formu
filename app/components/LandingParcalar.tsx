"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import RaporSayfa from "./RaporSayfa";
import Olcekli from "./Olcekli";
import Ikon from "./Ikon";
import { DEMO_FIRMA, DEMO_RAPORLAR, SABLONLAR, gecmis, hesapla, musteriler, tarihTR, telefonGoster, tl, waMetin } from "../lib/servis";

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

// ---------- Örnek rapor seçici: seçilen işin öne çıkan kısmına kayan A4 sayfa ----------
// "hedef" is the exact <h4> text of the block in RaporSayfa that the description talks about.
const ORNEKLER = [
  { no: "SR-2026-0048", ad: "Kombi bakımı", d: "Parça değişimi, KDV'li toplam, sonraki bakım tarihi.", hedef: "Parça ve işçilik", etiket: "Parça, KDV ve sonraki bakım" },
  { no: "SR-2026-0047", ad: "Klima bakımı", d: "Önce / sonra fotoğraflı, havale ile ödendi.", hedef: "Fotoğraflar", etiket: "Önce / sonra fotoğraflar" },
  { no: "SR-2026-0046", ad: "Beyaz eşya tamiri", d: "Uygulanmayan madde üstü çizili, ödeme bekliyor.", hedef: "Yapılan işlemler · kontrol listesi", etiket: "Yapılmayan madde çizili" },
  { no: "SR-2026-0045", ad: "Elektrik arızası", d: "Parça tablosu metre ve adetle.", hedef: "Parça ve işçilik", etiket: "Metre ve adetle parçalar" },
  { no: "SR-2026-0044", ad: "İlaçlama", d: "Site yönetimine, kontrol tarihiyle.", hedef: "Parça ve işçilik", etiket: "Sonraki kontrol tarihi" },
  { no: "SR-2026-0042", ad: "Garanti işi", d: "Parçalar listelenir, ücret yansıtılmaz.", hedef: "Parça ve işçilik", etiket: "Ücret yansıtılmaz" },
];
const IMZA_SPOT = { hedef: "Müşteri onayı", etiket: "Müşteri imzası" };
const TUR_MS = 5500;
type Spot = { hedef: string; etiket: string };
const hareketsiz = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function OrnekRapor() {
  const [i, setI] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null); // null = top of the page, no highlight
  const [kutu, setKutu] = useState<{ y: number; top: number; left: number; w: number; h: number } | null>(null);
  const [nabiz, setNabiz] = useState(0);
  const [gecis, setGecis] = useState(false);
  const [gorunur, setGorunur] = useState(false);
  const [tur, setTur] = useState<"acik" | "durdu" | "bitti">("acik");
  const kok = useRef<HTMLDivElement>(null);
  const pencere = useRef<HTMLDivElement>(null);
  const kayan = useRef<HTMLDivElement>(null);
  const r = DEMO_RAPORLAR.find((x) => x.no === ORNEKLER[i].no)!;

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
  }, [spot]);

  useEffect(() => {
    const t = setTimeout(olc, 60);
    const ro = new ResizeObserver(() => olc());
    if (kayan.current) ro.observe(kayan.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [olc, i]);

  // Replay the ring pulse whenever the highlighted block changes.
  useEffect(() => {
    if (spot) setNabiz((n) => n + 1);
  }, [spot]);

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
    const yeni = { hedef: ORNEKLER[j].hedef, etiket: ORNEKLER[j].etiket };
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
    const t = setTimeout(() => setSpot({ hedef: ORNEKLER[0].hedef, etiket: ORNEKLER[0].etiket }), 1200);
    return () => clearTimeout(t);
  }, [gorunur, spot]);

  // Auto tour: one round through the examples while the section is on screen; any touch stops it.
  useEffect(() => {
    if (tur !== "acik" || !gorunur || !spot || hareketsiz()) return;
    if (i === ORNEKLER.length - 1) {
      setTur("bitti");
      return;
    }
    const t = setTimeout(() => sec(i + 1, false), TUR_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, spot, tur, gorunur]);

  const imzaya = () => {
    setTur("durdu");
    setSpot(IMZA_SPOT);
  };
  const ilerliyor = tur === "acik" && gorunur && !!spot;

  return (
    <div ref={kok} data-ornek={i} data-tur={tur} data-spot={spot ? spot.hedef : ""} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, margin: "0 0 10px 4px" }}>Bir iş seç, raporunu gör.</div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {ORNEKLER.map((o, j) => {
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
          <span style={{ fontSize: 12.5, fontWeight: 700 }}><span className="mini" style={{ color: "var(--accent)", marginRight: 6 }}>Örnek</span>{r.no} · {r.musteri.ad}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <span className="pill" style={{ background: "#fff" }}>A4</span>
            <span className="pill" style={{ background: "#fff" }}>PDF</span>
            <button type="button" className="pill ok or-imza" onClick={imzaya} aria-label="İmzaya git">İmzalı<Ikon ad="asagi" boy={11} kalinlik={3} /></button>
          </span>
        </div>
        <div ref={pencere} onPointerDown={() => setTur("durdu")} style={{ maxHeight: 640, maxWidth: 635, margin: "0 auto", overflow: "hidden", borderRadius: "10px 10px 0 0", boxShadow: "var(--shadow-md)" }}>
          <div ref={kayan} className="or-kayan" style={{ transform: `translateY(${-(kutu ? kutu.y : 0)}px)`, opacity: gecis ? 0 : 1 }}>
            <Olcekli max={0.8}><RaporSayfa r={r} f={DEMO_FIRMA} /></Olcekli>
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
const OZEL_SABLON = {
  id: "ozel",
  ad: "Asansör periyodik bakım",
  cihazTuru: "Asansör",
  maddeler: ["Fren sistemi kontrol edildi", "Kapı kilitleri ve emniyet devresi test edildi", "Halat ve makaralar kontrol edilip yağlandı", "Kabin aydınlatması ve acil alarm butonu test edildi"],
};
type SablonAdim = { t: "ad" | "tur" | "ekle" | "harf" | "ac" | "kaydet"; ms: number };
// One step per typed character; "ms" is the wait before the step.
const SABLON_ADIMLAR: SablonAdim[] = [
  ...Array.from(OZEL_SABLON.ad, (_, k): SablonAdim => ({ t: "ad", ms: k === 0 ? 300 : 32 })),
  ...Array.from(OZEL_SABLON.cihazTuru, (): SablonAdim => ({ t: "tur", ms: 40 })),
  ...OZEL_SABLON.maddeler.flatMap((m): SablonAdim[] => [{ t: "ekle", ms: 180 }, ...Array.from(m, (): SablonAdim => ({ t: "harf", ms: 24 })), { t: "ac", ms: 220 }]),
  { t: "kaydet", ms: 350 },
];

function sablonDurumu(n: number) {
  let ad = 0, tur = 0, satir = 0, acik = 0, kayit = false;
  const harf = [0, 0, 0, 0];
  for (let k = 0; k < n; k++) {
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
  const SON = SABLON_ADIMLAR.length;
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
      SABLON_ADIMLAR.forEach((a, k) => {
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
    setN(SON);
    setTost(false);
    setDemo((d) => (d === "statik" ? d : "bitti"));
    setSecili(id);
  };

  const d = sablonDurumu(n);
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
          {([["belge", "Şablon adı", ad, d.ad, "ad"], ["anahtar", "Cihaz türü", tur, d.tur, "tur"]] as const).map(([ik, k, v, adet, alan]) => (
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
          <Ikon ad="arti" boy={14} />{hazir ? `${hazir.maddeler.length - 4} madde daha` : "Madde ekle"}
        </div>
      </div>
      <div className="card" style={{ borderRadius: 20, padding: 12, position: "relative" }}>
        <div className="mini" style={{ padding: "4px 6px 8px" }}>Hazır şablonlar</div>
        {SABLONLAR.map((s) => {
          const on = secili === s.id;
          return (
            <button key={s.id} type="button" className="se-sablon" aria-pressed={on} onClick={() => sec(s.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent-soft)" : "#fff", color: on ? "var(--accent-ink)" : "var(--ink)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, fontSize: 13, fontWeight: 700, fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="liste" boy={14} style={{ color: on ? "var(--accent)" : "var(--faint)" }} />{s.ad}</span>
              <span className="num" style={{ fontSize: 11, color: on ? "var(--accent)" : "var(--faint)" }}>{s.maddeler.length} madde</span>
            </button>
          );
        })}
        <button type="button" className={d.kayit ? "se-sablon se-ozel" : "se-sablon se-ozel se-sakli"} aria-pressed={secili === "ozel"} onClick={() => sec("ozel")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "var(--ink)", color: "#fff", border: "1px solid var(--ink)", borderRadius: 10, padding: "9px 10px", fontSize: 13, fontWeight: 800, fontFamily: "inherit", textAlign: "left", cursor: "pointer", boxShadow: secili === "ozel" ? "0 0 0 3px var(--accent-soft)" : "none" }}>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="tik" boy={14} kalinlik={2.6} />{OZEL_SABLON.ad}</span>
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.6)" }}>senin</span>
        </button>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "10px 6px 2px" }}>Maddelerini görmek için bir şablon seç.</div>
        <div className={tost ? "se-tost se-tost-on" : "se-tost"} role="status">
          <Ikon ad="tik" boy={13} kalinlik={3} />Şablon eklendi
        </div>
      </div>
    </div>
  );
}

// ---------- Müşteri geçmişi: numara yazılır, kayıtlı müşteri bulunur, kart ve geçmiş açılır ----------
const MG_MUSTERI = musteriler(DEMO_RAPORLAR).find((m) => m.ad === "Ayşe Kaplan")!;
const MG_GECMIS = gecmis(DEMO_RAPORLAR, MG_MUSTERI.anahtar).slice(0, 2);
const MG_TEL = telefonGoster(MG_MUSTERI.telefon);
const MG_MADDELER = [
  ["Numarayla tüm servis geçmişi", "Hangi cihaza ne zaman bakıldı, hangi parça değişti, ne kadar ödendi."],
  ["Kayıtlı cihaz tek dokunuşla forma", "Marka, model ve seri numarası yeni forma otomatik gelir."],
  ["Sonraki bakım tarihi kayıtta", "Tarih raporda yazar, panelinde yaklaşan bakımlar listesine düşer."],
  ["Bekleyen tahsilat gözden kaçmaz", "Ödemesi alınmamış raporlar ayrı rozetle işaretlenir."],
];
// Stage switch times (ms after the start). Stage: 1 found, 2 card, 3 first row, 4 second row,
// 5 device, 6 next service, 7 "Bekleyen" highlight, 8 done.
const MG_ZAMAN = [1100, 1450, 1900, 2150, 2800, 3450, 4100, 5000];
const mgTutar = (n: number) => tl(Math.round(n)).replace(",00", "");

function MgDurum({ odeme }: { odeme: string }) {
  if (odeme === "bekliyor") return <span className="pill warn">Ödeme bekliyor</span>;
  if (odeme === "garanti") return <span className="pill info">Garanti</span>;
  return <span className="pill ok">Ödendi</span>;
}

export function MusteriGecmisi() {
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
      for (let i = 1; i <= MG_TEL.length; i++) zaman.push(setTimeout(() => setHarf(i), 300 + (i - 1) * 55));
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
  const ac = (k: number) => (asama >= k ? " mg-on" : "");
  const isaret = [2, 5, 6, 7]; // stage that ticks each list item
  const cihaz = MG_MUSTERI.cihazlar[0];
  const sonBakim = MG_GECMIS[0].sonrakiBakim;

  return (
    <div ref={kok} data-musteri={demo} data-musteri-asama={asama} className="mt-12 grid items-center gap-10 md:grid-cols-2" style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(20px, 4vw, 44px)" }}>
      <div>
        <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>“Geçen yıl kombiye ne yapmıştınız?” sorusunu arşiv karıştırmadan yanıtla.</h3>
        <div style={{ marginTop: 20 }}>
          {MG_MADDELER.map(([t, d], i) => (
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
            {MG_TEL.slice(0, harf)}
            {yaziyor && <span className="se-imlec" aria-hidden="true" />}
            <span className="se-gizli" aria-hidden="true">{MG_TEL.slice(harf)}</span>
          </span>
          <span className="pill ok mg-bulundu" style={{ marginLeft: "auto", display: "inline-flex", gap: 5, alignItems: "center", padding: "4px 10px", fontSize: 11 }}><Ikon ad="tik" boy={11} kalinlik={3} />Kayıtlı müşteri bulundu</span>
        </div>
        <div className={`card mg-kart${ac(2)}`} style={{ marginTop: 12, marginRight: 30, borderRadius: 14, padding: "16px 16px 22px", boxShadow: "var(--shadow-md)" }}>
          <div className="mini">Müşteri kartı</div>
          <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{MG_MUSTERI.ad}</div>
          <div className="num" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{MG_TEL} · Bornova</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
            {[["Servis", String(Math.round(MG_MUSTERI.sayi * sayac))], ["Toplam", mgTutar(MG_MUSTERI.toplam * sayac)], ["Bekleyen", mgTutar(MG_MUSTERI.bekleyen)]].map(([k, v], i) => (
              <div key={k} className={i === 2 && asama === 7 ? "mg-kutu mg-vurgu" : "mg-kutu"} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 9, padding: "7px 9px" }}><div className="mini" style={{ fontSize: 8.5 }}>{k}</div><div className="num" style={{ fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>{v}</div></div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 8 }}>
            <div className="mini" style={{ fontSize: 8.5 }}>Servis geçmişi</div>
            {MG_GECMIS.map((r, i) => (
              <div key={r.no} className={`mg-satir${ac(3 + i)}`} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}><span className="num">{tarihTR(r.tarih)}</span> · {r.hizmet}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{r.cihaz.marka} · {r.parcalar.length ? r.parcalar.map((p) => p.ad).join(", ") : "parça değişmedi"}</div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="num" style={{ fontSize: 12, fontWeight: 800 }}>{mgTutar(hesapla(r).toplam)}</div>
                  <MgDurum odeme={r.odeme} />
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
              <div><div className="mini" style={{ fontSize: 8.5 }}>Sonraki bakım</div><div className="num" style={{ fontSize: 12.5, fontWeight: 800 }}>{tarihTR(sonBakim)} · {cihaz.tur.toLocaleLowerCase("tr-TR")}</div></div>
            </div>
          </div>
          <div className="suz" style={{ marginLeft: "auto", maxWidth: 250 }}>
            <div className={`card mg-yuz${ac(5)}`} style={{ borderRadius: 12, padding: "9px 12px", boxShadow: "var(--shadow-md)" }}>
              <div className="mini" style={{ fontSize: 8.5 }}>Kayıtlı cihaz</div>
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
const WA_RAPOR = DEMO_RAPORLAR.find((r) => r.no === "SR-2026-0048")!;
const WA_METIN = waMetin(WA_RAPOR, DEMO_FIRMA);
// Stage switch times (ms after the start): 1 send pressed, 2 message sent, 3 chat scrolls,
// 4 PDF arrives + delivered ticks, 5 done.
const WA_ZAMAN = [700, 1000, 2200, 4000, 4600];
const WA_OZELLIK = [
  ["indir", "PDF olarak kaydet", "Telefonun yazdırma ekranından A4 PDF; Android ve iPhone'da aynı adımlar.", 4],
  ["mesaj", "Hazır mesaj", "Numara 05xx biçiminde yazılsa da doğru formata çevrilir; mesajı göndermeden önce kontrol edersin.", 2],
] as const;

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
        <span className="pill ok" style={{ fontSize: 11.5, padding: "4px 10px" }}>Müşterinin her gün kullandığı kanaldan</span>
        <h2 className="h2 mt-4">Rapor müşteriye WhatsApp&apos;tan ulaşır.</h2>
        <p className="sub mt-4" style={{ maxWidth: 460 }}>Tek dokunuşla müşterinin WhatsApp sohbeti hazır bir mesajla açılır: rapor numarası, yapılan işlemler, değişen parçalar, KDV dahil toplam ve teknisyen. İmzalı PDF&apos;i aynı sohbete eklersin.</p>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {WA_OZELLIK.map(([ik, t, d, k]) => (
            <div key={t} className={`wa-ozellik${ac(k)}`} style={{ display: "flex", gap: 12 }}>
              <span className="doc-ico wa-ikon" style={{ width: 34, height: 34 }}><Ikon ad={ik} boy={16} /></span>
              <div><div style={{ fontWeight: 800, fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn">İlk raporu oluştur</a>
          <a href="#rapor" className="btn btn-ghost">Örnek raporları gör</a>
        </div>
      </div>
      <div style={{ background: "var(--dark)", borderRadius: 22, padding: "36px 16px 0", display: "flex", justifyContent: "center", overflow: "hidden", height: 470 }}>
        <div style={{ width: 290, background: "#fff", borderRadius: "40px 40px 0 0", padding: "6px 6px 0" }}>
          <div style={{ background: "#efeae2", borderRadius: "34px 34px 0 0", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#fff", padding: "16px 14px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)", flex: "none" }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, background: "var(--tile)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, color: "var(--muted)" }}>AK</span>
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
                      <span style={{ display: "block", fontSize: 9, color: "#5f7284", fontWeight: 600 }}>1 sayfa · PDF</span>
                    </span>
                  </div>
                  <WaSaat cift={asama >= 4} />
                </div>
              </div>
            </div>
            <div style={{ flex: "none", display: "flex", gap: 6, alignItems: "center", padding: "8px 8px 10px" }}>
              <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: 18, padding: "8px 12px", fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: asama < 2 ? "#1c2735" : "#94a3b2" }}>
                {asama < 2 ? WA_METIN.split("\n").slice(0, 2).join(" ").replace(/\*/g, "") : "Mesaj"}
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

// ---------- Fiyat: tek paket, tek kart (solda fiyat ve teknisyen sayacı, sağda dahil olanlar) ----------
const FIYAT = 299;
const DAHIL = [
  "Sınırsız servis raporu: yoğun ayda da aynı fiyat",
  "5 hazır kontrol listesi ve istediğin kadar kendi şablonun",
  "Logolu, kurumsal A4 rapor; tek dokunuşla PDF",
  "Müşterinin WhatsApp'ına hazır rapor mesajı",
  "İtirazı bitiren kanıt: önce / sonra fotoğraf ve imza",
  "Numarayla müşteri geçmişi, kayıtlı cihazlar, arşiv arama",
  "Tahsil bekleyenler ve yaklaşan bakımlar tek ekranda",
  "Tek dosyalık yedek: telefon değişse de kayıtların seninle",
];
export function Fiyat() {
  const [yillik, setYillik] = useState(false);
  const [n, setN] = useState(2);
  const aylik = yillik ? (FIYAT * 10) / 12 : FIYAT;
  const toplam = aylik * n;
  const soluk = "rgba(255,255,255,.62)";
  const cizgi = "rgba(255,255,255,.14)";
  return (
    <div>
      <div className="flex justify-center">
        <div className="card flex items-center gap-1" style={{ borderRadius: 999, padding: 5, boxShadow: "none" }} role="group" aria-label="Ödeme dönemi">
          {[["Aylık", false], ["Yıllık", true]].map(([t, v]) => (
            <button key={String(t)} onClick={() => setYillik(v as boolean)} aria-pressed={yillik === v} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 18px", fontWeight: 700, fontSize: 13, background: yillik === v ? "var(--ink)" : "transparent", color: yillik === v ? "#fff" : "var(--muted)" }}>{t as string}</button>
          ))}
          <span className="pill ok" style={{ marginRight: 6 }}>2 ay hediye</span>
        </div>
      </div>

      <div className="card mt-6 grid overflow-hidden md:grid-cols-[1fr_1.15fr]" style={{ borderRadius: 24, padding: 0, boxShadow: "var(--shadow-md)" }}>
        <div style={{ background: "var(--ink)", color: "#fff", padding: "clamp(24px, 4vw, 34px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <b style={{ fontSize: 17 }}>Teknisyen paketi</b>
            <span style={{ fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.1)", color: "#fff" }}>3 gün ücretsiz</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 10px", marginTop: 18 }}>
            <span className="num" style={{ fontSize: "clamp(40px, 11vw, 52px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1 }}>{tl(aylik, false).replace(",00", "")} TL</span>
            <span style={{ fontSize: 13, color: soluk, fontWeight: 600 }}>/ ay, teknisyen başı</span>
          </div>
          <div style={{ fontSize: 13, color: soluk, fontWeight: 600, marginTop: 8 }}>
            {yillik ? (<><s className="num">{FIYAT} TL</s> · yıllık {tl(FIYAT * 10)} peşin · KDV hariç</>) : "Aylık ödeme · KDV hariç"}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 26 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Teknisyen sayısı</span>
            <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${cizgi}`, borderRadius: 10, overflow: "hidden" }}>
              <button aria-label="Azalt" onClick={() => setN(Math.max(1, n - 1))} style={{ width: 38, height: 36, border: "none", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>−</button>
              <span className="num" style={{ width: 40, textAlign: "center", fontWeight: 800 }}>{n}</span>
              <button aria-label="Artır" onClick={() => setN(Math.min(50, n + 1))} style={{ width: 38, height: 36, border: "none", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>+</button>
            </div>
          </div>
          <div style={{ marginTop: 14, borderTop: `1px solid ${cizgi}`, paddingTop: 14, fontSize: 13.5, fontWeight: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: soluk }}>{n} teknisyen, aylık</span><span className="num">{tl(toplam)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span style={{ color: soluk }}>KDV dahil (%20)</span><b className="num" style={{ fontSize: 15 }}>{tl(toplam * 1.2)}</b></div>
          </div>
          <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn" style={{ width: "100%", marginTop: 24, padding: "14px 20px", background: "#fff", color: "var(--ink)" }}>3 gün ücretsiz dene</a>
          <div style={{ fontSize: 12, color: soluk, textAlign: "center", marginTop: 12, fontWeight: 600 }}>Kart istemez · Sözleşme yok · Rapor başına ücret yok</div>
        </div>

        <div style={{ padding: "clamp(24px, 4vw, 34px)" }}>
          <div className="mini" style={{ color: "var(--muted)" }}>Pakete dahil, ek ücret yok</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 12 }}>
            {DAHIL.map((x) => (
              <li key={x} style={{ display: "flex", gap: 11, alignItems: "flex-start", fontSize: 14, fontWeight: 600 }}>
                <span style={{ flex: "none", width: 20, height: 20, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", marginTop: 0 }}><Ikon ad="tik" boy={12} kalinlik={3} /></span>{x}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", display: "grid", gap: 7, fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
            <div><b style={{ color: "var(--ink)" }}>E-fatura değildir.</b> Fixnote iş teslim raporu üretir; faturanı bugünkü yönteminle kesersin.</div>
            <div><b style={{ color: "var(--ink)" }}>Bulut arşivi isteğe bağlı.</b> Kayıtlar telefonunda durur; merkezi arşiv istenirse kurulumda eklenir.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
