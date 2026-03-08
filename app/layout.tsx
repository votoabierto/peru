import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VotoClaro — Vota informado. Peru 2026",
  description:
    "Plataforma de información electoral no-partidaria para las elecciones generales del Perú, 12 de abril de 2026. Conoce a los candidatos, compara propuestas y verifica los hechos.",
  keywords: ["elecciones peru 2026", "candidatos", "voto informado", "fact check"],
  openGraph: {
    title: "VotoClaro — Vota informado.",
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
    <html lang="es">
      <body className={`${inter.className} antialiased bg-votoclaro-base text-votoclaro-text min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
