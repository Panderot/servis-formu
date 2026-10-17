"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Ikon, { Isaret } from "./components/Ikon";
import { SureHesap, OrnekRapor, IsDongu, Fiyat, SablonEditoru, MusteriGecmisi, WhatsAppBolum } from "./components/LandingParcalar";
import GorununceOynat from "./components/GorununceOynat";
import HeroMaket from "./components/HeroMaket";
import { DilDugmesi } from "./components/Dil";
import { useDil } from "./lib/dil";
import {
  demoRaporlar, sablonlarDil, telefonGoster, demoFoto, demoImza,
} from "./lib/servis";

// ---------- bölümlerde kullanılan örnek kayıt ve müşteri ----------
const ORNEK = { tr: demoRaporlar("tr").find((r) => r.no === "SR-2026-0048")!, en: demoRaporlar("en").find((r) => r.no === "SR-2026-0048")! };
// ================= SORUN: kağıt yığını =================
function KagitYigini() {
  return (
    <div aria-hidden="true" style={{ position: "relative", width: 230, height: 190, margin: "0 auto" }}>
      {[-7, 4, -3, 6, -1].map((r, i) => (
        <div key={i} className="kb-kagit" style={{ "--r": `${r}deg`, "--d": `${i * 130}ms`, position: "absolute", left: 10 + (i % 2) * 8, right: 10 - (i % 2) * 8, top: 26 + i * 26, height: 64, background: ["#efe6d3", "#f6f1e6", "#e8dcc4", "#faf7f0", "#efe6d3"][i], border: "1px solid #d9cdb3", borderRadius: 3, boxShadow: "0 4px 10px rgba(80,60,20,.08)" } as React.CSSProperties}>
          {[0, 1, 2].map((j) => <div key={j} style={{ height: 2, background: "#d6c9ad", margin: `${j === 0 ? 14 : 8}px 16px 0`, width: `${70 - j * 15}%` }} />)}
        </div>
      ))}
    </div>
  );
}

// Hero headline words: each word rises in on its own delay (0, 70, 140 ms...; the second line starts at 260 ms).
function Kelimeler({ sozler, bas, renk }: { sozler: string[]; bas: number; renk?: string }) {
  return (
    <>
      {sozler.map((w, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="hero-word" style={{ animationDelay: `${bas + i * 70}ms`, color: renk }}>{w}</span>
        </span>
      ))}
    </>
  );
}

function Bildirim({ ik, kim, ne, t, d = 0, style }: { ik: string; kim: string; ne: string; t: string; d?: number; style?: React.CSSProperties }) {
  return (
    <div className="kb-bildirim" style={{ "--d": `${d}ms`, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", boxShadow: "0 14px 32px rgba(16,39,58,.16)", display: "flex", gap: 10, width: 260, textAlign: "left", ...style } as React.CSSProperties}>
      <span style={{ flex: "none", width: 30, height: 30, borderRadius: 8, background: "var(--bad-soft)", color: "var(--bad)", display: "grid", placeItems: "center" }}><Ikon ad={ik} boy={15} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800 }}>{kim} <span style={{ fontWeight: 600, color: "var(--faint)", fontSize: 10.5, marginLeft: 4 }}>{t}</span></div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.4, marginTop: 1 }}>{ne}</div>
      </div>
    </div>
  );
}

