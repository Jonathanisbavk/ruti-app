"use client";

import { Screen } from "@/components/Screen";
import { AlertBanner } from "@/components/AlertBanner";
import { DocCard } from "@/components/DocCard";
import { useRuti } from "@/lib/store";
import { estadoDocumento } from "@/lib/gamification";

export default function DocumentosPage() {
  const documentos = useRuti((s) => s.documentos);
  const alDia = documentos.filter((d) => estadoDocumento(d) === "vigente").length;
  const subidos = documentos.filter((d) => d.archivoNombre).length;

  return (
    <Screen titulo="Mis documentos" subtitulo="Paso 4 · alertas inteligentes">
      <div className="space-y-5 relative">
        <div className="absolute -top-[10%] -right-[10%] w-[250px] h-[250px] bg-primary/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

        <div className="fade-up" style={{ animationDelay: "60ms" }}>
          <AlertBanner documentos={documentos} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat valor={`${alDia}/${documentos.length}`} label="Vigentes" delay={120} acento />
          <Stat valor={`${subidos}/${documentos.length}`} label="Subidos" delay={180} />
        </div>

        <div className="space-y-4 mt-2">
          {documentos.map((d, idx) => (
            <div
              key={d.id}
              className="fade-up"
              style={{ animationDelay: `${240 + idx * 80}ms` }}
            >
              <div className="glass-panel rounded-3xl p-1 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.01] shadow-lg">
                <DocCard doc={d} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function Stat({
  valor,
  label,
  delay,
  acento,
}: {
  valor: string;
  label: string;
  delay: number;
  acento?: boolean;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`fade-up glass-panel rounded-3xl p-4 flex flex-col items-center justify-center border ${acento ? "border-primary/30 bg-primary/5" : "border-white/5"}`}
    >
      <p className={`text-2xl font-extrabold tracking-tight ${acento ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "text-foreground"}`}>
        {valor}
      </p>
      <p className="text-[11px] font-medium text-muted/80 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}
