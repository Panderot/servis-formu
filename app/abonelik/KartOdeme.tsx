import { useEffect, useRef, useState } from "react";
import Ikon from "../components/Ikon";
import { supabase } from "../components/supabase";
import { LISANS, LISANS_WHATSAPP, tl, type LisansTuru } from "../lib/paket";

// Card payment billing step (task 81, shown only with NEXT_PUBLIC_IYZICO_ACIK=1). Collects the e-Arşiv invoice details
// and the two consents, calls the odeme-baslat Edge Function (supabase/functions) and sends the browser to iyzico's
// payment page. The price is never sent: the server charges its own (FIYAT, equal to LISANS). No TC kimlik field.
// Validation mirrors odeme-baslat; the server checks everything again.

type Alan = "ad" | "telefon" | "il" | "adres" | "vergi_no" | "onay";

// Turkish mobile as +905XXXXXXXXX (05.., 5.., 905.., +90 5.., spaces and dashes allowed); null when not a mobile number.
export function cepTelefonu(x: string): string | null {
  let d = x.replace(/\D/g, "");
  if (d.startsWith("0090")) d = d.slice(4);
  else if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return /^5\d{9}$/.test(d) ? "+90" + d : null;
}

export default function KartOdeme({ donem, dil, uid, eposta, onBilgiHref, mesafeliHref, onKapat }: {
  donem: LisansTuru;
  dil: "tr" | "en";
  uid: string;
  eposta: string;
  onBilgiHref: string;
  mesafeliHref: string;
  onKapat: () => void;
}) {
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [il, setIl] = useState("");
  const [adres, setAdres] = useState("");
  const [vd, setVd] = useState("");
  const [vn, setVn] = useState("");
  const [onay1, setOnay1] = useState(false);
  const [onay2, setOnay2] = useState(false);
  const [hatalar, setHatalar] = useState<Partial<Record<Alan, string>>>({});
  const [gidiyor, setGidiyor] = useState(false);
  const [genelHata, setGenelHata] = useState<React.ReactNode>("");
  const baslik = useRef<HTMLHeadingElement>(null);

  // Open: bring the step into view and move focus to its heading (screen readers announce it).
  useEffect(() => {
    baslik.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    baslik.current?.focus({ preventScroll: true });
  }, [donem]);

  // Prefill from the company details (Firma ve şablonlar), only into empty fields.
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    let bitti = false;
    sb.from("firmalar").select("firma").eq("user_id", uid).maybeSingle().then(({ data }) => {
      if (bitti || !data?.firma) return;
      const f = data.firma as { ad?: string; telefon?: string; adres?: string; vergiDairesi?: string; vergiNo?: string };
      setAd((v) => v || (f.ad ?? "").trim());
      setTelefon((v) => v || (f.telefon ?? "").trim());
      setAdres((v) => v || (f.adres ?? "").trim());
      setVd((v) => v || (f.vergiDairesi ?? "").trim());
      setVn((v) => v || (f.vergiNo ?? "").replace(/\s+/g, ""));
    });
    return () => {
      bitti = true;
    };
  }, [uid]);

  const ad_ = { aylik: c("Aylık lisans", "Monthly licence"), yillik: c("Yıllık lisans", "Yearly licence"), suresiz: c("Süresiz lisans", "Lifetime licence") }[donem];
  const waHref = `https://wa.me/${LISANS_WHATSAPP}?text=${encodeURIComponent(dil === "en" ? `Hello, I need help with a Fixnote card payment. My account: ${eposta}` : `Merhaba, Fixnote kartla ödeme konusunda yardım istiyorum. Hesabım: ${eposta}`)}`;
  const wa = (metin: string) => <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{metin}</a>;

  const denetle = (): Partial<Record<Alan, string>> => {
    const h: Partial<Record<Alan, string>> = {};
    const t = (s: string) => s.replace(/\s+/g, " ").trim();
    if (t(ad).length < 2 || t(ad).length > 120) h.ad = c("Adını ya da firma unvanını yaz (2-120 karakter).", "Enter your name or company name (2-120 characters).");
    if (!cepTelefonu(telefon)) h.telefon = c("Geçerli bir cep telefonu yaz, örneğin 0532 123 45 67.", "Enter a valid Turkish mobile number, e.g. 0532 123 45 67.");
    if (t(il).length < 2 || t(il).length > 60) h.il = c("İli yaz.", "Enter the province.");
    if (t(adres).length < 5 || t(adres).length > 300) h.adres = c("Adresi yaz (5-300 karakter).", "Enter the address (5-300 characters).");
    if (vn.replace(/\s+/g, "") && !/^\d{10}$/.test(vn.replace(/\s+/g, ""))) h.vergi_no = c("Vergi no 10 haneli olmalı.", "The tax number must be 10 digits.");
    if (!onay1 || !onay2) h.onay = c("Devam etmek için iki kutuyu da işaretle.", "Tick both boxes to continue.");
    return h;
  };

  const hataMetni = (kod: string): React.ReactNode => {
    switch (kod) {
      case "teknisyen": return c("Lisansı firma sahibi açar.", "The licence is activated by the company owner.");
      case "zaten_suresiz": return c("Süresiz lisansın zaten var; ödeme yapmana gerek yok.", "You already have a lifetime licence; you don't need to pay.");
      case "cok_deneme": return c("Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.", "Too many attempts. Try again in a few minutes.");
      case "odeme_baslamadi": return dil === "en" ? <>The payment page couldn&apos;t be opened. Try again shortly or {wa("message us on WhatsApp")}.</> : <>Ödeme sayfası açılamadı. Biraz sonra tekrar dene ya da {wa("bize WhatsApp'tan yaz")}.</>;
      case "oturum": return c("Oturumun kapanmış. Sayfayı yenileyip tekrar giriş yap.", "You've been signed out. Refresh the page and sign in again.");
      default:
        if (kod.startsWith("gecersiz_") || kod === "onay") return c("Bilgilerden biri geçerli değil. Alanları kontrol edip tekrar dene.", "One of the details isn't valid. Check the fields and try again.");
        return c("Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.", "Couldn't connect. Check your internet connection and try again.");
    }
  };

  const gonder = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (gidiyor) return;
    setGenelHata("");
    const h = denetle();
    setHatalar(h);
    const ilk = (["ad", "telefon", "il", "adres", "vergi_no", "onay"] as Alan[]).find((k) => h[k]);
    if (ilk) {
      document.getElementById(ilk === "onay" ? "kf-onay1" : `kf-${ilk}`)?.focus();
      return;
    }
    const sb = supabase();
    if (!sb) return;
    setGidiyor(true);
    const { data, error } = await sb.functions.invoke("odeme-baslat", {
      body: {
        donem,
        donus: "web",
        dil,
        fatura: { ad, telefon, il, adres, vergi_dairesi: vd, vergi_no: vn },
        onaylar: { on_bilgilendirme: onay1, isletme: onay2 },
      },
    });
    const r = data as { odemeSayfasi?: string } | null;
    if (!error && r?.odemeSayfasi && /^https:\/\//.test(r.odemeSayfasi)) {
      window.location.assign(r.odemeSayfasi);
      return;
    }
    let kod = "baglanti";
    const yanit = (error as { context?: unknown } | null)?.context;
    if (yanit instanceof Response) {
      try {
        kod = String((await yanit.json()).hata ?? kod);
      } catch {}
    }
    setGenelHata(hataMetni(kod));
    setGidiyor(false);
  };

  const alanHata = (k: Alan) => hatalar[k] && <div id={`kf-${k}-hata`} style={{ marginTop: 5, fontSize: 12.5, fontWeight: 700, color: "var(--bad)" }}>{hatalar[k]}</div>;
  const lbl = { display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6, textAlign: "left" } as const;
  const girdi = (k: Alan) => ({ "aria-invalid": hatalar[k] ? true : undefined, "aria-describedby": hatalar[k] ? `kf-${k}-hata` : undefined });

  return (
    <form id="kart-odeme" data-kart-odeme={donem} className="card" onSubmit={gonder} noValidate style={{ width: "100%", maxWidth: 520, margin: "20px auto 0", borderRadius: 20, padding: "clamp(20px, 5vw, 26px)", boxShadow: "var(--shadow-md)", scrollMarginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 ref={baslik} tabIndex={-1} style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, outline: "none" }}>{c("Fatura bilgileri", "Billing details")}</h2>
          <div className="num" style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 700, marginTop: 4 }}>{ad_} · {tl(LISANS[donem], dil)}</div>
        </div>
        <button type="button" data-kart-vazgec className="btn btn-ghost" onClick={onKapat} style={{ padding: "8px 12px", fontSize: 13 }}>{c("Vazgeç", "Cancel")}</button>
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, lineHeight: 1.55, margin: "10px 0 0" }}>{c("e-Arşiv faturan bu bilgilerle kesilir.", "Your e-invoice is issued with these details.")}</p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <div>
          <label htmlFor="kf-ad" style={lbl}>{c("Ad soyad ya da firma unvanı", "Full name or company name")} *</label>
          <input id="kf-ad" className="field" value={ad} onChange={(e) => setAd(e.target.value)} maxLength={120} autoComplete="name" {...girdi("ad")} />
          {alanHata("ad")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="kf-telefon" style={lbl}>{c("Cep telefonu", "Mobile phone")} *</label>
            <input id="kf-telefon" className="field num" type="tel" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} maxLength={20} autoComplete="tel" placeholder="05XX XXX XX XX" {...girdi("telefon")} />
            {alanHata("telefon")}
          </div>
          <div>
            <label htmlFor="kf-il" style={lbl}>{c("İl", "Province")} *</label>
            <input id="kf-il" className="field" value={il} onChange={(e) => setIl(e.target.value)} maxLength={60} autoComplete="address-level1" {...girdi("il")} />
            {alanHata("il")}
          </div>
        </div>
        <div>
          <label htmlFor="kf-adres" style={lbl}>{c("Adres", "Address")} *</label>
          <textarea id="kf-adres" className="field" value={adres} onChange={(e) => setAdres(e.target.value)} maxLength={300} rows={2} autoComplete="street-address" {...girdi("adres")} />
          {alanHata("adres")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="kf-vd" style={lbl}>{c("Vergi dairesi (isteğe bağlı)", "Tax office (optional)")}</label>
            <input id="kf-vd" className="field" value={vd} onChange={(e) => setVd(e.target.value)} maxLength={80} />
          </div>
          <div>
            <label htmlFor="kf-vergi_no" style={lbl}>{c("Vergi no (isteğe bağlı)", "Tax number (optional)")}</label>
            <input id="kf-vergi_no" className="field num" inputMode="numeric" value={vn} onChange={(e) => setVn(e.target.value)} maxLength={12} {...girdi("vergi_no")} />
            {alanHata("vergi_no")}
          </div>
        </div>
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: "16px 0 0", display: "grid", gap: 10 }} aria-describedby={hatalar.onay ? "kf-onay-hata" : undefined}>
        <legend className="sr-only">{c("Onaylar", "Consents")}</legend>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, textAlign: "left", cursor: "pointer" }}>
          <input id="kf-onay1" type="checkbox" checked={onay1} onChange={(e) => setOnay1(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flex: "none", accentColor: "var(--accent)" }} />
          <span>
            {dil === "en" ? (
              <>I have read and accept the <a href={onBilgiHref} target="_blank" rel="noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Pre-information Form</a> and the <a href={mesafeliHref} target="_blank" rel="noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Distance Sales Agreement</a>.</>
            ) : (
              <><a href={onBilgiHref} target="_blank" rel="noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Ön Bilgilendirme Formu</a>&apos;nu ve <a href={mesafeliHref} target="_blank" rel="noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Mesafeli Satış Sözleşmesi</a>&apos;ni okudum, onaylıyorum.</>
            )}
          </span>
        </label>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, textAlign: "left", cursor: "pointer" }}>
          <input id="kf-onay2" type="checkbox" checked={onay2} onChange={(e) => setOnay2(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flex: "none", accentColor: "var(--accent)" }} />
          <span>{c("Fixnote'u işim için kullanıyorum.", "I use Fixnote for my business.")}</span>
        </label>
        {hatalar.onay && <div id="kf-onay-hata" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--bad)", textAlign: "left" }}>{hatalar.onay}</div>}
      </fieldset>

      {genelHata && <div role="alert" data-kart-hata style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", color: "var(--bad)", fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>{genelHata}</div>}

      <button type="submit" data-kart-devam className="btn" disabled={gidiyor} style={{ width: "100%", marginTop: 16, paddingTop: 13, paddingBottom: 13 }}>
        <Ikon ad="kart" boy={16} />{gidiyor ? c("Ödeme sayfası açılıyor…", "Opening the payment page…") : c("Ödeme sayfasına geç", "Continue to payment")}
      </button>
      <p style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5, textAlign: "center", margin: "10px 0 0" }}>{c("Kart bilgilerin iyzico'nun güvenli sayfasında girilir; Fixnote kart bilgisi görmez ve saklamaz.", "You enter your card details on iyzico's secure page; Fixnote never sees or stores them.")}</p>
    </form>
  );
}
