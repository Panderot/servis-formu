import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Manrope } from "next/font/google";
import "./globals.css";

// Yeni tasarım yüzleri: gövde/UI Inter, başlık Fraunces (saha defteri / resmi belge karakteri).
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], weight: ["500", "600"], style: ["normal"], variable: "--font-display-f", display: "swap" });
// A4 servis raporu kendi sabit yüzünde kalır (çıktı değişmez): Manrope.
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700", "800"], variable: "--font-report-f", display: "swap" });

export const metadata: Metadata = {
  title: "Fixnote: sahada 1 dakikada servis raporu",
  description:
    "Teknisyen sahada servis raporunu telefondan doldurur, müşteriye parmakla imzalatır, PDF olarak kaydeder ve WhatsApp ile gönderir. Kağıt form, karbon kopya, kayıp fiş yok.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#efeee8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
