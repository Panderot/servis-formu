"use client";
import Link from "next/link";
import Ikon, { Isaret } from "./Ikon";
import { DilDugmesi } from "./Dil";
import { useDil, type Dil } from "../lib/dil";
import { ABONELIK_EPOSTA } from "./supabase";

// Shared layout for the legal pages (/gizlilik, /kosullar, /veri-isleme). Content is plain data: a string is a
// paragraph, a string[] is a bullet list. The contact e-mail inside any text becomes a mailto link.
// Each page passes a Turkish and an English text; the English one is a translation.
export type Bolum = [baslik: string, icerik: (string | string[])[]];
export type YasalMetin = { baslik: string; tarih: string; giris: string; bolumler: Bolum[] };

function Metin({ s }: { s: string }) {
  const parcalar = s.split(ABONELIK_EPOSTA);
  return (
    <>
      {parcalar.map((p, i) => (
        <span key={i}>
          {p}
          {i < parcalar.length - 1 && <a href={`mailto:${ABONELIK_EPOSTA}`}>{ABONELIK_EPOSTA}</a>}
        </span>
      ))}
    </>
  );
}

export default function YasalSayfa({ metin }: { metin: Record<Dil, YasalMetin> }) {
  const dil = useDil();
  const { baslik, tarih, giris, bolumler } = metin[dil];
  const en = dil === "en";
  return (
    <main className="ys-sayfa">
      <div className="ys-ust">
        <Link href="/" className="ys-logo"><Isaret boy={24} />Fixnote</Link>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DilDugmesi />
          <Link href="/" className="ys-ana"><Ikon ad="sol" boy={15} />{en ? "Home" : "Ana sayfa"}</Link>
        </span>
      </div>
      <article className="ys-metin">
        <h1>{baslik}</h1>
        <p className="ys-tarih">{en ? "Last updated:" : "Son güncelleme:"} {tarih}</p>
        <p className="ys-giris"><Metin s={giris} /></p>
        {en && <p className="ys-giris">This English text is a translation. If it differs from the Turkish version, the Turkish version applies.</p>}
        {bolumler.map(([b, icerik], i) => (
          <section key={`${dil}-${i}`}>
            <h2>{i + 1}. {b}</h2>
            {icerik.map((x, j) =>
              typeof x === "string" ? (
                <p key={j}><Metin s={x} /></p>
              ) : (
                <ul key={j}>{x.map((m) => <li key={m}><Metin s={m} /></li>)}</ul>
              )
            )}
          </section>
        ))}
      </article>
      <nav className="ys-alt" aria-label={en ? "Legal pages" : "Yasal sayfalar"}>
        <a href="/gizlilik">{en ? "Privacy policy" : "Gizlilik politikası"}</a>
        <a href="/kosullar">{en ? "Terms of use" : "Kullanım koşulları"}</a>
        <a href="/veri-isleme">{en ? "Data processing agreement" : "Veri işleme sözleşmesi"}</a>
        <Link href="/">{en ? "Home" : "Ana sayfa"}</Link>
      </nav>
    </main>
  );
}
