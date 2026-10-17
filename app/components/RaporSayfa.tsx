/* eslint-disable @next/next/no-img-element */
import { type Dil, type Firma, type Rapor, hesapla, para, tarihTR, odemeAd, telefonGoster, raporDili, raporPara, buyukHarf, vergiAd } from "../lib/servis";

// Labels of the A4 report in the report's own language (a report keeps the language it was created in).
const ETIKET = {
  tr: {
    firma: "Firma adı", baslik: "SERVİS RAPORU", hizmet: "Hizmet", musteri: "Müşteri", adUnvan: "Ad / unvan", telefon: "Telefon", adres: "Adres",
    cihazHizmet: "Cihaz / hizmet", tur: "Tür", markaModel: "Marka / model", seriNo: "Seri no", sikayet: "Şikayet / arıza", tespit: "Tespit ve yapılan iş",
    liste: "Yapılan işlemler · kontrol listesi", parcaIscilik: "Parça ve işçilik", kalem: "Kalem", adet: "Adet", birim: "Birim", tutar: "Tutar", iscilik: "İşçilik",
    odeme: "Ödeme:", sonraki: "Sonraki bakım:", garanti: "Garanti kapsamında", ucretsiz: "Ücretsiz", ara: "Ara toplam", genel: "Genel toplam",
    fotolar: "Fotoğraflar", once: "Önce", sonra: "Sonra", fotoYok: "Fotoğraf yok", not: "Not", teknisyen: "Teknisyen", onay: "Müşteri onayı",
    imzaAlt: "Müşteri imzası", imzaYok: "İmza alınmadı", onayMetni: "İşin yapıldığını ve cihazın çalışır teslim edildiğini onaylarım.",
  },
  en: {
    firma: "Company name", baslik: "SERVICE REPORT", hizmet: "Service", musteri: "Customer", adUnvan: "Name / company", telefon: "Phone", adres: "Address",
    cihazHizmet: "Appliance / service", tur: "Type", markaModel: "Make / model", seriNo: "Serial no", sikayet: "Complaint / fault", tespit: "Findings and work done",
    liste: "Work carried out · checklist", parcaIscilik: "Parts and labour", kalem: "Item", adet: "Qty", birim: "Unit", tutar: "Amount", iscilik: "Labour",
    odeme: "Payment:", sonraki: "Next service:", garanti: "Under warranty", ucretsiz: "No charge", ara: "Subtotal", genel: "Total",
    fotolar: "Photos", once: "Before", sonra: "After", fotoYok: "No photo", not: "Note", teknisyen: "Technician", onay: "Customer approval",
    imzaAlt: "Customer signature", imzaYok: "Not signed", onayMetni: "I confirm the work was carried out and the appliance was handed over in working order.",
  },
} satisfies Record<Dil, Record<string, string>>;
export const raporEtiket = (dil: Dil) => ETIKET[dil];

function Rozet({ ad, dil }: { ad: string; dil: Dil }) {
  const harf = buyukHarf(ad.trim()[0] || "S", dil);
  return (
    <div style={{ width: 52, height: 52, borderRadius: 6, background: "#0d5b73", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26 }}>
      {harf}
    </div>
  );
}

function Satir({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 8, padding: "2px 0" }}>
      <span style={{ color: "#5f7284" }}>{k}</span>
      <span style={{ fontWeight: 600, wordBreak: "break-word" }}>{v || "-"}</span>
    </div>
  );
}

