"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DilDugmesi } from "../components/Dil";
import { aktifDil, useDil } from "../lib/dil";
import { DENEME_GUN, guvenliSonra, hataMetni, hatirlaAyarla, hatirlaniyor, hesapAyarli, supabase } from "../components/supabase";

type Mod = "giris" | "kayit" | "unuttum" | "yenile" | "gonderildi";

const DEGERLER = {
  tr: ["Formu telefonda doldur, müşteriye ekranda imzalat", "Firma başlıklı A4 rapor anında hazır", "PDF'i WhatsApp'tan müşteriye gönder"],
  en: ["Fill in the form on your phone, get it signed on screen", "A branded A4 report, ready instantly", "Send the PDF to your customer on WhatsApp"],
};
// texts set from event handlers use the language at that moment
const cAn = (tr: string, en: string) => (aktifDil() === "en" ? en : tr);

// Supabase sends one reset e-mail per address per minute; its error message carries the wait in seconds.
const BEKLEME = 60;
const beklemeSaniye = (m: string) => {
  const x = /after (\d+) seconds?/i.exec(m);
  return x ? Number(x[1]) : 0;
};

export default function GirisFormu() {
  const dil = useDil();
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [mod, setMod] = useState<Mod>("giris");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [goster, setGoster] = useState(false);
  const [hatirla, setHatirla] = useState(true); // "Beni hatırla", read from this browser on load
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const [gonderilen, setGonderilen] = useState<"kayit" | "sifre">("kayit");
  const [sonra, setSonra] = useState("/app");
  const [kalan, setKalan] = useState(0); // seconds until a new reset link can be requested
  const [tekrar, setTekrar] = useState(false); // a new link was sent from the "check your e-mail" screen
  const [silindi, setSilindi] = useState(false); // came here after Settings > Delete my account

  // Read ?sonra= and ?yenile=1 on the client; an existing session goes straight to the app.
  useEffect(() => {
    setHatirla(hatirlaniyor());
    const q = new URLSearchParams(window.location.search);
    const hedef = guvenliSonra(q.get("sonra"));
    setSonra(hedef);
    if (q.get("silindi") === "1") {
      setSilindi(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
    const yenile = q.get("yenile") === "1";
    if (yenile) setMod("yenile");
    else if (q.get("kayit") === "1") setMod("kayit"); // trial buttons open the sign-up tab
    const sb = supabase();
    if (!sb) return;
    if (yenile) {
      // The reset link brings a one-time session in the URL hash. No session means the link is
      // invalid, already used or expired: switch to "request a new link". Tokens leave the address bar.
      sb.auth.getSession().then(({ data }) => {
        if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
        if (!data.session) {
          setMod("unuttum");
          setHata(cAn("Bu sıfırlama bağlantısı geçersiz ya da süresi dolmuş. E-posta adresini yaz, yeni bağlantı gönderelim.", "This reset link is invalid or has expired. Enter your email address and we'll send a new one."));
        }
      });
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(hedef);
    });
  }, []);

  useEffect(() => {
    if (kalan <= 0) return;
    const t = window.setTimeout(() => setKalan((k) => k - 1), 1000);
    return () => window.clearTimeout(t);
  }, [kalan]);

  const degistir = (m: Mod) => {
    setMod(m);
    setHata("");
    setSifre("");
    setTekrar(false);
  };

  // Sends the reset e-mail; starts the one-minute countdown (or the wait Supabase asks for).
  async function baglantiIste() {
    const sb = supabase();
    if (!sb) return;
    const { error } = await sb.auth.resetPasswordForEmail(eposta.trim(), { redirectTo: `${window.location.origin}/giris?yenile=1` });
    if (error) {
      setKalan(beklemeSaniye(error.message));
      throw error;
    }
    setKalan(BEKLEME);
  }

  async function tekrarGonder() {
    if (bekle || kalan > 0) return;
    setHata("");
    setTekrar(false);
    setBekle(true);
    try {
      await baglantiIste();
      setTekrar(true);
    } catch (err) {
      setHata(hataMetni(err instanceof Error ? err.message : String(err)));
    } finally {
      setBekle(false);
    }
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb || bekle) return;
    setHata("");
    if ((mod === "kayit" || mod === "yenile") && sifre.length < 8) {
      setHata(cAn("Şifre en az 8 karakter olmalı.", "The password must be at least 8 characters."));
      return;
    }
    setBekle(true);
    if (mod === "giris" || mod === "kayit") hatirlaAyarla(hatirla);
    try {
      if (mod === "giris") {
        const { error } = await sb.auth.signInWithPassword({ email: eposta.trim(), password: sifre });
        if (error) throw error;
        window.location.replace(sonra);
        return;
      }
      if (mod === "kayit") {
        const { data, error } = await sb.auth.signUp({ email: eposta.trim(), password: sifre, options: { emailRedirectTo: window.location.origin + sonra } });
        if (error) throw error;
        // With e-mail confirmation on, an existing address comes back as a user without identities.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setHata(cAn("Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.", "There is already an account with this email. Try signing in."));
          return;
        }
        if (data.session) {
          window.location.replace(sonra);
          return;
        }
        setGonderilen("kayit");
        setMod("gonderildi");
        return;
      }
      if (mod === "unuttum") {
        await baglantiIste();
        setGonderilen("sifre");
        setTekrar(false);
        setMod("gonderildi");
        return;
      }
      if (mod === "yenile") {
        const { data } = await sb.auth.getSession();
        if (!data.session) {
          setHata(cAn("Sıfırlama bağlantısının süresi dolmuş. Yeni bir bağlantı iste.", "The reset link has expired. Request a new one."));
          return;
        }
        const { error } = await sb.auth.updateUser({ password: sifre });
        if (error) throw error;
        window.location.replace(sonra);
      }
    } catch (err) {
      setHata(hataMetni(err instanceof Error ? err.message : String(err)));
    } finally {
      setBekle(false);
    }
  }

  async function google() {
    const sb = supabase();
    if (!sb || bekle) return;
    setHata("");
    setBekle(true);
    hatirlaAyarla(hatirla);
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + sonra } });
    if (error) {
      setHata(hataMetni(error.message));
      setBekle(false);
    }
  }

  const kapali = !hesapAyarli || bekle;
  const baslik = { giris: c("Tekrar hoş geldin", "Welcome back"), kayit: c(`${DENEME_GUN} gün ücretsiz dene`, `Try free for ${DENEME_GUN} days`), unuttum: c("Şifreni sıfırla", "Reset your password"), yenile: c("Yeni şifre belirle", "Set a new password"), gonderildi: c("E-postanı kontrol et", "Check your email") }[mod];
  const aciklama = {
    giris: c("Fixnote hesabına giriş yap.", "Sign in to your Fixnote account."),
    kayit: c("Hesabını oluştur, deneme hemen başlasın. Kart istenmez.", "Create your account and the trial starts right away. No card needed."),
    unuttum: c("Hesabının e-posta adresini yaz; sıfırlama bağlantısı gönderelim.", "Enter your account's email address and we'll send you a reset link."),
    yenile: c("Hesabın için yeni bir şifre yaz.", "Enter a new password for your account."),
    gonderildi: gonderilen === "kayit"
      ? c(`${eposta.trim()} adresine doğrulama bağlantısı gönderdik. Bağlantıya tıklayınca hesabın açılır ve ${DENEME_GUN} günlük deneme başlar.`, `We sent a confirmation link to ${eposta.trim()}. Click it to open your account and start your ${DENEME_GUN}-day trial.`)
      : c(`${eposta.trim()} adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı birkaç dakika içinde gelir. Gelen kutunda göremezsen spam klasörüne de bak.`, `If there is an account for ${eposta.trim()}, a password reset link will arrive within a few minutes. If you can't see it in your inbox, check your spam folder.`),
  }[mod];
  const dugme = { giris: c("Giriş yap", "Sign in"), kayit: c("Hesap oluştur", "Create account"), unuttum: c("Bağlantı gönder", "Send link"), yenile: c("Şifreyi kaydet", "Save password"), gonderildi: "" }[mod];

  return (
    <main className="gr-sayfa">
      <aside className="gr-marka">
        <Link href="/" className="gr-logo gr-logo-buyuk" style={{ alignSelf: "flex-start" }}><Isaret boy={28} />Fixnote</Link>
        <div className="gr-marka-orta">
          <h2 className="gr-manset">{c("Rapor kapıda biter,", "Report done at the door,")}<br /><span style={{ color: "#7cc4d6" }}>{c("akşamın sana kalır.", "your evening stays yours.")}</span></h2>
          <ul className="gr-degerler">
            {DEGERLER[dil].map((d) => (
              <li key={d}>
                <span className="gr-tik" aria-hidden="true"><Ikon ad="tik" boy={14} kalinlik={3} /></span>{d}
              </li>
            ))}
          </ul>
        </div>
        <div className="gr-meta">{c(`${DENEME_GUN} gün ücretsiz · Kart istemez · Kayıtların hesabında, her telefondan`, `${DENEME_GUN} days free · No card needed · Your records in your account, on any phone`)}</div>
      </aside>

      <section className="gr-form-alan">
        <div className="gr-ust">
          <Link href="/" className="gr-logo"><Isaret boy={26} />Fixnote</Link>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DilDugmesi />
            <Link href="/" className="gr-ana"><Ikon ad="sol" boy={15} />{c("Ana sayfa", "Home")}</Link>
          </span>
        </div>

        <div className="gr-merkez">
          <div className="gr-kart">
            {!hesapAyarli && (
              <div role="status" className="gr-not">{c("Giriş henüz yapılandırılmadı. Supabase adresi ve anahtarı eklenince bu sayfa çalışır.", "Sign-in isn't configured yet. This page works once the Supabase address and key are added.")}</div>
            )}

            {silindi && (
              <div role="status" className="gr-not" data-hesap-silindi style={{ background: "var(--ok-soft)", color: "var(--ok)" }}>{c("Hesabın ve kayıtların silindi.", "Your account and records have been deleted.")}</div>
            )}

            {(mod === "giris" || mod === "kayit") && (
              <div role="tablist" aria-label={c("Giriş türü", "Sign-in type")} className="gr-sekmeler">
                <span className="gr-gosterge" data-sag={mod === "kayit"} aria-hidden="true" />
                {([["giris", c("Giriş yap", "Sign in")], ["kayit", c("Hesap oluştur", "Create account")]] as const).map(([m, t]) => (
                  <button key={m} type="button" role="tab" aria-selected={mod === m} onClick={() => degistir(m)} className="gr-sekme">{t}</button>
                ))}
              </div>
            )}

            {mod === "gonderildi" && (
              <span className="gr-ikon" aria-hidden="true"><Ikon ad="mesaj" boy={24} /></span>
            )}
            <h1 className="gr-baslik">{baslik}</h1>
            <p className="gr-aciklama">{aciklama}</p>

            {mod === "gonderildi" ? (
              <>
                <button type="button" className="btn btn-ghost gr-dugme gr-google" onClick={() => degistir("giris")}>{c("Girişe dön", "Back to sign in")}</button>
                {gonderilen === "sifre" && (
                  <>
                    {hata && <div role="alert" className="gr-hata gr-hata-alt">{hata}</div>}
                    <div className="gr-tekrar">
                      <span role="status">{tekrar ? c("Yeni bağlantı gönderildi.", "A new link has been sent.") : c("E-posta gelmedi mi?", "Didn't get the email?")}</span>
                      <button type="button" className="gr-baglanti" disabled={kapali || kalan > 0} onClick={tekrarGonder}>
                        {bekle ? c("Gönderiliyor...", "Sending...") : kalan > 0 ? c(`Tekrar gönder (${kalan} sn)`, `Resend (${kalan} s)`) : c("Tekrar gönder", "Resend")}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {(mod === "giris" || mod === "kayit") && (
                  <>
                    <button type="button" className="btn btn-ghost gr-dugme gr-google" disabled={kapali} onClick={google}><img src="https://developers.google.com/static/identity/images/g-logo.png" alt="" width={18} height={18} style={{ flex: "none", marginRight: 2 }} />{c("Google ile devam et", "Continue with Google")}</button>
                    <div className="gr-ayrac">
                      <span />{c("ya da e-posta ile", "or with email")}<span />
                    </div>
                  </>
                )}
                <form onSubmit={gonder} className={mod === "giris" || mod === "kayit" ? "gr-form" : "gr-form gr-form-tek"}>
                  {mod !== "yenile" && (
                    <div>
                      <label className="gr-lbl" htmlFor="g-eposta">{c("E-posta", "Email")}</label>
                      <input id="g-eposta" className="field gr-girdi" type="email" autoComplete="email" required value={eposta} onChange={(e) => setEposta(e.target.value)} placeholder={c("ornek@firma.com", "you@company.com")} />
                    </div>
                  )}
                  {mod !== "unuttum" && (
                    <div>
                      <div className="gr-lbl-satir">
                        <label className="gr-lbl" htmlFor="g-sifre">{mod === "yenile" ? c("Yeni şifre", "New password") : c("Şifre", "Password")}</label>
                        {mod === "giris" && <button type="button" onClick={() => degistir("unuttum")} className="gr-baglanti">{c("Şifremi unuttum", "Forgot password?")}</button>}
                      </div>
                      <div className="gr-sifre-kutu">
                        <input id="g-sifre" className="field gr-girdi" type={goster ? "text" : "password"} autoComplete={mod === "giris" ? "current-password" : "new-password"} required minLength={mod === "giris" ? undefined : 8} value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder={mod === "giris" ? c("Şifren", "Your password") : c("En az 8 karakter", "At least 8 characters")} />
                        <button type="button" onClick={() => setGoster(!goster)} aria-label={goster ? c("Şifreyi gizle", "Hide password") : c("Şifreyi göster", "Show password")} className="gr-goster">{goster ? c("Gizle", "Hide") : c("Göster", "Show")}</button>
                      </div>
                    </div>
                  )}
                  {(mod === "giris" || mod === "kayit") && (
                    <label className="gr-hatirla">
                      <input type="checkbox" checked={hatirla} onChange={(e) => setHatirla(e.target.checked)} />
                      {c("Beni hatırla", "Remember me")}
                    </label>
                  )}
                  {hata && <div role="alert" className="gr-hata">{hata}</div>}
                  <button type="submit" className="btn gr-dugme" disabled={kapali}>{bekle ? c("Bekle...", "Please wait...") : dugme}</button>
                </form>
                {mod === "kayit" && <p className="gr-kayit-not">{dil === "en" ? (
                  <>Creating an account starts your free {DENEME_GUN}-day trial. Your service records are stored in your account, so you see them on any phone. By creating an account you accept the <a href="/kosullar" target="_blank" rel="noopener" className="gr-yasal">Terms of use</a>. Your personal data is processed as described in the <a href="/gizlilik" target="_blank" rel="noopener" className="gr-yasal">Privacy policy</a>.</>
                ) : (
                  <>Hesap oluşturunca {DENEME_GUN} günlük ücretsiz deneme başlar. Servis kayıtların hesabında saklanır; her telefondan görürsün. Hesap oluşturarak <a href="/kosullar" target="_blank" rel="noopener" className="gr-yasal">Kullanım koşulları</a>nı kabul edersin. Kişisel verilerin <a href="/gizlilik" target="_blank" rel="noopener" className="gr-yasal">Gizlilik politikası</a>nda anlatıldığı şekilde işlenir.</>
                )}</p>}
                {(mod === "unuttum" || mod === "yenile") && (
                  <button type="button" onClick={() => degistir("giris")} className="gr-baglanti gr-geri">{c("Girişe dön", "Back to sign in")}</button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
