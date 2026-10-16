"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ikon, { Isaret } from "../components/Ikon";
import { DENEME_GUN, guvenliSonra, hataMetni, hesapAyarli, supabase } from "../components/supabase";

type Mod = "giris" | "kayit" | "unuttum" | "yenile" | "gonderildi";

const DEGERLER = ["Formu telefonda doldur, müşteriye ekranda imzalat", "Firma başlıklı A4 rapor anında hazır", "PDF'i WhatsApp'tan müşteriye gönder"];

export default function GirisFormu() {
  const [mod, setMod] = useState<Mod>("giris");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const [gonderilen, setGonderilen] = useState<"kayit" | "sifre">("kayit");
  const [sonra, setSonra] = useState("/app");

  // Read ?sonra= and ?yenile=1 on the client; an existing session goes straight to the app.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const hedef = guvenliSonra(q.get("sonra"));
    setSonra(hedef);
    const yenile = q.get("yenile") === "1";
    if (yenile) setMod("yenile");
    else if (q.get("kayit") === "1") setMod("kayit"); // trial buttons open the sign-up tab
    const sb = supabase();
    if (!sb || yenile) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(hedef);
    });
  }, []);

  const degistir = (m: Mod) => {
    setMod(m);
    setHata("");
    setSifre("");
  };

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
        const { error } = await sb.auth.resetPasswordForEmail(eposta.trim(), { redirectTo: `${window.location.origin}/giris?yenile=1` });
        if (error) throw error;
        setGonderilen("sifre");
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
      : `${eposta.trim()} adresine şifre sıfırlama bağlantısı gönderdik.`,
  }[mod];
  const dugme = { giris: "Giriş yap", kayit: "Hesap oluştur", unuttum: "Bağlantı gönder", yenile: "Şifreyi kaydet", gonderildi: "" }[mod];

  return (
    <main className="grid lg:grid-cols-[1fr_1.1fr]" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <aside className="hidden lg:flex" style={{ background: "var(--dark)", color: "#fff", flexDirection: "column", justifyContent: "space-between", padding: "40px 52px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 19, letterSpacing: "-0.03em" }}><Isaret boy={26} />Fixnote</Link>
        <div>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, margin: 0 }}>Rapor kapıda biter,<br /><span style={{ color: "#7cc4d6" }}>akşamın sana kalır.</span></h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 14 }}>
            {DEGERLER.map((d) => (
              <li key={d} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, fontWeight: 700 }}>
                <span style={{ flex: "none", width: 24, height: 24, borderRadius: 12, background: "rgba(124,196,214,.16)", color: "#7cc4d6", display: "grid", placeItems: "center" }}><Ikon ad="tik" boy={13} kalinlik={3} /></span>{d}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>{DENEME_GUN} gün ücretsiz · Kart istemez · Servis kayıtların cihazında kalır</div>
      </aside>

      <section style={{ display: "flex", flexDirection: "column", padding: "20px 16px 28px" }}>
        <div className="mx-auto flex w-full max-w-[400px] items-center justify-between lg:max-w-none">
          <Link href="/" className="lg:invisible" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>
          <Link href="/" className="hover:text-[var(--ink)]" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "var(--muted)" }}><Ikon ad="sol" boy={15} />Ana sayfa</Link>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 28, paddingBottom: 12 }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            {!hesapAyarli && (
              <div role="status" style={{ background: "var(--warn-soft)", color: "var(--warn)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700, marginBottom: 18 }}>Giriş henüz yapılandırılmadı. Supabase adresi ve anahtarı eklenince bu sayfa çalışır.</div>
            )}

            {(mod === "giris" || mod === "kayit") && (
              <div role="tablist" aria-label="Giriş türü" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, background: "var(--tile)", borderRadius: 12, marginBottom: 22 }}>
                {([["giris", "Giriş yap"], ["kayit", "Hesap oluştur"]] as const).map(([m, t]) => (
                  <button key={m} type="button" role="tab" aria-selected={mod === m} onClick={() => degistir(m)} style={{ border: "none", cursor: "pointer", borderRadius: 9, padding: "9px 10px", fontWeight: 800, fontSize: 13.5, background: mod === m ? "#fff" : "transparent", color: mod === m ? "var(--ink)" : "var(--muted)", boxShadow: mod === m ? "var(--shadow-sm)" : "none" }}>{t}</button>
                ))}
              </div>
            )}

            {mod === "gonderildi" && (
              <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", marginBottom: 16 }}><Ikon ad="mesaj" boy={22} /></span>
            )}
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, margin: 0 }}>{baslik}</h1>
            <p style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.55, margin: "8px 0 0" }}>{aciklama}</p>

            {mod === "gonderildi" ? (
              <button type="button" className="btn btn-ghost" style={{ width: "100%", marginTop: 22 }} onClick={() => degistir("giris")}>Girişe dön</button>
            ) : (
              <>
                {(mod === "giris" || mod === "kayit") && (
                  <>
                    <button type="button" className="btn btn-ghost" disabled={kapali} onClick={google} style={{ width: "100%", marginTop: 22, padding: "12px 16px" }}>Google ile devam et</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 2px", fontSize: 12, fontWeight: 700, color: "var(--faint)" }}>
                      <span style={{ flex: 1, height: 1, background: "var(--line)" }} />ya da e-posta ile<span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                    </div>
                  </>
                )}
                <form onSubmit={gonder} style={{ display: "grid", gap: 14, marginTop: mod === "giris" || mod === "kayit" ? 14 : 22 }}>
                  {mod !== "yenile" && (
                    <div>
                      <label className="lbl" htmlFor="g-eposta">E-posta</label>
                      <input id="g-eposta" className="field" type="email" autoComplete="email" required value={eposta} onChange={(e) => setEposta(e.target.value)} placeholder="ornek@firma.com" />
                    </div>
                  )}
                  {mod !== "unuttum" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <label className="lbl" htmlFor="g-sifre">{mod === "yenile" ? "Yeni şifre" : "Şifre"}</label>
                        {mod === "giris" && <button type="button" onClick={() => degistir("unuttum")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}>Şifremi unuttum</button>}
                      </div>
                      <div style={{ position: "relative" }}>
                        <input id="g-sifre" className="field" type={goster ? "text" : "password"} autoComplete={mod === "giris" ? "current-password" : "new-password"} required minLength={mod === "giris" ? undefined : 8} value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder={mod === "giris" ? "Şifren" : "En az 8 karakter"} style={{ paddingRight: 72 }} />
                        <button type="button" onClick={() => setGoster(!goster)} aria-label={goster ? "Şifreyi gizle" : "Şifreyi göster"} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--muted)", padding: "4px 6px" }}>{goster ? "Gizle" : "Göster"}</button>
                      </div>
                    </div>
                  )}
                  {hata && <div role="alert" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, fontWeight: 700 }}>{hata}</div>}
                  <button type="submit" className="btn" disabled={kapali} style={{ width: "100%", padding: "13px 16px", opacity: kapali ? 0.6 : 1 }}>{bekle ? "Bekle..." : dugme}</button>
                </form>
                {mod === "kayit" && <p style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, lineHeight: 1.5, margin: "14px 0 0" }}>Hesap oluşturunca {DENEME_GUN} günlük ücretsiz deneme başlar. Servis kayıtların yalnızca kendi cihazında saklanır.</p>}
                {(mod === "unuttum" || mod === "yenile") && (
                  <button type="button" onClick={() => degistir("giris")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--accent)", marginTop: 16 }}>Girişe dön</button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
