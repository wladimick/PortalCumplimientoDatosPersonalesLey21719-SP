import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titillium = Titillium_Web({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-tibox", display: "swap" });

export const metadata: Metadata = { title: "TIBOX Compliance", description: "Plataforma de cumplimiento y evidencias para clientes TIBOX." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><body className={titillium.variable}>{children}</body></html>;
}
