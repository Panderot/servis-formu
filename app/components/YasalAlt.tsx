"use client";
/* eslint-disable @next/next/no-img-element */
import { useDil } from "../lib/dil";
import { FIXNOTE_LINKLER, SATICI, YASAL_LINKLER, type Baglanti } from "../lib/satici";

// iyzico's official logo band (iyzico ile Öde, Mastercard, Visa, American Express, Troy), from iyzico's
// logo pack, unchanged: only scaled. White version on dark backgrounds. Files: public/odeme/.
export function OdemeLogolari({ koyu, yazi, genislik = 300 }: { koyu?: boolean; yazi?: boolean; genislik?: number }) {
  const dil = useDil();
  return (
    <div data-odeme-logolari style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <img
        src={koyu ? "/odeme/logo_band_white.svg" : "/odeme/logo_band_colored.svg"}
        alt={dil === "en" ? "Pay with iyzico, Mastercard, Visa, American Express, Troy" : "iyzico ile Öde, Mastercard, Visa, American Express, Troy"}
        width={429}
        height={32}
        style={{ display: "block", width: "100%", maxWidth: genislik, height: "auto" }}
      />
      {yazi && (
        <span style={{ fontSize: 12.5, fontWeight: 600, color: koyu ? "rgba(255,255,255,.62)" : "var(--faint)" }}>
          {dil === "en" ? "Secure payment with iyzico" : "iyzico güvencesiyle ödeme"}
        </span>
      )}
    </div>
  );
}

// Footer block shared by the landing page (dark) and the legal pages (light): three columns (Fixnote, Yasal,
// Satıcı), then a thin rule with "© 2026 MotiqAI" on the left and the payment logos on the right. On phones the
// columns stack and the bottom row is centred. anaSayfa: also link back to the home page (legal pages).
export function AltBilgi({ koyu, anaSayfa }: { koyu?: boolean; anaSayfa?: boolean }) {
  const dil = useDil();
  const en = dil === "en";
  const s = SATICI;
  const renk = koyu
    ? { metin: "rgba(255,255,255,.66)", baslik: "rgba(255,255,255,.45)", cizgi: "rgba(255,255,255,.12)", ust: "hover:text-white" }
    : { metin: "var(--muted)", baslik: "var(--faint)", cizgi: "var(--line)", ust: "hover:text-[var(--ink)]" };
  const fixnote: Baglanti[] = anaSayfa ? [...FIXNOTE_LINKLER, ["/", "Ana sayfa", "Home"]] : FIXNOTE_LINKLER;
  // The brand name keeps a dotless capital I when the heading is upper-cased ("FIXNOTE", not "FİXNOTE").
  const sutun = (baslik: string, icerik: React.ReactNode) => (
    <div>
      <div className="mini" lang={baslik === "Fixnote" ? "en" : undefined} style={{ color: renk.baslik }}>{baslik}</div>
      {icerik}
    </div>
  );
  const liste = (l: Baglanti[]) => (
    <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
      {l.map(([h, tr, e]) => <li key={h}><a href={h} className={renk.ust}>{en ? e : tr}</a></li>)}
    </ul>
  );
  return (
    <div data-alt-bilgi style={{ color: renk.metin }}>
      <div className="grid gap-9 md:grid-cols-[0.8fr_1.2fr_1.5fr] md:gap-8">
        {sutun("Fixnote", <nav aria-label="Fixnote">{liste(fixnote)}</nav>)}
        {sutun(en ? "Legal" : "Yasal", <nav aria-label={en ? "Legal pages" : "Yasal sayfalar"}>{liste(YASAL_LINKLER)}</nav>)}
        {sutun(en ? "Seller" : "Satıcı", (
          <address data-satici style={{ fontStyle: "normal", margin: "12px 0 0", display: "grid", gap: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
            <span>{en ? `${s.ad} (sole proprietorship, brand ${s.marka})` : `${s.ad} (şahıs işletmesi, marka ${s.marka})`}</span>
            <span>{en ? `Tax office / no.: ${s.vergiDairesi} / ${s.vkn}` : `Vergi dairesi / VKN: ${s.vergiDairesi} / ${s.vkn}`}</span>
            <span>{s.adres}</span>
            <span><a href={`mailto:${s.eposta}`} className={renk.ust}>{s.eposta}</a> · {s.telefon}</span>
          </address>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left" style={{ borderTop: `1px solid ${renk.cizgi}`, marginTop: 32, paddingTop: 18, fontSize: 12, fontWeight: 600 }}>
        <span>© 2026 MotiqAI</span>
        <div style={{ width: "100%", maxWidth: 300 }}><OdemeLogolari koyu={koyu} /></div>
      </div>
    </div>
  );
}

// Footer of the legal pages.
export default function YasalAlt() {
  return (
    <footer className="ys-alt-blok">
      <AltBilgi anaSayfa />
    </footer>
  );
}
