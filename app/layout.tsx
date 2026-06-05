import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { PhoneFrame } from "@/components/PhoneFrame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RUTI — Formalización, seguridad y conexión",
  description:
    "RUTI acompaña a los conductores en su formalización con un agente de IA por voz, alertas de documentos, rutas con pasajeros cercanos y reputación vial gamificada.",
};

export const viewport: Viewport = {
  themeColor: "#000c46",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
