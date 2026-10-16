/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Ikon, { Isaret } from "./components/Ikon";
import { SureHesap, OrnekRapor, IsDongu, Fiyat, SablonEditoru, MusteriGecmisi, WhatsAppBolum } from "./components/LandingParcalar";
import GorununceOynat from "./components/GorununceOynat";
import HeroMaket from "./components/HeroMaket";
import {
  DEMO_RAPORLAR, SABLONLAR, telefonGoster, demoFoto, demoImza,
} from "./lib/servis";

// ---------- bölümlerde kullanılan örnek kayıt ve müşteri ----------
const ORNEK = DEMO_RAPORLAR.find((r) => r.no === "SR-2026-0048")!;
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
const SSS = [
  ["Uygulama indirmem gerekiyor mu?", "Hayır. Fixnote telefonunun tarayıcısında açılır; mağazadan indirme, kurulum ya da hesap gerekmez. İstersen ana ekrana kısayol ekler, tek dokunuşla açarsın. Form açıkken internet kesilse de doldurmaya devam edersin; kayıt telefona yazılır."],
  ["PDF nasıl oluşuyor?", "Rapor ekranındaki \"PDF olarak kaydet\" düğmesi raporu A4 düzeninde telefonun yazdırma ekranına gönderir. Orada \"PDF olarak kaydet\"i seçmen yeterli; Android'de ve iPhone'da aynı şekilde çalışır."],
  ["PDF WhatsApp'tan nasıl gönderiliyor?", "WhatsApp düğmesi, müşterinin numarasına rapor özetini hazır mesaj olarak açar: rapor no, yapılan işlemler, değişen parça, KDV'li toplam ve teknisyen. Kaydettiğin PDF'i aynı sohbete ekleyip gönderirsin. Numara 05xx diye yazılmış olsa da doğru biçime çevrilir."],
  ["Hangi işler için uygun?", "Müşterinin evinde ya da işyerinde iş yapıp teslim eden her servis için: kombi ve klima, beyaz eşya, ilaçlama, elektrik ve tesisat, asansör bakımı, kamera ve alarm kurulumu. Hazır şablonu olmayan işler için kendi kontrol listeni eklersin."],
  ["Kendi kontrol listemi ekleyebilir miyim?", "Evet. Ayarlar'da şablon adını, cihaz türünü ve her satıra bir işlemi yazarsın. Şablon yeni formda hizmet türü olarak çıkar; maddeler işaretli gelir, yapılmayanı kapatırsın."],
  ["Bu bir e-fatura mı?", "Hayır. Fixnote bir iş teslim raporudur: ne yapıldı, hangi parça değişti, müşteri onayladı mı. Faturayı bugün kullandığın yöntemle kesmeye devam edersin."],
  ["Kayıtlarım nerede saklanıyor?", "Yalnızca kendi telefonunun tarayıcısında; hiçbir veri sunucuya gönderilmez. Ayarlar'dan tek dosyalık yedek indirirsin; telefon değişirse ya da kaybolursa son yedeğini yeni cihaza yüklersin. Düzenli yedek almanı öneririz."],
];

