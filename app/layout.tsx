import type { Metadata } from "next";
import { Noto_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VotoAbierto — Vota informado. Peru 2026",
  description:
    "Plataforma de información electoral no-partidaria para las elecciones generales del Perú, 12 de abril de 2026. Conoce a los candidatos, compara propuestas y verifica los hechos.",
  keywords: ["elecciones peru 2026", "candidatos", "voto informado", "fact check"],
  icons: {
    icon: '/icon',
    shortcut: '/icon',
  },
  openGraph: {
    title: "VotoAbierto — Vota informado.",
    description: "Información electoral verificada para el Perú 2026.",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${notoSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased bg-white text-[#444444] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
