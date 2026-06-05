import Image from "next/image";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { MicIcon, ShieldIcon, MapIcon } from "@/components/icons";

const pilares = [
  {
    Icon: MicIcon,
    titulo: "Formalización por voz",
    texto: "Un agente de IA te registra hablando, sin formularios.",
  },
  {
    Icon: ShieldIcon,
    titulo: "Seguridad y respaldo",
    texto: "Documentos al día y reputación que te defiende ante la ATU.",
  },
  {
    Icon: MapIcon,
    titulo: "Conexión con pasajeros",
    texto: "Rutas inteligentes y pasajeros cercanos en tiempo real.",
  },
];

export default function Home() {
  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto px-6 pb-8 pt-12">
      <div className="flex flex-1 flex-col">
        <div className="-mx-6 -mt-12 fade-up">
          <Image
            src="/ruti-logo.jpeg"
            alt="RUTI — Rapidez, seguridad y confianza"
            width={1018}
            height={430}
            priority
            className="w-full"
          />
        </div>

        <div className="mt-6 fade-up">
          <h1 className="text-3xl font-extrabold leading-tight">
            Formaliza tu ruta.
            <br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Conduce con respaldo.
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted">
            RUTI acompaña a los conductores en su formalización con
            inteligencia artificial, premiando el buen comportamiento vial.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {pilares.map(({ Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface/60 p-4 fade-up"
            >
              <div className="rounded-xl bg-primary/15 p-2 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{titulo}</p>
                <p className="text-xs text-muted">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <GoogleLoginButton />
        <p className="text-center text-[11px] text-muted">
          Al continuar aceptas los términos de RUTI. Demo para evaluación —
          el inicio de sesión está simulado.
        </p>
      </div>
    </div>
  );
}