// ================= SAYFA =================
const SSS = {
  tr: [
    ["Uygulama indirmem gerekiyor mu?", "Hayır. Fixnote telefonunun tarayıcısında açılır; mağazadan indirme ya da kurulum gerekmez. E-posta adresinle ya da Google hesabınla giriş yaparsın. İstersen ana ekrana kısayol ekler, tek dokunuşla açarsın. Form açıkken internet kesilse de doldurup kaydedersin; rapor telefonda bekler, bağlantı gelince hesabına gönderilir."],
    ["PDF nasıl oluşuyor?", "Rapor ekranındaki \"PDF olarak kaydet\" düğmesi raporu A4 düzeninde telefonun yazdırma ekranına gönderir. Orada \"PDF olarak kaydet\"i seçmen yeterli; Android'de ve iPhone'da aynı şekilde çalışır."],
    ["PDF WhatsApp'tan nasıl gönderiliyor?", "WhatsApp düğmesi, müşterinin numarasına rapor özetini hazır mesaj olarak açar: rapor no, yapılan işlemler, değişen parça, KDV'li toplam ve teknisyen. Kaydettiğin PDF'i aynı sohbete ekleyip gönderirsin. Numara 05xx diye yazılmış olsa da doğru biçime çevrilir."],
    ["Hangi işler için uygun?", "Müşterinin evinde ya da işyerinde iş yapıp teslim eden her servis için: kombi ve klima, beyaz eşya, ilaçlama, elektrik ve tesisat, asansör bakımı, kamera ve alarm kurulumu. Hazır şablonu olmayan işler için kendi kontrol listeni eklersin."],
    ["Kendi kontrol listemi ekleyebilir miyim?", "Evet. Ayarlar'da şablon adını, cihaz türünü ve her satıra bir işlemi yazarsın. Şablon yeni formda hizmet türü olarak çıkar; maddeler işaretli gelir, yapılmayanı kapatırsın."],
    ["Bu bir e-fatura mı?", "Hayır. Fixnote bir iş teslim raporudur: ne yapıldı, hangi parça değişti, müşteri onayladı mı. Faturayı bugün kullandığın yöntemle kesmeye devam edersin."],
    ["Kayıtlarım nerede saklanıyor?", "Raporların, fotoğrafların ve imzaların hesabında, Supabase'in güvenli bulut sunucularında saklanır. Kayıtların sunucuya şifreli bağlantıyla gider ve orada da şifreli durur. Kayıtları yalnızca hesabına giriş yapanlar görür. Aynı hesapla giren her telefonda aynı kayıtlar açılır; telefon değişse ya da kaybolsa da kayıtların kaybolmaz. İstersen Ayarlar'dan tek dosyalık yedek de indirebilirsin."],
  ],
  en: [
    ["Do I need to download an app?", "No. Fixnote opens in your phone's browser; there is nothing to download or install from a store. You sign in with your email address or your Google account. If you like, add a shortcut to your home screen and open it with one tap. If the connection drops while a form is open, you can still fill it in and save it; the report waits on the phone and is sent to your account when you are back online."],
    ["How is the PDF created?", "The \"Save as PDF\" button on the report screen sends the report, laid out on A4, to your phone's print screen. Choose \"Save as PDF\" there; it works the same way on Android and iPhone."],
    ["How do I send the PDF on WhatsApp?", "The WhatsApp button opens a chat with the customer's number and a ready-made summary: report number, work carried out, parts replaced, total including VAT and the technician. You attach the PDF you saved to the same chat and send it. Enter the number with its country code, for example +44."],
    ["What kind of work is it for?", "Any service that does a job at the customer's home or business and hands it over: boilers and air conditioning, household appliances, pest control, electrical and plumbing work, lift maintenance, CCTV and alarm installation. For jobs without a ready-made template, you add your own checklist."],
    ["Can I add my own checklist?", "Yes. In Settings you enter the template name, the appliance type and one step per line. The template appears as a service type on the new form; its steps come ticked and you switch off any you skipped."],
    ["Is this an invoice?", "No. Fixnote is a job completion report: what was done, which part was replaced, whether the customer signed it off. Keep invoicing the way you do today."],
    ["Where are my records stored?", "Your reports, photos and signatures are stored in your account on Supabase's secure cloud servers. They travel over an encrypted connection and stay encrypted on the server. Only people who sign in to your account can see them. Every phone that signs in to the same account sees the same records; if a phone is replaced or lost, your records are not. You can also download a single-file backup from Settings."],
  ],
};

