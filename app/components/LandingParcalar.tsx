"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RaporSayfa from "./RaporSayfa";
import Olcekli from "./Olcekli";
import Ikon from "./Ikon";
import { DEMO_FIRMA, DEMO_RAPORLAR, tl } from "../lib/servis";

// ---------- Süre hesaplayıcı (referanstaki "kaç saat" kaydırıcıları) ----------
const YENI_DK = 2; // Fixnote ile rapor başına varsayılan süre (dakika): açıkça yazılı varsayım

export function SureHesap() {
  const [adet, setAdet] = useState(60);
  const [dk, setDk] = useState(15);
  const bugun = (adet * dk) / 60;
  const yeni = (adet * YENI_DK) / 60;
  const kazanc = Math.max(0, bugun - yeni);
  const gun = Math.round((kazanc * 12) / 8);
  const s = (n: number) => (n >= 10 ? Math.round(n).toString() : n.toFixed(1).replace(".", ","));
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "22px 22px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label htmlFor="h-adet" style={{ fontWeight: 500, fontSize: 13.5, color: "var(--muted)" }}>Ayda kaç servis raporu</label>
          <b className="num font-display" style={{ fontSize: 22, fontWeight: 600 }}>{adet}</b>
        </div>
        <input id="h-adet" className="range" type="range" min={10} max={200} step={5} value={adet} onChange={(e) => setAdet(+e.target.value)} style={{ marginTop: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 22 }}>
          <label htmlFor="h-dk" style={{ fontWeight: 500, fontSize: 13.5, color: "var(--muted)" }}>Rapor başına bugün harcanan</label>
          <b className="num font-display" style={{ fontSize: 22, fontWeight: 600 }}>{dk} dk</b>
        </div>
        <input id="h-dk" className="range" type="range" min={5} max={45} step={1} value={dk} onChange={(e) => setDk(+e.target.value)} style={{ marginTop: 12 }} />
      </div>
      <div style={{ background: "var(--panel)", borderTop: "1px solid var(--line)", padding: "16px 22px 20px", marginTop: 18 }}>
        <div className="mini" style={{ color: "var(--muted)" }}>Raporlara giden süre, ayda</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginTop: 10 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 7, padding: "10px 12px", textAlign: "center" }}>
            <div className="mini">Bugün</div>
            <div className="num font-display" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{s(bugun)} sa</div>
          </div>
          <Ikon ad="ok" boy={16} style={{ color: "var(--faint)" }} />
          <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 7, padding: "10px 12px", textAlign: "center" }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.75)" }}>Fixnote ile</div>
            <div className="num font-display" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{s(yeni)} sa</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14, fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
          <span>Ayda <b style={{ color: "var(--ink)" }}>{s(kazanc)} saat</b> geri kazanırsın</span>
          <span className="pill mute nodot" style={{ fontSize: 11.5 }}>yılda ≈ {gun} iş günü</span>
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
    <div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500, margin: "0 0 10px 2px" }}>Bir iş seç, raporunu gör.</div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {ORNEKLER.map((o, j) => {
          const on = i === j;
          return (
            <button key={o.no} onClick={() => setI(j)} aria-pressed={on} style={{ textAlign: "left", cursor: "pointer", borderRadius: 7, padding: "11px 12px", border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`, background: on ? "var(--ink)" : "#fff", color: on ? "#fff" : "var(--ink)", display: "flex", flexDirection: "column", gap: 7 }}>
              <span className="num" style={{ width: 20, height: 20, borderRadius: 4, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, background: on ? "rgba(255,255,255,.14)" : "var(--tile)", color: on ? "#fff" : "var(--muted)" }}>{j + 1}</span>
              <span style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }}>{o.ad}</span>
              <span style={{ fontSize: 11.5, color: on ? "rgba(255,255,255,.72)" : "var(--muted)", lineHeight: 1.35 }}>{o.d}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 18, background: "var(--panel)", borderRadius: 10, padding: "16px 16px 0", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap", maxWidth: 635, marginLeft: "auto", marginRight: "auto" }}>
          <span className="num" style={{ fontSize: 12.5, fontWeight: 600 }}><span className="mini" style={{ color: "var(--accent)", marginRight: 6 }}>Örnek</span>{r.no} · {r.musteri.ad}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <span className="pill mute nodot" style={{ background: "#fff" }}>A4</span>
            <span className="pill mute nodot" style={{ background: "#fff" }}>PDF</span>
            <span className="pill ok">İmzalı</span>
          </span>
        </div>
        <div style={{ maxHeight: 640, maxWidth: 635, margin: "0 auto", overflow: "hidden", borderRadius: "8px 8px 0 0", boxShadow: "var(--shadow-md)" }}>
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
    <span key={i} className="sf-dongu font-display" style={{ display: "inline-block" }}>
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
        <div className="card flex flex-wrap items-center gap-x-3 gap-y-2" style={{ padding: "8px 8px 8px 16px" }}>
          <b style={{ fontSize: 14 }}>Deneme</b>
          <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>14 gün · tüm özellikler · kart istemez</span>
          <Link href="/app?yeni=1" className="btn btn-dark" style={{ padding: "9px 16px", fontSize: 13 }}>Denemeye başla</Link>
        </div>
        <div className="card flex items-center gap-1 self-start md:self-auto" style={{ padding: 5 }} role="group" aria-label="Ödeme dönemi">
          {[["Aylık", false], ["Yıllık", true]].map(([t, v]) => (
            <button key={String(t)} onClick={() => setYillik(v as boolean)} aria-pressed={yillik === v} style={{ border: "none", cursor: "pointer", borderRadius: 5, padding: "8px 16px", fontWeight: 600, fontSize: 13, background: yillik === v ? "var(--ink)" : "transparent", color: yillik === v ? "#fff" : "var(--muted)" }}>{t as string}</button>
          ))}
          <span className="pill ok nodot" style={{ marginRight: 6 }}>2 ay hediye</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <div className="card" style={{ padding: 26, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ fontSize: 17 }}>Teknisyen</b>
            <span className="pill acc nodot">En çok seçilen</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
            <span className="num font-display" style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em" }}>{tl(aylik, false).replace(",00", "")} TL</span>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>/ ay, teknisyen başı</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 500 }}>KDV hariç{yillik ? `, yıllık ${tl(FIYAT * 10)} peşin` : ""}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
            <span className="mini" style={{ color: "var(--muted)" }}>Teknisyen</span>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 6, overflow: "hidden" }}>
              <button aria-label="Azalt" onClick={() => setN(Math.max(1, n - 1))} style={{ width: 36, height: 34, border: "none", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 600 }}>−</button>
              <span className="num" style={{ width: 38, textAlign: "center", fontWeight: 700 }}>{n}</span>
              <button aria-label="Artır" onClick={() => setN(Math.min(50, n + 1))} style={{ width: 36, height: 34, border: "none", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 600 }}>+</button>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 7, padding: "12px 14px", fontSize: 13.5, fontWeight: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>{n} teknisyen, aylık</span><span className="num">{tl(toplam)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span style={{ color: "var(--muted)" }}>KDV dahil (%20)</span><b className="num">{tl(toplam * 1.2)}</b></div>
          </div>
          <Link href="/app?yeni=1" className="btn" style={{ width: "100%", marginTop: 18, padding: "14px 20px" }}>İlk raporu oluştur</Link>
          <div style={{ fontSize: 12, color: "var(--faint)", textAlign: "center", marginTop: 10, fontWeight: 500 }}>Rapor başına ücret yok, sözleşme yok.</div>
        </div>

        <div className="card" style={{ padding: 26 }}>
          <div className="mini" style={{ color: "var(--muted)" }}>Dahil olanlar</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 11 }}>
            {DAHIL.map((x) => (
              <li key={x} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, fontWeight: 500 }}>
                <Ikon ad="tik" boy={17} kalinlik={2.4} style={{ color: "var(--accent)", marginTop: 1 }} />{x}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)", display: "grid", gap: 9 }}>
            {["Merkezi bulut arşivi (kurulumda eklenir)", "E-fatura (bu bir iş teslim raporudur)"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "var(--faint)", fontWeight: 500 }}><Ikon ad="carpi" boy={16} style={{ marginTop: 1 }} />{x}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