export default function RaporSayfa({ r, f }: { r: Rapor; f: Firma }) {
  const dil = raporDili(r);
  const e = ETIKET[dil];
  const tl = (n: number) => para(n, raporPara(r), dil);
  const vergi = f.vergiNo ? (dil === "en" ? `  |  ${f.vergiDairesi ? `${f.vergiDairesi} / ` : ""}Tax no: ${f.vergiNo}` : `  |  VD: ${f.vergiDairesi} / ${f.vergiNo}`) : "";
  const h = hesapla(r);
  const once = r.fotolar.filter((x) => x.tur === "once");
  const sonra = r.fotolar.filter((x) => x.tur === "sonra");
  const garanti = r.odeme === "garanti";

  return (
    <div className="a4" lang={dil}>
      {/* Başlık */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, paddingBottom: 16, borderBottom: "3px solid #1c2735" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          {f.logo ? <img src={f.logo} alt="" style={{ height: 52, maxWidth: 140, objectFit: "contain" }} /> : <Rozet ad={f.ad} dil={dil} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1.15 }}>{f.ad || e.firma}</div>
            <div style={{ color: "#5f7284", fontSize: 11, marginTop: 3 }}>{f.adres}</div>
            <div style={{ color: "#5f7284", fontSize: 11, whiteSpace: "pre-wrap" }}>
              {[f.telefon, f.eposta].filter(Boolean).join("  |  ")}
              {vergi}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".16em", color: "#5f7284" }}>{e.baslik}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 17, marginTop: 2 }}>{r.no}</div>
          <div style={{ fontSize: 11.5, marginTop: 2 }}>{tarihTR(r.tarih, dil)}, {r.saat}</div>
          <div style={{ display: "inline-block", marginTop: 6, background: "#e3f0f3", color: "#08455a", borderRadius: 5, padding: "3px 9px", fontWeight: 800, fontSize: 11 }}>{r.hizmet || e.hizmet}</div>
        </div>
      </div>

      {/* Müşteri + cihaz */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }} className="avoid">
        <div className="box">
          <h4>{e.musteri}</h4>
          <Satir k={e.adUnvan} v={r.musteri.ad} />
          <Satir k={e.telefon} v={telefonGoster(r.musteri.telefon)} />
          <Satir k={e.adres} v={r.musteri.adres} />
        </div>
        <div className="box">
          <h4>{e.cihazHizmet}</h4>
          <Satir k={e.tur} v={r.cihaz.tur} />
          <Satir k={e.markaModel} v={[r.cihaz.marka, r.cihaz.model].filter(Boolean).join(" ")} />
          <Satir k={e.seriNo} v={r.cihaz.seriNo} />
        </div>
      </div>

      {/* Şikayet + tespit */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }} className="avoid">
        <div>
          <h4>{e.sikayet}</h4>
          <p style={{ margin: 0 }}>{r.sikayet || "-"}</p>
        </div>
        <div>
          <h4>{e.tespit}</h4>
          <p style={{ margin: 0 }}>{r.tespit || "-"}</p>
        </div>
      </div>

      {/* Kontrol listesi */}
      {r.maddeler.length > 0 && (
        <div style={{ marginTop: 18 }} className="avoid">
          <h4>{e.liste}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 22, rowGap: 3 }}>
            {r.maddeler.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", color: m.ok ? "#1c2735" : "#94a3b2" }}>
                <span style={{ flex: "none", width: 13, height: 13, marginTop: 2, border: m.ok ? "1.3px solid #0d5b73" : "1.3px solid #c3cfda", borderRadius: 3, background: m.ok ? "#0d5b73" : "#fff", color: "#fff", fontSize: 9, lineHeight: "11px", textAlign: "center", fontWeight: 800 }}>{m.ok ? "✓" : ""}</span>
                <span style={{ textDecoration: m.ok ? "none" : "line-through" }}>{m.ad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ücret */}
      <div style={{ marginTop: 18 }} className="avoid">
        <h4>{e.parcaIscilik}</h4>
        <table>
          <thead>
            <tr><th>{e.kalem}</th><th className="num">{e.adet}</th><th className="num">{e.birim}</th><th className="num">{e.tutar}</th></tr>
          </thead>
          <tbody>
            {r.parcalar.map((p) => (
              <tr key={p.id}><td>{p.ad}</td><td className="num">{p.adet}</td><td className="num">{tl(p.fiyat)}</td><td className="num">{tl(p.adet * p.fiyat)}</td></tr>
            ))}
            <tr><td>{e.iscilik}</td><td className="num">1</td><td className="num">{tl(r.iscilik)}</td><td className="num">{tl(r.iscilik)}</td></tr>
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10, gap: 20 }}>
          <div style={{ fontSize: 11.5 }}>
            <div><b>{e.odeme}</b> {odemeAd(r.odeme, dil)}</div>
            {r.sonrakiBakim && <div style={{ marginTop: 2 }}><b>{e.sonraki}</b> {tarihTR(r.sonrakiBakim, dil)}</div>}
          </div>
          <div style={{ minWidth: 250 }}>
            {garanti && <div style={{ display: "flex", justifyContent: "space-between", color: "#5f7284" }}><span>{e.garanti}</span><span>{e.ucretsiz}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{e.ara}</span><span className="num">{tl(h.ara)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{vergiAd(dil)} ({dil === "en" ? `${r.kdv}%` : `%${r.kdv}`})</span><span className="num">{tl(h.kdv)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingTop: 5, borderTop: "1.5px solid #1c2735", fontWeight: 800, fontSize: 15 }}><span>{e.genel}</span><span className="num">{tl(h.toplam)}</span></div>
          </div>
        </div>
      </div>

      {/* Fotoğraflar */}
      {r.fotolar.length > 0 && (
        <div style={{ marginTop: 18 }} className="avoid">
          <h4>{e.fotolar}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[{ t: e.once, l: once }, { t: e.sonra, l: sonra }].map((g) => (
              <div key={g.t}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{g.t}</div>
                <div style={{ display: "grid", gridTemplateColumns: g.l.length > 1 ? "1fr 1fr" : "1fr", gap: 6 }}>
                  {g.l.length ? g.l.map((x) => <img key={x.id} src={x.src} alt={g.t} style={{ width: "100%", height: g.l.length > 1 ? 96 : 150, objectFit: "cover", borderRadius: 3, border: "1px solid #dfe5eb" }} />) : <div style={{ height: 60, border: "1px dashed #dfe5eb", borderRadius: 3, display: "grid", placeItems: "center", color: "#94a3b2", fontSize: 11 }}>{e.fotoYok}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.not && (
        <div style={{ marginTop: 14 }} className="avoid">
          <h4>{e.not}</h4>
          <p style={{ margin: 0 }}>{r.not}</p>
        </div>
      )}

      {/* İmzalar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 22 }} className="avoid">
        <div>
          <h4>{e.teknisyen}</h4>
          <div style={{ height: 74, borderBottom: "1px solid #1c2735", display: "flex", alignItems: "flex-end", paddingBottom: 6, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{r.teknisyen}</div>
          <div style={{ fontSize: 10.5, color: "#5f7284", marginTop: 4 }}>{f.ad}</div>
        </div>
        <div>
          <h4>{e.onay}</h4>
          <div style={{ height: 74, borderBottom: "1px solid #1c2735", display: "flex", alignItems: "flex-end" }}>
            {r.imza ? <img src={r.imza} alt={e.imzaAlt} style={{ height: 70, maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ color: "#b7352a", fontSize: 11, paddingBottom: 6 }}>{e.imzaYok}</span>}
          </div>
          <div style={{ fontSize: 10.5, color: "#5f7284", marginTop: 4 }}>{r.imzalayan || r.musteri.ad}. {e.onayMetni}</div>
        </div>
      </div>

      {f.altNot && <div style={{ marginTop: 22, paddingTop: 10, borderTop: "1px solid #e6ebf0", fontSize: 10, color: "#5f7284" }}>{f.altNot}</div>}
    </div>
  );
}
