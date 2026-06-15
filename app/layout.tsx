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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "GuiaSP",
    statusBarStyle: "black-translucent",
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('ServiceWorker registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('ServiceWorker failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
