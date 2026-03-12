import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://votoabierto.pe'),
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
  twitter: {
    card: 'summary_large_image',
    title: "VotoAbierto — Vota informado.",
    description: "Información electoral verificada para el Perú 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${notoSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A56A0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VotoAbierto" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-white text-[#444444] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <PWAInstallPrompt />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js') }`}
        </Script>
      </body>
    </html>
  );
}
