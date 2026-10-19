"use client";
import { useState } from "react";
import Ikon from "./Ikon";
import type { Dil, Firma } from "../lib/servis";
import { kvkkMetni, kvkkNotu } from "../lib/kvkk";

// Settings card "Müşteri bilgilendirmesi": the business is the controller of its customers' details,
// so it must inform them. A short note under every report (Firma.kvkkNot) and a full notice to copy.
// Both texts are in the report language, because they are for the business's customers.
export default function MusteriBilgiKarti({ f, dil, raporDil, onNot }: { f: Firma; dil: Dil; raporDil: Dil; onNot: (acik: boolean) => void }) {
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [metinAcik, setMetinAcik] = useState(false);
  const [not, setNot] = useState("");
  const metin = kvkkMetni(f, raporDil);
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(metin);
      setNot(c("Metin kopyalandı", "Text copied"));
    } catch {
      setNot(c("Kopyalanamadı; metni seçip kopyala.", "Couldn't copy; select the text and copy it."));
    }
  };
  return (
    <div className="card" data-musteri-bilgi style={{ padding: 18, marginTop: 14 }}>
      <div className="p-kbas">
        <span className="p-kikon"><Ikon ad="kisiler" boy={17} /></span>
        <div style={{ minWidth: 0 }}>
          <h2>{c("Müşteri bilgilendirmesi (KVKK)", "Informing your customers (privacy)")}</h2>
          <p>{c("Müşterilerinin bilgilerinin sorumlusu sensin; onları bilgilendirmek de senin yükümlülüğün. Bunu kolaylaştırmak için kısa bir not ve tam bir metin taslağı hazırladık. Kendi işine uygunluğunu bir hukukçuya kontrol ettirmeni öneririz.", "You are responsible for your customers' details, and informing them is your duty. To make it easier, here are a short note and a full draft notice. We recommend having a lawyer check that they fit your business.")}</p>
        </div>
      </div>

      <label data-kvkk-not-ac style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
        <input type="checkbox" checked={!!f.kvkkNot} onChange={(e) => onNot(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flex: "none", accentColor: "var(--accent)" }} />
        <span>{c("Raporun altına kısa KVKK notu ekle", "Add a short privacy note under reports")}</span>
      </label>
      <div lang={raporDil} style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "var(--panel)", border: "1px solid var(--line)", fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, opacity: f.kvkkNot ? 1 : 0.6 }}>{kvkkNotu(f, raporDil)}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button className="chip" data-kvkk-metin-ac aria-expanded={metinAcik} onClick={() => { setMetinAcik(!metinAcik); setNot(""); }}>{metinAcik ? c("Bilgilendirme metnini gizle", "Hide the full notice") : c("Bilgilendirme metnini göster", "Show the full notice")}</button>
        {metinAcik && <button className="chip" onClick={kopyala}>{c("Kopyala", "Copy")}</button>}
      </div>
      {metinAcik && (
        <>
          <textarea data-kvkk-metin lang={raporDil} className="field" readOnly value={metin} rows={14} onFocus={(e) => e.target.select()} style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5 }} />
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 6, lineHeight: 1.5 }}>{c("Firma bilgilerin metne kendiliğinden yazılır. Müşterine WhatsApp'tan gönderebilir, dükkânına asabilir ya da web sitene koyabilirsin. Metin rapor dilindedir.", "Your company details are filled in for you. You can send it to customers on WhatsApp, put it up at your shop or add it to your website. The text is in the report language.")}</div>
        </>
      )}
      {not && <div role="status" style={{ marginTop: 8, color: "var(--ok)", fontSize: 13.5, fontWeight: 700 }}>{not}</div>}
    </div>
  );
}
