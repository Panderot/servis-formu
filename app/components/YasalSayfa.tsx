"use client";
import Link from "next/link";
import Ikon, { Isaret } from "./Ikon";
import { DilDugmesi } from "./Dil";
import { useDil, type Dil } from "../lib/dil";
import { ABONELIK_EPOSTA } from "./supabase";
import YasalAlt from "./YasalAlt";

// Shared layout for the legal and company pages (/gizlilik, /kosullar, /veri-isleme, /hakkimizda, /teslimat-ve-iade,
// /mesafeli-satis, /on-bilgilendirme). Content is plain data: a string is a paragraph, a string[] is a bullet list,
// the optional third item is the section's anchor id. The contact e-mail and https:// addresses inside any text become links.
// Each page passes a Turkish and an English text; the English one is a translation.
export type Bolum = [baslik: string, icerik: (string | string[])[], id?: string];
export type YasalMetin = { baslik: string; tarih?: string; giris: string; bolumler: Bolum[] };

const BAGLANTI = new RegExp(`(${ABONELIK_EPOSTA.replace(/\./g, "\\.")}|https://[^\\s,;)]*[^\\s,;).])`);

function Metin({ s }: { s: string }) {
  const parcalar = s.split(BAGLANTI);
  return (
    <>
      {parcalar.map((p, i) =>
        i % 2 === 0 ? (
          <span key={i}>{p}</span>
        ) : (
          <a key={i} href={p === ABONELIK_EPOSTA ? `mailto:${p}` : p} {...(p === ABONELIK_EPOSTA ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{p}</a>
        )
      )}
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
          <Link href="/app" className="ys-ana"><Ikon ad="sol" boy={15} />{en ? "Back to the app" : "Uygulamaya dön"}</Link>
        </span>
      </div>
      <article className="ys-metin">
        <h1>{baslik}</h1>
        {tarih && <p className="ys-tarih">{en ? "Last updated:" : "Son güncelleme:"} {tarih}</p>}
        <p className="ys-giris"><Metin s={giris} /></p>
        {en && <p className="ys-giris">This English text is a translation. If it differs from the Turkish version, the Turkish version applies.</p>}
        {bolumler.map(([b, icerik, id], i) => (
          <section key={`${dil}-${i}`} id={id} style={id ? { scrollMarginTop: 16 } : undefined}>
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
      <YasalAlt />
    </main>
  );
}
