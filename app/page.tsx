import Image from "next/image";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { Mic, ShieldCheck, MapPinned } from "lucide-react";

const pilares = [
  {
    Icon: Mic,
    titulo: "Formalización por voz",
    texto: "Un agente de IA te registra hablando, sin formularios.",
    color: "text-primary",
    bg: "bg-primary-soft",
  },
  {
    Icon: ShieldCheck,
    titulo: "Seguridad y respaldo",
    texto: "Documentos al día y reputación que te defiende ante la ATU.",
    color: "text-success",
    bg: "bg-success/20",
  },
  {
    Icon: MapPinned,
    titulo: "Conexión con pasajeros",
    texto: "Rutas inteligentes y pasajeros cercanos en tiempo real.",
    color: "text-accent",
    bg: "bg-accent/20",
  },
];

export default function Home() {
  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto px-6 pb-8 pt-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />

      <div className="flex flex-1 flex-col">
        <div className="-mx-6 -mt-12 fade-up relative h-[280px]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
          <Image
            src="/ruti-logo.jpeg"
            alt="RUTI — Rapidez, seguridad y confianza"
            fill
            className="object-cover opacity-80 mix-blend-screen"
            priority
          />
        </div>

        <div className="-mt-12 relative z-20 fade-up">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Formaliza tu ruta.
            <br />
            <span className="bg-gradient-to-r from-accent via-primary to-primary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              Conduce con respaldo.
            </span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted font-light">
            RUTI te acompaña en tu formalización con
            inteligencia artificial, premiando tu buen comportamiento vial.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {pilares.map(({ Icon, titulo, texto, color, bg }, idx) => (
            <div
              key={titulo}
              className="glass-panel group flex items-start gap-4 rounded-3xl p-5 fade-up hover:scale-[1.02] transition-transform duration-300"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className={`rounded-2xl ${bg} p-3 ${color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-foreground tracking-wide">{titulo}</p>
                <p className="text-[13px] text-muted/90 mt-1 leading-snug">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-4 fade-up" style={{ animationDelay: "500ms" }}>
        <GoogleLoginButton />
        <p className="text-center text-xs text-muted/70 font-light">
          Al continuar aceptas los términos de RUTI.
          <br />
          Demo para evaluación de jurados.
        </p>
      </div>
    </div>
  );
}