export default function Home() {
  return (
    <main>
      {/* NAV: yüzen kart */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, padding: "12px 16px 0" }}>
        <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-3" style={{ background: "rgba(255,255,255,.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid var(--line)", borderRadius: 18, boxShadow: "var(--shadow-sm)", padding: "9px 10px 9px 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>
          <div className="hidden items-center gap-7 lg:flex" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted)" }}>
            <a href="#nasil" className="hover:text-[var(--ink)]">Nasıl çalışır</a>
            <a href="#rapor" className="hover:text-[var(--ink)]">Rapor</a>
            <a href="#sablon" className="hover:text-[var(--ink)]">Şablonlar</a>
            <a href="#fiyat" className="hover:text-[var(--ink)]">Fiyat</a>
            <a href="#sss" className="hover:text-[var(--ink)]">SSS</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="hidden sm:inline" style={{ fontSize: 13.5, fontWeight: 700 }}>Uygulamayı aç</Link>
            <Link href="/app?yeni=1" className="btn" style={{ padding: "9px 14px", fontSize: 13, borderRadius: 11 }}>İlk raporu oluştur</Link>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section style={{ paddingTop: 64 }}>
        <div className="mx-auto max-w-[1120px] px-4 text-center">
          <span className="eyebrow" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12, fontWeight: 700, padding: "6px 14px", color: "var(--ink)" }}>
            <Ikon ad="anahtar" boy={14} style={{ color: "var(--accent)" }} />Kombi, klima, beyaz eşya ve ilaçlama servisleri için
          </span>
          <h1 className="h1" style={{ marginTop: 22 }}>
            <span className="hero-word" style={{ animationDelay: "0ms" }}>Rapor</span>{" "}
            <span className="hero-word" style={{ animationDelay: "70ms" }}>kapıda</span>{" "}
            <span className="hero-word" style={{ animationDelay: "140ms" }}>biter,</span>
            <br />
            <span className="hero-word hero-mark" style={{ animationDelay: "260ms", color: "var(--accent)" }}>akşamın</span>{" "}
            <span className="hero-word hero-mark" style={{ animationDelay: "330ms", color: "var(--accent)" }}>sana</span>{" "}
            <span className="hero-word hero-mark" style={{ animationDelay: "400ms", color: "var(--accent)" }}>kalır.</span>
          </h1>
          <p className="sub mx-auto hero-rise" style={{ maxWidth: 640, marginTop: 20, fontSize: 16 }}>
            Teknisyen telefondan formu doldurur, müşteriye parmağıyla imzalatır. Temiz bir A4 rapor bir dakikada hazır: PDF olarak kaydet, WhatsApp&apos;tan gönder.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5 hero-rise">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 190 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>Örnek raporları gör</Link>
          </div>
        </div>
        <HeroMaket />
      </section>

      {/* SORUN: önce / sonra */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="h2">Koçan kaybolur,<br />imzalı rapor kalır.</h2>
            <p className="sub mt-3">Her şey iş yapılırken, teknisyenin telefonunda.</p>
          </div>
          <GorununceOynat className="mt-14 grid items-start gap-14 md:grid-cols-2">
            <div className="text-center">
              <span className="eyebrow" style={{ background: "var(--tile)", borderColor: "var(--tile)" }}>Kağıt koçanla</span>
              <div className="relative mx-auto mt-6" style={{ maxWidth: 420, height: 330 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 60 }}><KagitYigini /></div>
                <div className="suz" style={{ position: "absolute", left: 0, top: 6 }}><Bildirim d={650} ik="telefon" kim="Hakan Bey" t="2 gün önce" ne="“Pompayı değiştirdiğinizi nereden bileyim? Ödemeyi yapmıyorum.”" /></div>
                <div className="suz2" style={{ position: "absolute", right: 0, top: 128 }}><Bildirim d={1070} ik="kalem" kim="Murat, Buca servisi" t="dün 21:40" ne="“Karbon kopya silik çıkmış, seri no okunmuyor.”" style={{ width: 240 }} /></div>
                <div className="suz" style={{ position: "absolute", left: 10, bottom: 0 }}><Bildirim d={1490} ik="saat" kim="Hatırlatma" t="3 gün" ne="12 servis fişi temize çekilmeyi bekliyor." style={{ width: 250 }} /></div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 22 }}>Her şey dağınık</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>Kim neyi değiştirdi, kimse bilmiyor.</div>
              <span className="pill bad" style={{ marginTop: 8 }}>2 gün sonra hâlâ tartışma</span>
            </div>
            <div className="text-center">
              <span className="eyebrow" style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" }}>Fixnote ile</span>
              <div className="mt-6 md:min-h-[330px]">
              <div className="card mx-auto text-left" style={{ maxWidth: 430, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Kombi bakımı · Erzene Mah.</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>3 Ekim Cumartesi · {ORNEK.teknisyen}</div>
                  </div>
                  <span className="pill ok kb-tamam" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Ikon ad="tik" boy={11} kalinlik={3} />Tamamlandı</span>
                </div>
                <div className="kb-adimlar">
                  <span className="kb-ray" aria-hidden="true"><i /></span>
                  {[
                    ["belge", "Form sahada dolduruldu", "15:32", "9 madde, 2 parça, KDV'li toplam.", "var(--accent-soft)", "var(--accent)", 2000],
                    ["imza", "Müşteri imzaladı", "15:38", "Ayşe Hanım parmağıyla, telefonun ekranına.", "var(--accent-soft)", "var(--accent)", 2900],
                    ["mesaj", "WhatsApp'tan gönderildi", "15:40", "PDF rapor kapıdan çıkmadan müşteride.", "var(--ok-soft)", "var(--ok)", 3800],
                  ].map(([ik, t, s, d, bg, fg, ms]) => (
                    <div key={t as string} className="kb-adim" style={{ "--d": `${ms}ms`, display: "flex", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line)" } as React.CSSProperties}>
                      <span className="kb-ikon" style={{ "--bg": bg, "--fg": fg, flex: "none", width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center" } as React.CSSProperties}><Ikon ad={ik as string} boy={17} /></span>
                      <div><div className="kb-adim-baslik" style={{ fontWeight: 800, fontSize: 13.5 }}>{t} <span className="num" style={{ fontSize: 11, color: "var(--faint)", marginLeft: 4 }}>{s}</span></div><div className="kb-adim-acik" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
                    </div>
                  ))}
                </div>
                <div className="kb-alt" style={{ background: "var(--panel)", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 800, color: "var(--muted)" }}>Akşam temize çekmek yok.</div>
              </div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 22 }}>Her şey tek yerde</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>Müşteri imzalı raporunu aynı gün alır.</div>
              <span className="pill acc" style={{ marginTop: 8 }}>8 dakikada bitti</span>
            </div>
          </GorununceOynat>
        </div>
      </section>

      {/* SÜRE HESABI */}
      <section>
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-24">
          <GorununceOynat>
            <span className="eyebrow">Zaman hesabı</span>
            <h2 className="h2 mt-4">Usta sahada kazanır,<br />masada kaybeder.</h2>
            <p className="sub mt-4" style={{ maxWidth: 440 }}>Rapor başına birkaç dakika, ayda saatler eder. İki rakamı kendi işine göre kaydır, masada kaybettiğin süreyi gör.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 12 }}>
              {[
                ["kalem", "Karbonlu koçanı doldurup kopyasını ayırmak", "Telefonda form, parmakla imza"],
                ["saat", "Gün bitince fişleri temize çekmek", "A4 rapor kendiliğinden hazır"],
                ["kamera", "Fotoğrafları bulup müşteriye ayrı ayrı atmak", "Fotoğraflar raporun içinde"],
                ["telefon", "“Hangi parça takıldı?” sorusuna eski fiş aramak", "Telefon numarasından bütün geçmiş"],
              ].map(([ik, dert, cozum], i) => (
                <li key={dert} className="zh-madde" style={{ "--d": `${2900 + i * 520}ms`, display: "flex", gap: 12, alignItems: "flex-start" } as React.CSSProperties}>
                  <span className="zh-ikon"><Ikon ad={ik} boy={15} /></span>
                  <div style={{ minWidth: 0 }}>
                    <span className="zh-dert">{dert}</span>
                    <div className="zh-cozum"><Ikon ad="tik" boy={13} kalinlik={2.6} />{cozum}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 18, fontSize: 13.5, fontWeight: 600, color: "var(--muted)" }}>
              Kurulum yok, kart yok.{" "}
              <Link href="/app?yeni=1" style={{ color: "var(--accent)", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>İlk raporu 2 dakikada oluştur<Ikon ad="ok" boy={14} /></Link>
            </div>
          </GorununceOynat>
          <SureHesap />
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">Üç adımda rapor</span>
            <h2 className="h2 mt-4">Doldur, imzalat, gönder. Gerisi Fixnote&apos;ta.</h2>
            <p className="sub mx-auto mt-3" style={{ maxWidth: 560 }}>Formu iş sürerken doldurursun; firma başlıklı A4 raporu Fixnote hazırlar. İş, araca binmeden kapanır.</p>
          </div>
          <GorununceOynat className="mt-14">
            <div className="nc-cizgi hidden md:block" aria-hidden="true"><i /></div>
            <div className="grid gap-6 md:mt-5 md:grid-cols-3">
            {/* 1 */}
            <div>
              <div className="nc-kart" style={{ "--d": "100ms", "--sure": "2400ms", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, overflow: "hidden" } as React.CSSProperties}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4 }}>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ height: 3, borderRadius: 2, background: i < 5 ? "var(--accent)" : "var(--line-2)" }} />)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  {[["kisiler", "Ayşe Kaplan"], ["anahtar", "Kombi bakımı"]].map(([ik, t]) => <span key={t} style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px", fontSize: 10.5, fontWeight: 800, display: "flex", gap: 5, alignItems: "center" }}><Ikon ad={ik} boy={11} style={{ color: "var(--muted)" }} />{t}</span>)}
                </div>
                <div className="mini" style={{ marginTop: 12 }}>Fotoğraflar</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
                  <img src={demoFoto("once")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 7 }} />
                  <img src={demoFoto("sonra")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 7 }} />
                  <span style={{ border: "1.5px dashed var(--line-2)", borderRadius: 7, display: "grid", placeItems: "center", color: "var(--faint)" }}><Ikon ad="kamera" boy={15} /></span>
                </div>
                <div className="mini" style={{ marginTop: 12 }}>Kontrol listesi</div>
                {SABLONLAR[0].maddeler.slice(0, 3).map((m, i) => (
                  <div key={m} style={{ "--d": `${500 + i * 400}ms`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, padding: "5px 0", color: i === 2 ? "var(--faint)" : "var(--ink)" } as React.CSSProperties}>
                    <span className={i === 2 ? undefined : "nc-madde"} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m}</span>
                    <span className={i === 2 ? "nc-sw" : "nc-sw nc-acik"} />
                  </div>
                ))}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, marginTop: 8, padding: "6px 10px" }}>
                  <div className="mini" style={{ fontSize: 8.5 }}>Müşteri imzası</div>
                  <img className="nc-imza" src={demoImza(31)} alt="" style={{ height: 34, display: "block", margin: "0 auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num nc-no" style={{ "--d": "100ms", flex: "none", width: 20, height: 20, borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } as React.CSSProperties}>1</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>Sahada doldur ve imzalat</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Hizmeti seç, kontrol listesi hazır gelir. Yapılmayanı kapat, fotoğrafı çek, müşteriye parmağıyla imzalat.</div></div>
              </div>
            </div>
            {/* 2 */}
            <div>
              <div className="nc-kart" style={{ "--d": "2500ms", "--sure": "1600ms", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, display: "grid", placeItems: "center" } as React.CSSProperties}>
                <div style={{ width: "100%", maxWidth: 250, background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 16, boxShadow: "var(--shadow-md)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="doc-ico" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="belge" boy={16} /></span>
                    <div>
                      <div className="nc-baslik" style={{ fontWeight: 800, fontSize: 13 }}><span className="nc-b1" aria-hidden="true">A4 rapor diziliyor</span><span className="nc-b2">A4 rapor hazır</span></div>
                      <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>{ORNEK.no}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "var(--tile)", marginTop: 14, overflow: "hidden" }}><div className="nc-bar" style={{ width: "100%", height: "100%", background: "var(--accent)" }} /></div>
                  {["Firma başlığı ve rapor no", "Kontrol listesi, parça, KDV", "Fotoğraf ve imza"].map((t, i) => (
                    <div key={t} className="nc-ok" style={{ "--d": `${2800 + i * 400}ms`, display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, fontWeight: 700, marginTop: 9 } as React.CSSProperties}>
                      <span className="nc-ok-ikon" style={{ width: 16, height: 16, borderRadius: 8, display: "grid", placeItems: "center" }}><Ikon ad="tik" boy={10} kalinlik={3} /></span>{t}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num nc-no" style={{ "--d": "2500ms", flex: "none", width: 20, height: 20, borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } as React.CSSProperties}>2</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>A4 rapor kendini hazırlar</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Firma logon, rapor numarası, parça tablosu ve KDV&apos;li toplam tek sayfada. Elle yazacak bir şey kalmaz.</div></div>
              </div>
            </div>
            {/* 3 */}
            <div>
              <div className="nc-kart" style={{ "--d": "4100ms", "--sure": "1500ms", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, display: "grid", placeItems: "center" } as React.CSSProperties}>
                <div style={{ width: "100%", maxWidth: 260, textAlign: "center" }}>
                  <span className="nc-tik" style={{ width: 34, height: 34, borderRadius: 17, border: "1.5px solid var(--ok)", color: "var(--ok)", display: "inline-grid", placeItems: "center" }}><Ikon ad="tik" boy={18} kalinlik={2.6} /></span>
                  <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>Raporun hazır</div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginTop: 12, textAlign: "left" }}>
                    <div className="mini" style={{ fontSize: 8.5 }}>Dosya</div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 2 }}>{ORNEK.no} {ORNEK.musteri.ad}.pdf</div>
                    <div style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>3 Ekim 2026 · 1 sayfa</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                    {[["indir", "PDF"], ["kalem", "Düzenle"]].map(([ik, t]) => <span key={t} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 9, padding: "7px", fontSize: 11, fontWeight: 800, display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}><Ikon ad={ik} boy={12} />{t}</span>)}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginTop: 6, textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>WhatsApp&apos;la gönder</div>
                    <div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{telefonGoster(ORNEK.musteri.telefon)}</div>
                    <div className="nc-gonder" style={{ background: "var(--ok)", color: "#fff", borderRadius: 8, padding: "7px", fontSize: 11, fontWeight: 800, textAlign: "center", marginTop: 7 }}><span className="nc-g1" aria-hidden="true">Raporu gönder</span><span className="nc-g2">Gönderildi <Ikon ad="tik" boy={11} kalinlik={3} /></span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num nc-no" style={{ "--d": "4100ms", flex: "none", width: 20, height: 20, borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } as React.CSSProperties}>3</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>PDF kaydet, WhatsApp&apos;la gönder</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Müşterinin numarasına hazır mesaj açılır, PDF&apos;i ekleyip gönderirsin. Rapor arşivde kalır.</div></div>
              </div>
            </div>
            </div>
          </GorununceOynat>
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 190 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>Örnek raporları gör</Link>
          </div>
        </div>
      </section>

      {/* RAPOR GÖRÜNÜMÜ */}
      <section id="rapor" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">Müşterinin eline geçen sayfa</span>
            <h2 className="h2 mt-4">Senin firmanın raporu.</h2>
            <p className="sub mt-3">Logon ve vergi bilgin başlıkta, garanti notun altta. İş değişir, sayfa hep aynı düzende kalır.</p>
          </div>
          <div className="mt-12"><OrnekRapor /></div>
        </div>
      </section>

      {/* KOYU BANT: iş */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-14 text-center">
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,.66)" }}>Fixnote senin işine uyar</div>
          <div className="h2" style={{ marginTop: 10, color: "#fff", minHeight: "1.1em" }}><IsDongu /></div>
        </div>
      </section>

      {/* ŞABLON EDİTÖRÜ */}
      <section id="sablon" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">Şablon editörü</span>
            <h2 className="h2 mt-4">İşin listede yoksa,<br />listeyi sen yaz.</h2>
            <p className="sub mx-auto mt-3" style={{ maxWidth: 540 }}>Beş hazır şablonla başlarsın. Asansör, su arıtma, kamera kurulumu: her satıra bir madde yaz; sonraki formda liste ve cihaz türü hazır gelir.</p>
          </div>
          <SablonEditoru />
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 190 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>Uygulamayı aç</Link>
          </div>
        </div>
      </section>

      {/* MÜŞTERİ GEÇMİŞİ (referansın yapay zeka kutusu yerine) */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div className="text-center">
            <h2 className="h2">Müşteri aradığında her şey önünde.</h2>
            <p className="sub mt-3">Telefon numarasından bütün servis geçmişi, ekstra kayıt tutmadan.</p>
          </div>
          <MusteriGecmisi />
        </div>
      </section>

      {/* FİYAT */}
      <section id="fiyat" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1000px] px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="h2">Ücretsiz dene, ekibin büyüdükçe ekle.</h2>
            <p className="sub mt-3">14 gün bütün özellikler açık. Sonra teknisyen başına sabit ücret.</p>
          </div>
          <div className="mt-12"><Fiyat /></div>
        </div>
      </section>

      {/* KOYU BANT: önce / sonra */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:items-center">
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>Ne kazanırsın</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.12, marginTop: 8 }}>Rapor, sen kapıdan çıkmadan müşteride.</div>
          </div>
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>Önce</div>
            {["Karbon kopyalı koçan", "Akşam ofiste temize çekmek", "İki gün sonra göndermek"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.5)", textDecoration: "line-through" }}><Ikon ad="carpi" boy={14} />{x}</div>
            ))}
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,.14)", paddingLeft: 24 }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>Fixnote ile</div>
            {["İş yapılırken doldurulur", "Telefonda imzalanır", "Kapıdan çıkmadan gider"].map((x) => (
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
          <h2 className="h2 text-center">Sık sorulan sorular</h2>
          <div className="mt-10" style={{ display: "grid", gap: 10 }}>
            {SSS.map(([s, c], i) => (
              <details key={s} className="sss card" open={i === 0} style={{ borderRadius: 14, padding: "16px 18px", boxShadow: "none" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 14.5 }}>
                  {s}<Ikon ad="asagi" boy={17} className="ok-ic" style={{ color: "var(--accent)", transition: "transform .2s" }} />
                </summary>
                <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6 }}>{c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SON CTA */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[800px] px-4 pt-16 pb-20 text-center md:pt-20 md:pb-24">
          <span className="eyebrow">2 dakikada dene</span>
          <h2 className="h2 mt-4">Bir sonraki servisi<br />kağıtsız kapat.</h2>
          <p className="sub mt-3">Telefonundan aç, ilk raporu oluştur, müşteriye imzalat. Kurulum yok, kart yok.</p>
          <Link href="/app?yeni=1" className="btn mt-7" style={{ minWidth: 200, padding: "14px 22px" }}>İlk raporu oluştur</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--dark)", color: "rgba(255,255,255,.66)", overflow: "hidden" }}>
        <div className="mx-auto max-w-[900px] px-4 pt-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</div>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.6, marginTop: 10, maxWidth: 280 }}>Teknisyenin sahada servis raporunu doldurup imzalatması ve WhatsApp&apos;tan göndermesi için. Kayıtlar senin cihazında durur.</p>
            </div>
            {[
              ["Ürün", [["Nasıl çalışır", "#nasil"], ["Rapor", "#rapor"], ["Şablonlar", "#sablon"], ["Fiyat", "#fiyat"]]],
              ["Kimler için", [["Kombi ve klima", "#sablon"], ["Beyaz eşya", "#sablon"], ["İlaçlama", "#sablon"], ["Elektrik", "#sablon"]]],
              ["Daha fazla", [["SSS", "#sss"], ["Uygulamayı aç", "/app"], ["Yeni form", "/app?yeni=1"]]],
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
            <span>© 2026 Fixnote</span>
            <span>Bu bir e-fatura değil, iş teslim raporudur.</span>
          </div>
        </div>
        <div aria-hidden="true" style={{ textAlign: "center", fontWeight: 800, fontSize: "clamp(56px, 12vw, 170px)", letterSpacing: "-0.06em", lineHeight: 0.8, color: "#243246", marginTop: 30, marginBottom: -18, whiteSpace: "nowrap" }}>Fixnote</div>
      </footer>
    </main>
  );
}
