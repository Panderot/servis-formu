import HesapKapisi from "../components/HesapKapisi";

// Every page under /app needs an account and an active trial or subscription.
export default function UygulamaDuzeni({ children }: { children: React.ReactNode }) {
  return <HesapKapisi>{children}</HesapKapisi>;
}
