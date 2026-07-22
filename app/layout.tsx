import type { Metadata } from "next";
import { Inter, Bebas_Neue, Pacifico } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Condado +vacas — A la fiesta en bus",
    template: "%s | Condado +vacas",
  },
  description:
    "El Uber de los eventos en bus: tu RRPP organiza el viaje, tú solo disfruta. Fiestas, romerías y festivales de Galicia sin coche y sin líos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${bebasNeue.variable} ${pacifico.variable} bg-background font-sans text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