export default function Home() {
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const ornek = ORNEK[dil];
  const SABLONLAR = sablonlarDil(dil);
  return (
    <main>
      {/* NAV: yüzen kart */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, padding: "12px 16px 0" }}>
        <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-3" style={{ background: "rgba(255,255,255,.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid var(--line)", borderRadius: 18, boxShadow: "var(--shadow-sm)", padding: "9px 10px 9px 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>
          <div className="hidden items-center gap-7 lg:flex" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted)" }}>
            <a href="#nasil" className="hover:text-[var(--ink)]">{c("Nasıl çalışır", "How it works")}</a>
            <a href="#rapor" className="hover:text-[var(--ink)]">{c("Rapor", "Report")}</a>
            <a href="#sablon" className="hover:text-[var(--ink)]">{c("Şablonlar", "Templates")}</a>
            <a href="#fiyat" className="hover:text-[var(--ink)]">{c("Fiyat", "Pricing")}</a>
            <a href="#sss" className="hover:text-[var(--ink)]">{c("SSS", "FAQ")}</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/app" className="hidden sm:inline" style={{ fontSize: 13.5, fontWeight: 700 }}>{c("Uygulamayı aç", "Open the app")}</Link>
            <DilDugmesi />
            <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn" style={{ padding: "9px 14px", fontSize: 13, borderRadius: 11 }}>{c("İlk raporu oluştur", "Start free")}</a>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section style={{ paddingTop: 64 }}>
        <div className="mx-auto max-w-[1120px] px-4 text-center">
          <span className="eyebrow" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12, fontWeight: 700, padding: "6px 14px", color: "var(--ink)" }}>
            <Ikon ad="anahtar" boy={14} style={{ color: "var(--accent)" }} />{c("Saha servis ekipleri için dijital servis raporu", "Digital service reports for field service teams")}
          </span>
          <h1 className="h1" style={{ marginTop: 22 }}>
            <Kelimeler sozler={dil === "en" ? ["Report", "done", "at", "the", "door,"] : ["Rapor", "kapıda", "biter,"]} bas={0} />
            <br />
            <Kelimeler sozler={dil === "en" ? ["your", "evening", "stays", "yours."] : ["akşamın", "sana", "kalır."]} bas={260} renk="var(--accent)" />
          </h1>
          <p className="sub mx-auto hero-rise" style={{ maxWidth: 640, marginTop: 20, fontSize: 16 }}>
            {c("Formu telefonda doldur, müşteriye ekranda imzalat. Firma başlıklı A4 rapor anında hazır; PDF olarak kaydet, WhatsApp'tan gönder.", "Fill in the form on your phone and get the customer to sign on screen. A branded A4 report is ready instantly; save it as a PDF and send it on WhatsApp.")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5 hero-rise">
            <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn" style={{ minWidth: 190 }}>{c("İlk raporu oluştur", "Create your first report")}</a>
            <a href="#rapor" className="btn btn-ghost" style={{ minWidth: 190 }}>{c("Örnek raporları gör", "See sample reports")}</a>
          </div>
        </div>
        <HeroMaket />
      </section>

      {/* SORUN: önce / sonra */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="h2">{c("Koçan kaybolur,", "Paper slips get lost,")}<br />{c("imzalı rapor kalır.", "signed reports don't.")}</h2>
            <p className="sub mt-3">{c("Her şey iş yapılırken, teknisyenin telefonunda.", "Everything happens on the technician's phone, while the job is being done.")}</p>
          </div>
          <GorununceOynat className="mt-14 grid items-start gap-14 md:grid-cols-2">
            <div className="text-center">
              <span className="eyebrow" style={{ background: "var(--tile)", borderColor: "var(--tile)" }}>{c("Kağıt koçanla", "With carbon-copy forms")}</span>
              <div className="relative mx-auto mt-6" style={{ maxWidth: 420, height: 330 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 60 }}><KagitYigini /></div>
                <div className="suz" style={{ position: "absolute", left: 0, top: 6 }}><Bildirim d={650} ik="telefon" kim={c("Hakan Bey", "Mr Bradley")} t={c("2 gün önce", "2 days ago")} ne={c("“Pompayı değiştirdiğinizi nereden bileyim? Ödemeyi yapmıyorum.”", "“How do I know you replaced the pump? I'm not paying.”")} /></div>
                <div className="suz2" style={{ position: "absolute", right: 0, top: 128 }}><Bildirim d={1070} ik="kalem" kim={c("Murat, Buca servisi", "Ryan, Dalston van")} t={c("dün 21:40", "yesterday 21:40")} ne={c("“Karbon kopya silik çıkmış, seri no okunmuyor.”", "“The carbon copy is faint, I can't read the serial number.”")} style={{ width: 240 }} /></div>
                <div className="suz" style={{ position: "absolute", left: 10, bottom: 0 }}><Bildirim d={1490} ik="saat" kim={c("Hatırlatma", "Reminder")} t={c("3 gün", "3 days")} ne={c("12 servis fişi temize çekilmeyi bekliyor.", "12 service slips are waiting to be written up.")} style={{ width: 250 }} /></div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 22 }}>{c("Her şey dağınık", "Everything is scattered")}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>{c("Kim neyi değiştirdi, kimse bilmiyor.", "Nobody knows who replaced what.")}</div>
              <span className="pill bad" style={{ marginTop: 8 }}>{c("2 gün sonra hâlâ tartışma", "Still arguing 2 days later")}</span>
            </div>
            <div className="text-center">
              <span className="eyebrow" style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" }}>{c("Fixnote ile", "With Fixnote")}</span>
              <div className="mt-6 md:min-h-[330px]">
              <div className="card mx-auto text-left" style={{ maxWidth: 430, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{c("Kombi bakımı · Erzene Mah.", "Boiler service · Elm Grove")}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{c("3 Ekim Cumartesi", "Saturday 3 October")} · {ornek.teknisyen}</div>
                  </div>
                  <span className="pill ok kb-tamam" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Ikon ad="tik" boy={11} kalinlik={3} />{c("Tamamlandı", "Completed")}</span>
                </div>
                <div className="kb-adimlar">
                  <span className="kb-ray" aria-hidden="true"><i /></span>
                  {[
                    ["belge", c("Form sahada dolduruldu", "Form filled in on site"), "15:32", c("9 madde, 2 parça, KDV'li toplam.", "9 steps, 2 parts, total with VAT."), "var(--accent-soft)", "var(--accent)", 2000],
                    ["imza", c("Müşteri imzaladı", "Customer signed"), "15:38", c("Ayşe Hanım parmağıyla, telefonun ekranına.", "Sarah signed with her finger, on the phone screen."), "var(--accent-soft)", "var(--accent)", 2900],
                    ["mesaj", c("WhatsApp'tan gönderildi", "Sent on WhatsApp"), "15:40", c("PDF rapor kapıdan çıkmadan müşteride.", "The PDF reaches the customer before you leave."), "var(--ok-soft)", "var(--ok)", 3800],
                  ].map(([ik, t, s, d, bg, fg, ms]) => (
                    <div key={ik as string} className="kb-adim" style={{ "--d": `${ms}ms`, display: "flex", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line)" } as React.CSSProperties}>
                      <span className="kb-ikon" style={{ "--bg": bg, "--fg": fg, flex: "none", width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center" } as React.CSSProperties}><Ikon ad={ik as string} boy={17} /></span>
                      <div><div className="kb-adim-baslik" style={{ fontWeight: 800, fontSize: 13.5 }}>{t} <span className="num" style={{ fontSize: 11, color: "var(--faint)", marginLeft: 4 }}>{s}</span></div><div className="kb-adim-acik" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
                    </div>
                  ))}
                </div>
                <div className="kb-alt" style={{ background: "var(--panel)", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 800, color: "var(--muted)" }}>{c("Akşam temize çekmek yok.", "No writing up in the evening.")}</div>
              </div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 22 }}>{c("Her şey tek yerde", "Everything in one place")}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>{c("Müşteri imzalı raporunu aynı gün alır.", "The customer gets the signed report the same day.")}</div>
              <span className="pill acc" style={{ marginTop: 8 }}>{c("8 dakikada bitti", "Done in 8 minutes")}</span>
            </div>
          </GorununceOynat>
        </div>
      </section>

      {/* SÜRE HESABI */}
      <section>
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-24">
          <GorununceOynat>
            <span className="eyebrow">{c("Zaman hesabı", "The time check")}</span>
            <h2 className="h2 mt-4">{c("Usta sahada kazanır,", "You earn on site,")}<br />{c("masada kaybeder.", "you lose at the desk.")}</h2>
            <p className="sub mt-4" style={{ maxWidth: 440 }}>{c("Rapor başına birkaç dakika, ayda saatler eder. İki rakamı kendi işine göre kaydır, masada kaybettiğin süreyi gör.", "A few minutes per report adds up to hours every month. Slide the two numbers to match your work and see the time you lose at the desk.")}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 12 }}>
              {[
                ["kalem", c("Karbonlu koçanı doldurup kopyasını ayırmak", "Filling in a carbon-copy form and tearing off the copy"), c("Telefonda form, parmakla imza", "A form on the phone, signed with a finger")],
                ["saat", c("Gün bitince fişleri temize çekmek", "Writing up the slips at the end of the day"), c("A4 rapor kendiliğinden hazır", "The A4 report builds itself")],
                ["kamera", c("Fotoğrafları bulup müşteriye ayrı ayrı atmak", "Finding photos and sending them one by one"), c("Fotoğraflar raporun içinde", "Photos inside the report")],
                ["telefon", c("“Hangi parça takıldı?” sorusuna eski fiş aramak", "Digging out old slips to answer “Which part did you fit?”"), c("Telefon numarasından bütün geçmiş", "Full history from a phone number")],
              ].map(([ik, dert, cozum], i) => (
                <li key={ik} className="zh-madde" style={{ "--d": `${2900 + i * 520}ms`, display: "flex", gap: 12, alignItems: "flex-start" } as React.CSSProperties}>
                  <span className="zh-ikon"><Ikon ad={ik} boy={15} /></span>
                  <div style={{ minWidth: 0 }}>
                    <span className="zh-dert">{dert}</span>
                    <div className="zh-cozum"><Ikon ad="tik" boy={13} kalinlik={2.6} />{cozum}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 18, fontSize: 13.5, fontWeight: 600, color: "var(--muted)" }}>
              {c("Kurulum yok, kart yok.", "No setup, no card.")}{" "}
              <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" style={{ color: "var(--accent)", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>{c("İlk raporu 2 dakikada oluştur", "Create your first report in 2 minutes")}<Ikon ad="ok" boy={14} /></a>
            </div>
          </GorununceOynat>
          <SureHesap />
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">{c("Üç adımda rapor", "A report in three steps")}</span>
            <h2 className="h2 mt-4">{c("Doldur, imzalat, gönder. Gerisi Fixnote'ta.", "Fill in, sign, send. Fixnote does the rest.")}</h2>
            <p className="sub mx-auto mt-3" style={{ maxWidth: 560 }}>{c("Formu işin başında doldurursun, firma başlıklı A4 raporu Fixnote hazırlar. İmza, rapor ve teslim müşterinin kapısında tamamlanır.", "You fill in the form as the job starts and Fixnote prepares the branded A4 report. Signature, report and handover are all done at the customer's door.")}</p>
          </div>
          <GorununceOynat className="mt-14">
            <div className="nc-cizgi hidden md:block" aria-hidden="true"><i /></div>
            <div className="grid gap-6 md:mt-5 md:grid-cols-3">
            {/* 1 */}
            <div>
              <div className="nc-kart" style={{ "--d": "100ms", "--sure": "2400ms", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, overflow: "hidden" } as React.CSSProperties}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4 }}>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ height: 3, borderRadius: 2, background: i < 5 ? "var(--accent)" : "var(--line-2)" }} />)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  {[["kisiler", ornek.musteri.ad], ["anahtar", SABLONLAR[0].ad]].map(([ik, t]) => <span key={t} style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px", fontSize: 10.5, fontWeight: 800, display: "flex", gap: 5, alignItems: "center" }}><Ikon ad={ik} boy={11} style={{ color: "var(--muted)" }} />{t}</span>)}
                </div>
                <div className="mini" style={{ marginTop: 12 }}>{c("Fotoğraflar", "Photos")}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
                  <img src={demoFoto("once")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 7 }} />
                  <img src={demoFoto("sonra")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 7 }} />
                  <span style={{ border: "1.5px dashed var(--line-2)", borderRadius: 7, display: "grid", placeItems: "center", color: "var(--faint)" }}><Ikon ad="kamera" boy={15} /></span>
                </div>
                <div className="mini" style={{ marginTop: 12 }}>{c("Kontrol listesi", "Checklist")}</div>
                {SABLONLAR[0].maddeler.slice(0, 3).map((m, i) => (
                  <div key={m} style={{ "--d": `${500 + i * 400}ms`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, padding: "5px 0", color: i === 2 ? "var(--faint)" : "var(--ink)" } as React.CSSProperties}>
                    <span className={i === 2 ? undefined : "nc-madde"} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m}</span>
                    <span className={i === 2 ? "nc-sw" : "nc-sw nc-acik"} />
                  </div>
                ))}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, marginTop: 8, padding: "6px 10px" }}>
                  <div className="mini" style={{ fontSize: 8.5 }}>{c("Müşteri imzası", "Customer signature")}</div>
                  <img className="nc-imza" src={demoImza(31)} alt="" style={{ height: 34, display: "block", margin: "0 auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num nc-no" style={{ "--d": "100ms", flex: "none", width: 20, height: 20, borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } as React.CSSProperties}>1</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c("Sahada doldur ve imzalat", "Fill in and sign on site")}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{c("Hizmeti seç, kontrol listesi hazır gelir. Yapılmayanı kapat, fotoğrafı çek, müşteriye parmağıyla imzalat.", "Pick the service and the checklist is ready. Switch off what you skipped, take the photos, and have the customer sign with a finger.")}</div></div>
              </div>
            </div>
            {/* 2 */}
            <div>
              <div className="nc-kart" style={{ "--d": "2500ms", "--sure": "1600ms", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, display: "grid", placeItems: "center" } as React.CSSProperties}>
                <div style={{ width: "100%", maxWidth: 250, background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 16, boxShadow: "var(--shadow-md)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="doc-ico" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="belge" boy={16} /></span>
                    <div>
                      <div className="nc-baslik" style={{ fontWeight: 800, fontSize: 13 }}><span className="nc-b1" aria-hidden="true">{c("A4 rapor diziliyor", "Laying out the A4 report")}</span><span className="nc-b2">{c("A4 rapor hazır", "A4 report ready")}</span></div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>{ornek.no}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "var(--tile)", marginTop: 14, overflow: "hidden" }}><div className="nc-bar" style={{ width: "100%", height: "100%", background: "var(--accent)" }} /></div>
                  {[c("Firma başlığı ve rapor no", "Company header and report no"), c("Kontrol listesi, parça, KDV", "Checklist, parts, VAT"), c("Fotoğraf ve imza", "Photos and signature")].map((t, i) => (
                    <div key={t} className="nc-ok" style={{ "--d": `${2800 + i * 400}ms`, display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, fontWeight: 700, marginTop: 9 } as React.CSSProperties}>
                      <span className="nc-ok-ikon" style={{ width: 16, height: 16, borderRadius: 8, display: "grid", placeItems: "center" }}><Ikon ad="tik" boy={10} kalinlik={3} /></span>{t}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num nc-no" style={{ "--d": "2500ms", flex: "none", width: 20, height: 20, borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } as React.CSSProperties}>2</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c("A4 rapor kendini hazırlar", "The A4 report builds itself")}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{c("Firma logon, rapor numarası, parça tablosu ve KDV'li toplam tek sayfada. Elle yazacak bir şey kalmaz.", "Your logo, report number, parts table and total with VAT on one page. Nothing left to write by hand.")}</div></div>
              </div>
            </div>
            {/* 3 */}
            <div>
              <div className="nc-kart" style={{ "--d": "4100ms", "--sure": "1500ms", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, display: "grid", placeItems: "center" } as React.CSSProperties}>
                <div style={{ width: "100%", maxWidth: 260, textAlign: "center" }}>
                  <span className="nc-tik" style={{ width: 34, height: 34, borderRadius: 17, border: "1.5px solid var(--ok)", color: "var(--ok)", display: "inline-grid", placeItems: "center" }}><Ikon ad="tik" boy={18} kalinlik={2.6} /></span>
                  <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>{c("Raporun hazır", "Your report is ready")}</div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginTop: 12, textAlign: "left" }}>
                    <div className="mini" style={{ fontSize: 8.5 }}>{c("Dosya", "File")}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 2 }}>{ornek.no} {ornek.musteri.ad}.pdf</div>
                    <div style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>{c("3 Ekim 2026 · 1 sayfa", "3 October 2026 · 1 page")}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                    {[["indir", "PDF"], ["kalem", c("Düzenle", "Edit")]].map(([ik, t]) => <span key={t} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 9, padding: "7px", fontSize: 11, fontWeight: 800, display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}><Ikon ad={ik} boy={12} />{t}</span>)}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginTop: 6, textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{c("WhatsApp'la gönder", "Send on WhatsApp")}</div>
                    <div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{telefonGoster(ornek.musteri.telefon)}</div>
                    <div className="nc-gonder" style={{ background: "var(--ok)", color: "#fff", borderRadius: 8, padding: "7px", fontSize: 11, fontWeight: 800, textAlign: "center", marginTop: 7 }}><span className="nc-g1" aria-hidden="true">{c("Raporu gönder", "Send report")}</span><span className="nc-g2">{c("Gönderildi", "Sent")} <Ikon ad="tik" boy={11} kalinlik={3} /></span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num nc-no" style={{ "--d": "4100ms", flex: "none", width: 20, height: 20, borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } as React.CSSProperties}>3</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>{c("PDF kaydet, WhatsApp'la gönder", "Save the PDF, send it on WhatsApp")}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{c("Müşterinin numarasına hazır mesaj açılır, PDF'i ekleyip gönderirsin. Rapor arşivde kalır.", "A ready-made message opens for the customer's number; attach the PDF and send. The report stays in your archive.")}</div></div>
              </div>
            </div>
            </div>
          </GorununceOynat>
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn" style={{ minWidth: 190 }}>{c("İlk raporu oluştur", "Create your first report")}</a>
            <a href="#rapor" className="btn btn-ghost" style={{ minWidth: 190 }}>{c("Örnek raporları gör", "See sample reports")}</a>
          </div>
        </div>
      </section>

      {/* RAPOR GÖRÜNÜMÜ */}
      <section id="rapor" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">{c("Müşterinin eline geçen sayfa", "The page your customer receives")}</span>
            <h2 className="h2 mt-4">{c("Senin firmanın raporu.", "Your company's report.")}</h2>
            <p className="sub mt-3">{c("Logon ve vergi bilgin başlıkta, garanti notun altta. İş değişir, sayfa hep aynı düzende kalır.", "Your logo and tax details in the header, your warranty terms at the bottom. The job changes, the layout stays the same.")}</p>
          </div>
          <div className="mt-12"><OrnekRapor /></div>
        </div>
      </section>

      {/* KOYU BANT: iş */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-14 text-center">
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,.66)" }}>{c("Fixnote senin işine uyar", "Fixnote fits your trade")}</div>
          <div className="h2" style={{ marginTop: 10, color: "#fff", minHeight: "1.1em" }}><IsDongu /></div>
        </div>
      </section>

      {/* ŞABLON EDİTÖRÜ */}
      <section id="sablon" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">{c("Şablon editörü", "Template editor")}</span>
            <h2 className="h2 mt-4">{c("İşin listede yoksa,", "If your job isn't on the list,")}<br />{c("listeyi sen yaz.", "write the list yourself.")}</h2>
            <p className="sub mx-auto mt-3" style={{ maxWidth: 540 }}>{c("Kombi, klima, beyaz eşya, ilaçlama ve elektrik için hazır listelerle başlarsın. Asansör, su arıtma ya da kamera kurulumu için listeni bir kez yazarsın; sonraki her formda maddeler ve cihaz türü hazır gelir.", "Start with ready-made lists for boilers, air conditioning, appliances, pest control and electrical work. Write your own list once for lifts, water treatment or CCTV; every new form then comes with the steps and appliance type filled in.")}</p>
          </div>
          <SablonEditoru />
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn" style={{ minWidth: 190 }}>{c("İlk raporu oluştur", "Create your first report")}</a>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>{c("Uygulamayı aç", "Open the app")}</Link>
          </div>
        </div>
      </section>

      {/* MÜŞTERİ GEÇMİŞİ (referansın yapay zeka kutusu yerine) */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div className="text-center">
            <h2 className="h2">{c("Müşteri aradığında bütün geçmişi önünde.", "When a customer calls, their whole history is in front of you.")}</h2>
            <p className="sub mt-3">{c("Telefon numarasını yazman yeterli: önceki servisler, kayıtlı cihazlar ve bekleyen ödemeler tek kartta.", "Just type the phone number: past visits, saved appliances and unpaid jobs on one card.")}</p>
          </div>
          <MusteriGecmisi />
        </div>
      </section>

      {/* FİYAT */}
      <section id="fiyat" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1000px] px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="h2">{c("Ücretsiz dene, ekibin büyüdükçe ekle.", "Try it free, add people as you grow.")}</h2>
            <p className="sub mt-3">{c("3 gün bütün özellikler açık, kart istemez. Sonra tek başınaysan Usta, ekibin varsa Firma.", "Every feature open for 3 days, no card needed. Then Solo if you work alone, Team if you have a crew.")}</p>
          </div>
          <div className="mt-12"><Fiyat /></div>
        </div>
      </section>

      {/* KOYU BANT: önce / sonra */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:items-center">
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>{c("Ne kazanırsın", "What you gain")}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.12, marginTop: 8 }}>{c("Rapor, sen kapıdan çıkmadan müşteride.", "The report reaches the customer before you're out the door.")}</div>
          </div>
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>{c("Önce", "Before")}</div>
            {[c("Karbon kopyalı koçan", "Carbon-copy forms"), c("Akşam ofiste temize çekmek", "Writing up at the office in the evening"), c("İki gün sonra göndermek", "Sending it two days later")].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.5)", textDecoration: "line-through" }}><Ikon ad="carpi" boy={14} />{x}</div>
            ))}
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,.14)", paddingLeft: 24 }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>{c("Fixnote ile", "With Fixnote")}</div>
            {[c("İş yapılırken doldurulur", "Filled in during the job"), c("Telefonda imzalanır", "Signed on the phone"), c("Kapıdan çıkmadan gider", "Sent before you leave")].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 800 }}><Ikon ad="tik" boy={15} kalinlik={2.6} style={{ color: "#7cc4d6" }} />{x}</div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP */}
      <section style={{ background: "#fff" }}>
        <WhatsAppBolum />
      </section>

      {/* SSS */}
      <section id="sss" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[760px] px-4 pt-20 pb-12 md:pt-28 md:pb-16">
          <h2 className="h2 text-center">{c("Sık sorulan sorular", "Frequently asked questions")}</h2>
          <div className="mt-10" style={{ display: "grid", gap: 10 }}>
            {SSS[dil].map(([s, cevap], i) => (
              <details key={`${dil}-${i}`} className="sss card" open={i === 0} style={{ borderRadius: 14, padding: "16px 18px", boxShadow: "none" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 14.5 }}>
                  {s}<Ikon ad="asagi" boy={17} className="ok-ic" style={{ color: "var(--accent)", transition: "transform .2s" }} />
                </summary>
                <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6 }}>{cevap}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SON CTA */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[800px] px-4 pt-16 pb-20 text-center md:pt-20 md:pb-24">
          <span className="eyebrow">{c("3 gün ücretsiz dene", "Try free for 3 days")}</span>
          <h2 className="h2 mt-4">{c("Bir sonraki servisi", "Hand over your next job")}<br />{c("kağıtsız teslim et.", "without paper.")}</h2>
          <p className="sub mt-3">{c("Telefonunun tarayıcısında aç, ilk raporunu hemen oluştur. Kurulum gerekmez, kredi kartı istenmez.", "Open it in your phone's browser and create your first report straight away. No setup, no credit card.")}</p>
          <a href="/giris?kayit=1&sonra=%2Fapp%3Fyeni%3D1" className="btn mt-7" style={{ minWidth: 200, padding: "14px 22px" }}>{c("İlk raporu oluştur", "Create your first report")}</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--dark)", color: "rgba(255,255,255,.66)", overflow: "hidden" }}>
        <div className="mx-auto max-w-[900px] px-4 pt-16 pb-10 md:pb-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</div>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.6, marginTop: 10, maxWidth: 280 }}>{c("Saha servis ekipleri için dijital servis raporu: doldur, imzalat, WhatsApp'tan gönder. Kayıtların hesabında saklanır, her telefondan açılır.", "Digital service reports for field service teams: fill in, sign, send on WhatsApp. Your records stay in your account and open on any phone.")}</p>
              <DilDugmesi koyu style={{ marginTop: 14 }} />
            </div>
            {[
              [c("Ürün", "Product"), [[c("Nasıl çalışır", "How it works"), "#nasil"], [c("Rapor", "Report"), "#rapor"], [c("Şablonlar", "Templates"), "#sablon"], [c("Fiyat", "Pricing"), "#fiyat"]]],
              [c("Kimler için", "Who it's for"), [[c("Kombi ve klima", "Boilers and air conditioning"), "#sablon"], [c("Beyaz eşya", "Appliances"), "#sablon"], [c("İlaçlama", "Pest control"), "#sablon"], [c("Elektrik", "Electrical"), "#sablon"]]],
              [c("Daha fazla", "More"), [[c("SSS", "FAQ"), "#sss"], [c("Uygulamayı aç", "Open the app"), "/app"], [c("Yeni form", "New form"), "/app?yeni=1"]]],
            ].map(([b, l]) => (
              <div key={b as string}>
                <div className="mini" style={{ color: "rgba(255,255,255,.45)" }}>{b as string}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8, fontSize: 13, fontWeight: 600 }}>
                  {(l as string[][]).map(([t, h]) => <li key={t}><a href={h} className="hover:text-white">{t}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-between" style={{ borderTop: "1px solid rgba(255,255,255,.12)", marginTop: 40, paddingTop: 18, fontSize: 12, fontWeight: 600 }}>
            <span>© 2026 Motiq Automation Ltd · <a href="/gizlilik" className="hover:text-white">{c("Gizlilik", "Privacy")}</a> · <a href="/kosullar" className="hover:text-white">{c("Kullanım koşulları", "Terms of use")}</a></span>
            <span>{c("Bu bir e-fatura değil, iş teslim raporudur.", "This is not an invoice, it's a job completion report.")}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
