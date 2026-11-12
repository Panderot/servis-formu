"use client";
/* eslint-disable @next/next/no-img-element */
import { useDil } from "../lib/dil";
import { SATICI, YASAL_LINKLER } from "../lib/satici";

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

// One line with the seller's details (footers).
export function SaticiSatiri({ koyu }: { koyu?: boolean }) {
  const dil = useDil();
  const s = SATICI;
  const en = dil === "en";
  return (
    <p data-satici style={{ margin: 0, fontSize: 12, fontWeight: 500, lineHeight: 1.6, color: koyu ? "rgba(255,255,255,.55)" : "var(--muted)" }}>
      {en ? `Seller: ${s.ad} (sole proprietorship, brand ${s.marka})` : `Satıcı: ${s.ad} (şahıs işletmesi, marka ${s.marka})`}
      {" · "}
      {en ? `Tax office / no.: ${s.vergiDairesi} / ${s.vkn}` : `Vergi dairesi / VKN: ${s.vergiDairesi} / ${s.vkn}`}
      {" · "}
      {s.adres}
      {" · "}
      <a href={`mailto:${s.eposta}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{s.eposta}</a>
      {" · "}
      {s.telefon}
    </p>
  );
}

// Footer of the legal pages: links, seller details and the payment logos.
export default function YasalAlt() {
  const dil = useDil();
  const en = dil === "en";
  return (
    <footer className="ys-alt-blok">
      <nav className="ys-alt" aria-label={en ? "Legal pages" : "Yasal sayfalar"}>
        {YASAL_LINKLER.map(([h, tr, e]) => <a key={h} href={h}>{en ? e : tr}</a>)}
        <a href="/">{en ? "Home" : "Ana sayfa"}</a>
      </nav>
      <div style={{ textAlign: "center", marginTop: 6 }}><SaticiSatiri /></div>
      <div style={{ marginTop: 18 }}><OdemeLogolari /></div>
    </footer>
  );
}
