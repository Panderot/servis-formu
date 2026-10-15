import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Referansın (valideo.app) ölçülen tek yüzü: Manrope 400-800. Başlık, gövde ve rakamlar aynı aileden.
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Fixnote: sahada 1 dakikada servis raporu",
  description:
    "Teknisyen sahada servis raporunu telefondan doldurur, müşteriye parmakla imzalatır, PDF olarak kaydeder ve WhatsApp ile gönderir. Kağıt form, karbon kopya, kayıp fiş yok.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f3f5f7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
