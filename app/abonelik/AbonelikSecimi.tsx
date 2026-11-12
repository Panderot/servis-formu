"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DilDugmesi } from "../components/Dil";
import { useDil } from "../lib/dil";
import { ABONELIK_EPOSTA, DENEME_GUN, supabase } from "../components/supabase";
import { aboneligiYonet, odemeBaslat, odemeHataMetni } from "../components/odeme";
import { OdemeLogolari } from "../components/YasalAlt";
import { ODEME_ACIK, PAKET, tl, type Donem, type Plan } from "../lib/paket";

// /abonelik: the signed-in user picks a plan (prices in TL, VAT included) and goes to payment. With online
// payment off (ODEME_ACIK) the same choice is sent by email. Reachable from the pricing cards on the landing
// page (after sign-up), the trial bar and the lock screen in /app (app/components/HesapKapisi.tsx).
type Hal = { tur: "yukleniyor" } | { tur: "hazir"; eposta: string; suruyor: boolean; teknisyen: boolean; deneme: boolean };
// Required ticks before payment: business use (Terms: business customers only), pre-information form,
// distance sales agreement and the immediate start of the service (no right of withdrawal; wording from the
// pre-information form, section "Cayma hakkı").
type Onay = "isletme" | "obf" | "mesafeli" | "cayma";
const ONAYLAR: Onay[] = ["isletme", "obf", "mesafeli", "cayma"];

