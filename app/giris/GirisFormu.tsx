"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DENEME_GUN, guvenliSonra, hataMetni, hesapAyarli, supabase } from "../components/supabase";

type Mod = "giris" | "kayit" | "unuttum" | "yenile" | "gonderildi";

const DEGERLER = ["Formu telefonda doldur, müşteriye ekranda imzalat", "Firma başlıklı A4 rapor anında hazır", "PDF'i WhatsApp'tan müşteriye gönder"];

// Supabase sends one reset e-mail per address per minute; its error message carries the wait in seconds.
const BEKLEME = 60;
const beklemeSaniye = (m: string) => {
  const x = /after (\d+) seconds?/i.exec(m);
  return x ? Number(x[1]) : 0;
};

export default function GirisFormu() {
  const [mod, setMod] = useState<Mod>("giris");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const [gonderilen, setGonderilen] = useState<"kayit" | "sifre">("kayit");
  const [sonra, setSonra] = useState("/app");
  const [kalan, setKalan] = useState(0); // seconds until a new reset link can be requested
  const [tekrar, setTekrar] = useState(false); // a new link was sent from the "check your e-mail" screen

  // Read ?sonra= and ?yenile=1 on the client; an existing session goes straight to the app.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const hedef = guvenliSonra(q.get("sonra"));
    setSonra(hedef);
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
          setHata("Bu sıfırlama bağlantısı geçersiz ya da süresi dolmuş. E-posta adresini yaz, yeni bağlantı gönderelim.");
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
      setHata("Şifre en az 8 karakter olmalı.");
      return;
    }
    setBekle(true);
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
          setHata("Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.");
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
          setHata("Sıfırlama bağlantısının süresi dolmuş. Yeni bir bağlantı iste.");
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
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + sonra } });
    if (error) {
      setHata(hataMetni(error.message));
      setBekle(false);
    }
  }

  const kapali = !hesapAyarli || bekle;
  const baslik = { giris: "Tekrar hoş geldin", kayit: `${DENEME_GUN} gün ücretsiz dene`, unuttum: "Şifreni sıfırla", yenile: "Yeni şifre belirle", gonderildi: "E-postanı kontrol et" }[mod];
  const aciklama = {
    giris: "Fixnote hesabına giriş yap.",
    kayit: "Hesabını oluştur, deneme hemen başlasın. Kart istenmez.",
    unuttum: "Hesabının e-posta adresini yaz; sıfırlama bağlantısı gönderelim.",
    yenile: "Hesabın için yeni bir şifre yaz.",
    gonderildi: gonderilen === "kayit"
      ? `${eposta.trim()} adresine doğrulama bağlantısı gönderdik. Bağlantıya tıklayınca hesabın açılır ve ${DENEME_GUN} günlük deneme başlar.`
      : `${eposta.trim()} adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı birkaç dakika içinde gelir. Gelen kutunda göremezsen spam klasörüne de bak.`,
  }[mod];
  const dugme = { giris: "Giriş yap", kayit: "Hesap oluştur", unuttum: "Bağlantı gönder", yenile: "Şifreyi kaydet", gonderildi: "" }[mod];

  return (
    <main className="gr-sayfa">
      <aside className="gr-marka">
        <Link href="/" className="gr-logo gr-logo-buyuk" style={{ alignSelf: "flex-start" }}><Isaret boy={28} />Fixnote</Link>
        <div className="gr-marka-orta">
          <h2 className="gr-manset">Rapor kapıda biter,<br /><span style={{ color: "#7cc4d6" }}>akşamın sana kalır.</span></h2>
          <ul className="gr-degerler">
            {DEGERLER.map((d) => (
              <li key={d}>
                <span className="gr-tik" aria-hidden="true"><Ikon ad="tik" boy={14} kalinlik={3} /></span>{d}
              </li>
            ))}
          </ul>
        </div>
        <div className="gr-meta">{DENEME_GUN} gün ücretsiz · Kart istemez · Kayıtların hesabında, her telefondan</div>
      </aside>

      <section className="gr-form-alan">
        <div className="gr-ust">
          <Link href="/" className="gr-logo"><Isaret boy={26} />Fixnote</Link>
          <Link href="/" className="gr-ana"><Ikon ad="sol" boy={15} />Ana sayfa</Link>
        </div>

        <div className="gr-merkez">
          <div className="gr-kart">
            {!hesapAyarli && (
              <div role="status" className="gr-not">Giriş henüz yapılandırılmadı. Supabase adresi ve anahtarı eklenince bu sayfa çalışır.</div>
            )}

            {(mod === "giris" || mod === "kayit") && (
              <div role="tablist" aria-label="Giriş türü" className="gr-sekmeler">
                <span className="gr-gosterge" data-sag={mod === "kayit"} aria-hidden="true" />
                {([["giris", "Giriş yap"], ["kayit", "Hesap oluştur"]] as const).map(([m, t]) => (
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
                <button type="button" className="btn btn-ghost gr-dugme gr-google" onClick={() => degistir("giris")}>Girişe dön</button>
                {gonderilen === "sifre" && (
                  <>
                    {hata && <div role="alert" className="gr-hata gr-hata-alt">{hata}</div>}
                    <div className="gr-tekrar">
                      <span role="status">{tekrar ? "Yeni bağlantı gönderildi." : "E-posta gelmedi mi?"}</span>
                      <button type="button" className="gr-baglanti" disabled={kapali || kalan > 0} onClick={tekrarGonder}>
                        {bekle ? "Gönderiliyor..." : kalan > 0 ? `Tekrar gönder (${kalan} sn)` : "Tekrar gönder"}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {(mod === "giris" || mod === "kayit") && (
                  <>
                    <button type="button" className="btn btn-ghost gr-dugme gr-google" disabled={kapali} onClick={google}>Google ile devam et</button>
                    <div className="gr-ayrac">
                      <span />ya da e-posta ile<span />
                    </div>
                  </>
                )}
                <form onSubmit={gonder} className={mod === "giris" || mod === "kayit" ? "gr-form" : "gr-form gr-form-tek"}>
                  {mod !== "yenile" && (
                    <div>
                      <label className="gr-lbl" htmlFor="g-eposta">E-posta</label>
                      <input id="g-eposta" className="field gr-girdi" type="email" autoComplete="email" required value={eposta} onChange={(e) => setEposta(e.target.value)} placeholder="ornek@firma.com" />
                    </div>
                  )}
                  {mod !== "unuttum" && (
                    <div>
                      <div className="gr-lbl-satir">
                        <label className="gr-lbl" htmlFor="g-sifre">{mod === "yenile" ? "Yeni şifre" : "Şifre"}</label>
                        {mod === "giris" && <button type="button" onClick={() => degistir("unuttum")} className="gr-baglanti">Şifremi unuttum</button>}
                      </div>
                      <div className="gr-sifre-kutu">
                        <input id="g-sifre" className="field gr-girdi" type={goster ? "text" : "password"} autoComplete={mod === "giris" ? "current-password" : "new-password"} required minLength={mod === "giris" ? undefined : 8} value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder={mod === "giris" ? "Şifren" : "En az 8 karakter"} />
                        <button type="button" onClick={() => setGoster(!goster)} aria-label={goster ? "Şifreyi gizle" : "Şifreyi göster"} className="gr-goster">{goster ? "Gizle" : "Göster"}</button>
                      </div>
                    </div>
                  )}
                  {hata && <div role="alert" className="gr-hata">{hata}</div>}
                  <button type="submit" className="btn gr-dugme" disabled={kapali}>{bekle ? "Bekle..." : dugme}</button>
                </form>
                {mod === "kayit" && <p className="gr-kayit-not">Hesap oluşturunca {DENEME_GUN} günlük ücretsiz deneme başlar. Servis kayıtların hesabında saklanır; her telefondan görürsün. Hesap oluşturarak <a href="/kosullar" target="_blank" rel="noopener" className="gr-yasal">Kullanım koşulları</a>nı ve <a href="/gizlilik" target="_blank" rel="noopener" className="gr-yasal">Gizlilik politikası</a>nı kabul edersin.</p>}
                {(mod === "unuttum" || mod === "yenile") && (
                  <button type="button" onClick={() => degistir("giris")} className="gr-baglanti gr-geri">Girişe dön</button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
