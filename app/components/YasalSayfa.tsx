import Link from "next/link";
import Ikon, { Isaret } from "./Ikon";
import { ABONELIK_EPOSTA } from "./supabase";

// Shared layout for the legal pages (/gizlilik, /kosullar). Content is plain data: a string is a
// paragraph, a string[] is a bullet list. The contact e-mail inside any text becomes a mailto link.
export type Bolum = [baslik: string, icerik: (string | string[])[]];

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

export default function YasalSayfa({ baslik, tarih, giris, bolumler }: { baslik: string; tarih: string; giris: string; bolumler: Bolum[] }) {
  return (
    <main className="ys-sayfa">
      <div className="ys-ust">
        <Link href="/" className="ys-logo"><Isaret boy={24} />Fixnote</Link>
        <Link href="/" className="ys-ana"><Ikon ad="sol" boy={15} />Ana sayfa</Link>
      </div>
      <article className="ys-metin">
        <h1>{baslik}</h1>
        <p className="ys-tarih">Son güncelleme: {tarih}</p>
        <p className="ys-giris"><Metin s={giris} /></p>
        {bolumler.map(([b, icerik], i) => (
          <section key={b}>
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
      <nav className="ys-alt" aria-label="Yasal sayfalar">
        <a href="/gizlilik">Gizlilik politikası</a>
        <a href="/kosullar">Kullanım koşulları</a>
        <Link href="/">Ana sayfa</Link>
      </nav>
    </main>
  );
}