export default function AbonelikSecimi() {
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [hal, setHal] = useState<Hal>({ tur: "yukleniyor" });
  const [plan, setPlan] = useState<Plan>("usta");
  const [donem, setDonem] = useState<Donem>("yillik");
  const [gidiyor, setGidiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [iptal, setIptal] = useState(false);
  const [onay, setOnay] = useState<Record<Onay, boolean>>({ isletme: false, obf: false, mesafeli: false, cayma: false });
  const tamam = ONAYLAR.every((o) => onay[o]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setIptal(p.get("iptal") === "1");
    if (p.get("paket") === "firma") setPlan("firma");
    if (p.get("donem") === "aylik") setDonem("aylik");
    const sb = supabase();
    if (!sb) {
      window.location.replace("/app");
      return;
    }
    let bitti = false;
    (async () => {
      const { data } = await sb.auth.getSession();
      if (bitti) return;
      const k = data.session?.user;
      if (!k) {
        window.location.replace("/giris?sonra=%2Fabonelik");
        return;
      }
      // A technician of a team does not pay: the subscription is the owner's.
      const { data: ed } = await sb.rpc("ekip_durumu").retry(false);
      if (bitti) return;
      if ((ed as { rol?: string } | null)?.rol === "teknisyen") {
        setHal({ tur: "hazir", eposta: k.email ?? "", suruyor: false, teknisyen: true, deneme: false });
        return;
      }
      let suruyor = false;
      if (ODEME_ACIK) {
        const { data: s } = await sb.from("abonelikler").select("bitis, stripe_abonelik, durum").eq("user_id", k.id).maybeSingle();
        suruyor = !!(s?.stripe_abonelik && ["active", "trialing", "past_due"].includes(s.durum ?? "") && new Date(s.bitis).getTime() > Date.now());
      }
      // Still inside the free trial (account younger than DENEME_GUN days): offer to try first.
      const deneme = !!k.created_at && new Date(k.created_at).getTime() + DENEME_GUN * 86_400_000 > Date.now();
      if (!bitti) setHal({ tur: "hazir", eposta: k.email ?? "", suruyor, teknisyen: false, deneme });
    })();
    return () => {
      bitti = true;
    };
  }, []);

  const ode = async () => {
    if (!tamam) return;
    setHata("");
    setGidiyor(true);
    const kod = await odemeBaslat(plan, donem, dil);
    if (kod) {
      setHata(odemeHataMetni(kod, dil));
      setGidiyor(false);
    }
  };
  const yonet = async () => {
    setHata("");
    setGidiyor(true);
    const kod = await aboneligiYonet(dil);
    if (kod) {
      setHata(odemeHataMetni(kod, dil));
      setGidiyor(false);
    }
  };

  const ad = (p: Plan) => (p === "usta" ? c("Usta", "Solo") : c("Firma", "Team"));
  const kim = (p: Plan) => (p === "usta" ? c("1 teknisyen", "1 technician") : c("Sınırsız teknisyen", "Unlimited technicians"));
  const aylikGorunen = (p: Plan) => (donem === "yillik" ? PAKET[p].yil / 12 : PAKET[p].ay);
  const odenecek = donem === "yillik" ? PAKET[plan].yil : PAKET[plan].ay;
  const donemAd = donem === "yillik" ? c("yıllık", "yearly") : c("aylık", "monthly");
  const mailto = `mailto:${ABONELIK_EPOSTA}?subject=${encodeURIComponent(c("Fixnote abonelik", "Fixnote subscription"))}&body=${encodeURIComponent(
    c(`Merhaba, Fixnote ${ad(plan)} paketine ${donemAd} (${tl(odenecek)}, KDV dahil) abone olmak istiyorum. Hesabım: `, `Hello, I'd like to subscribe to Fixnote ${ad(plan)}, ${donemAd} (${tl(odenecek, "en")}, VAT included). My account: `) +
      (hal.tur === "hazir" ? hal.eposta : "")
  )}`;
  const baglanti = (href: string, metin: string) => <Link href={href} target="_blank" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{metin}</Link>;
  const onayMetni: Record<Onay, React.ReactNode> = {
    isletme: <>{c("Fixnote'u işim için kullanıyorum; ", "I use Fixnote for my business and I accept the ")}{baglanti("/kosullar", c("Kullanım ve Abonelik Koşullarını", "Terms of use and subscription"))}{c(" ve ", " and the ")}{baglanti("/veri-isleme", c("Veri İşleme Sözleşmesini", "Data processing agreement"))}{c(" kabul ediyorum.", ".")}</>,
    obf: <>{baglanti("/on-bilgilendirme", c("Ön Bilgilendirme Formu", "Pre-information form"))}{c("'nu okudum.", ": I have read it.")}</>,
    mesafeli: <>{baglanti("/mesafeli-satis", c("Mesafeli Satış Sözleşmesi", "Distance sales agreement"))}{c("'ni kabul ediyorum.", ": I accept it.")}</>,
    cayma: c(
      "Hizmetin ödemenin onaylanmasının ardından hemen başlamasını onaylıyorum; elektronik ortamda anında ifa edilen bu hizmette cayma hakkı kullanılamadığını biliyorum.",
      "I agree that the service starts immediately after the payment is confirmed, and I understand that the right of withdrawal cannot be used for this service, which is performed electronically at once."
    ),
  };

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 40px", position: "relative" }}>
      <DilDugmesi style={{ position: "absolute", top: 14, right: 14 }} />
      <Link href="/app" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>

      <div data-abonelik={hal.tur === "hazir" ? (hal.teknisyen ? "teknisyen" : hal.suruyor ? "suruyor" : "secim") : "yukleniyor"} className="card" style={{ width: "100%", maxWidth: 520, marginTop: 22, borderRadius: 20, padding: "clamp(22px, 5vw, 30px)", boxShadow: "var(--shadow-md)" }}>
        {hal.tur === "yukleniyor" ? (
          <div style={{ minHeight: 260 }} />
        ) : hal.teknisyen ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>{c("Abonelik firma sahibinde", "The subscription is the owner's")}</h1>
            <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 20px" }}>{c("Bir firmanın ekibindesin; aboneliği firma sahibi yönetir. Senin ödeme yapmana gerek yok.", "You're in a company's team; the owner manages the subscription. You don't need to pay.")}</p>
            <Link href="/app" className="btn" style={{ width: "100%" }}>{c("Uygulamaya dön", "Back to the app")}</Link>
          </div>
        ) : hal.suruyor ? (
          <div style={{ textAlign: "center" }}>
            <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-grid", placeItems: "center" }}><Ikon ad="tik" boy={22} /></span>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0" }}>{c("Aboneliğin zaten aktif", "Your subscription is already active")}</h1>
            <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 20px" }}>{c("Paketini değiştirmek, kartını güncellemek ya da faturalarını görmek için aboneliğini yönet.", "Manage your subscription to change plan, update your card or see your invoices.")}</p>
            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn" onClick={yonet} disabled={gidiyor}>{gidiyor ? c("Açılıyor…", "Opening…") : c("Aboneliği yönet", "Manage subscription")}</button>
              <Link href="/app" className="btn btn-ghost">{c("Uygulamaya dön", "Back to the app")}</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>{c("Paketini seç", "Choose your plan")}</h1>
            <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600, lineHeight: 1.55, margin: "6px 0 0" }}>{c("Kayıtların hesabında aynen kalır. İstediğin zaman iptal edersin.", "Your records stay in your account. Cancel any time.")}</p>

            {iptal && (
              <div data-odeme-iptal style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5, fontWeight: 700 }}>
                {c("Ödeme tamamlanmadı, kartından para çekilmedi. İstersen tekrar deneyebilirsin.", "The payment wasn't completed and your card wasn't charged. You can try again.")}
              </div>
            )}

            <div className="card flex items-center gap-1" style={{ borderRadius: 999, padding: 5, boxShadow: "none", marginTop: 18, width: "fit-content" }} role="group" aria-label={c("Ödeme dönemi", "Billing period")}>
              {(["aylik", "yillik"] as const).map((d) => (
                <button key={d} data-donem={d} onClick={() => setDonem(d)} aria-pressed={donem === d} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "10px 18px", fontWeight: 700, fontSize: 13.5, background: donem === d ? "var(--ink)" : "transparent", color: donem === d ? "#fff" : "var(--muted)" }}>
                  {d === "aylik" ? c("Aylık", "Monthly") : c("Yıllık", "Yearly")}
                </button>
              ))}
              <span className="pill ok" style={{ marginRight: 6 }}>{c("%20 indirim", "20% off")}</span>
            </div>

            <div role="radiogroup" aria-label={c("Paket", "Plan")} style={{ display: "grid", gap: 10, marginTop: 14 }}>
              {(["usta", "firma"] as const).map((p) => {
                const secili = plan === p;
                return (
                  <button
                    key={p}
                    role="radio"
                    aria-checked={secili}
                    data-plan={p}
                    onClick={() => setPlan(p)}
                    style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: secili ? "#f1f8fa" : "var(--paper)", border: `${secili ? 2 : 1}px solid ${secili ? "var(--accent)" : "var(--line)"}`, borderRadius: 14, padding: secili ? "15px 15px" : "16px 16px", font: "inherit", color: "inherit" }}
                  >
                    <span aria-hidden style={{ flex: "none", width: 20, height: 20, borderRadius: 10, border: `2px solid ${secili ? "var(--accent)" : "var(--line-2)"}`, display: "grid", placeItems: "center" }}>
                      {secili && <span style={{ width: 10, height: 10, borderRadius: 5, background: "var(--accent)" }} />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 16, letterSpacing: "-0.02em", display: "block" }}>{ad(p)}</b>
                      <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{kim(p)}</span>
                    </span>
                    <span style={{ textAlign: "right", flex: "none" }}>
                      <b className="num" style={{ fontSize: 20, letterSpacing: "-0.03em" }}>{tl(aylikGorunen(p), dil)}</b>
                      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}> {c("/ ay", "/ month")}</span>
                      {donem === "yillik" && <span className="num" style={{ display: "block", fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>{c(`yıllık ${tl(PAKET[p].yil, dil)}`, `${tl(PAKET[p].yil, dil)} a year`)}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)", fontSize: 14, fontWeight: 700 }}>
              <span>{donem === "yillik" ? c("Bugün ödenecek (1 yıl)", "Due today (1 year)") : c("Bugün ödenecek (1 ay)", "Due today (1 month)")}</span>
              <b className="num" data-odenecek={odenecek} style={{ fontSize: 18 }}>{tl(odenecek, dil)}</b>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, marginTop: 4 }}>
              {c("KDV dahil. ", "TRY, VAT included. ")}
              {donem === "yillik" ? c("Her yıl aynı gün kendiliğinden yenilenir.", "Renews automatically every year on the same day.") : c("Her ay aynı gün kendiliğinden yenilenir.", "Renews automatically every month on the same day.")}
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              {ONAYLAR.map((o) => (
                <label key={o} data-onay={o} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", borderRadius: 12, border: `1px solid ${onay[o] ? "var(--accent)" : "var(--line-2)"}`, background: onay[o] ? "#f1f8fa" : "var(--paper)", cursor: "pointer", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>
                  <input type="checkbox" checked={onay[o]} onChange={(e) => setOnay((x) => ({ ...x, [o]: e.target.checked }))} style={{ width: 18, height: 18, marginTop: 1, flex: "none", accentColor: "var(--accent)" }} />
                  <span>{onayMetni[o]}</span>
                </label>
              ))}
            </div>

            {hata && <div role="alert" data-odeme-hata style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", color: "var(--bad)", fontSize: 13.5, fontWeight: 700 }}>{hata}</div>}

            {ODEME_ACIK ? (
              <button data-odemeye-gec className="btn" onClick={ode} disabled={gidiyor || !tamam} style={{ width: "100%", marginTop: 16, padding: "14px 20px" }}>
                {gidiyor ? c("Ödeme sayfası açılıyor…", "Opening the payment page…") : c("Ödemeye geç", "Continue to payment")}
              </button>
            ) : (
              <a data-odemeye-gec className="btn" href={tamam ? mailto : undefined} aria-disabled={!tamam} onClick={(e) => { if (!tamam) e.preventDefault(); }} style={{ width: "100%", marginTop: 16, padding: "14px 20px", opacity: tamam ? 1 : 0.5, cursor: tamam ? "pointer" : "not-allowed" }}>
                {c("E-postayla abone ol", "Subscribe by email")}
              </a>
            )}
            {!ODEME_ACIK && (
              <p style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, margin: "8px 0 0", textAlign: "center", lineHeight: 1.5 }}>
                {c(`Seçtiğin paket e-postaya yazılır; aboneliği aynı gün açarız (${ABONELIK_EPOSTA}).`, `Your choice goes into the email; we open the subscription the same day (${ABONELIK_EPOSTA}).`)}
              </p>
            )}
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, color: "var(--faint)", fontWeight: 600, margin: "10px 0 0", textAlign: "center" }}>
              <Ikon ad="anahtar" boy={13} />{c("Kart bilgilerin bize ulaşmaz.", "Your card details never reach us.")}
            </p>
            <div style={{ marginTop: 14 }}><OdemeLogolari yazi /></div>
            {hal.deneme && (
              <Link href="/app" data-once-dene className="btn btn-ghost" style={{ width: "100%", marginTop: 16 }}>{c(`Önce ${DENEME_GUN} gün ücretsiz dene`, `Try free for ${DENEME_GUN} days first`)}</Link>
            )}
          </>
        )}
      </div>
      {hal.tur === "hazir" && (
        <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, marginTop: 14, textAlign: "center" }}>
          {c("Giriş yapılan hesap:", "Signed in as:")} {hal.eposta} · <Link href="/app" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{c("Uygulamaya dön", "Back to the app")}</Link>
        </div>
      )}
    </main>
  );
}
