import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
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
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Background global animations if needed */}
        <AuthProvider>
          <PhoneFrame>{children}</PhoneFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
