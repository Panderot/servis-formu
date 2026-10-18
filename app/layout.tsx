import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DilKoku } from "./components/Dil";
import { DIL_BETIGI } from "./lib/dilBetigi";

// Tek yazı tipi Manrope; başlık, gövde ve rakamlar aynı aileden. Dosyalar public/fonts, tanım app/globals.css başında.

export const metadata: Metadata = {
  title: "Fixnote: sahada 1 dakikada servis raporu",
  description:
    "Teknisyen sahada servis raporunu telefondan doldurur, müşteriye parmakla imzalatır, PDF olarak kaydeder ve WhatsApp ile gönderir. Kağıt form, karbon kopya, kayıp fiş yok.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f3f5f7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script sets the page language before the first paint (app/lib/dilBetigi.ts), so <html> may differ from the server.
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-latin-ext.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: DIL_BETIGI }} />
      </head>
      <body>
        <DilKoku />
        {children}
      </body>
    </html>
  );
}
