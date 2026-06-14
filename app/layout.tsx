import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GuiaSP — Busca de Restaurantes Curada por Influencers",
  description: "Encontre os melhores restaurantes indicados pelos seus influencers de gastronomia favoritos. Pesquise por pratos, bairros, ou veja a curadoria completa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-[#0A0A0A] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
