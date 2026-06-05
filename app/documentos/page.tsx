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
      <div className="space-y-4">
        <AlertBanner documentos={documentos} />

        <div className="grid grid-cols-2 gap-3">
          <Stat valor={`${alDia}/${documentos.length}`} label="Vigentes" />
          <Stat valor={`${subidos}/${documentos.length}`} label="Subidos" />
        </div>

        <div className="space-y-3">
          {documentos.map((d) => (
            <DocCard key={d.id} doc={d} />
          ))}
        </div>
      </div>
    </Screen>
  );
}

function Stat({ valor, label }: { valor: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-3 text-center">
      <p className="text-xl font-bold">{valor}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
