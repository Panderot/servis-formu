import type { Metadata } from "next";
import Uygulama from "../components/Uygulama";

export const metadata: Metadata = {
  title: "Demo · Fixnote",
  description: "Fixnote'u örnek kayıtlarla dene: servis formu, ekranda imza, A4 rapor, PDF ve WhatsApp. Giriş gerekmez.",
};

// Open to everyone, no account: sample records that live only in this browser.
export default function Demo() {
  return <Uygulama mod="demo" />;
}
