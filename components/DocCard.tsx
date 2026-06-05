"use client";

import { useRef } from "react";
import type { Documento, EstadoDocumento } from "@/lib/types";
import { useRuti } from "@/lib/store";
import {
  estadoDocumento,
  diasParaVencer,
  formatFecha,
} from "@/lib/gamification";
import { UploadIcon, CheckIcon, DocIcon } from "./icons";

const estilos: Record<
  EstadoDocumento,
  { label: string; cls: string }
> = {
  vigente: { label: "Vigente", cls: "bg-success/15 text-success" },
  por_vencer: { label: "Por vencer", cls: "bg-warning/15 text-warning" },
  vencido: { label: "Vencido", cls: "bg-danger/15 text-danger" },
};

export function DocCard({ doc }: { doc: Documento }) {
  const setDocArchivo = useRuti((s) => s.setDocArchivo);
  const inputRef = useRef<HTMLInputElement>(null);
  const estado = estadoDocumento(doc);
  const dias = diasParaVencer(doc.fechaVencimiento);
  const e = estilos[estado];

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/15 p-2 text-accent">
            <DocIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{doc.tipo}</p>
            <p className="text-xs text-muted">{doc.descripcion}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${e.cls}`}>
          {e.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          Vence: <span className="text-foreground">{formatFecha(doc.fechaVencimiento)}</span>
        </span>
        <span
          className={
            estado === "vencido"
              ? "text-danger"
              : estado === "por_vencer"
                ? "text-warning"
                : "text-muted"
          }
        >
          {dias < 0 ? `Hace ${Math.abs(dias)} días` : `En ${dias} días`}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(ev) => {
          const f = ev.target.files?.[0];
          if (f) setDocArchivo(doc.id, f.name);
        }}
      />

      {doc.archivoNombre ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-success/10 px-3 py-2 text-xs text-success">
          <span className="flex items-center gap-1.5 truncate">
            <CheckIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{doc.archivoNombre}</span>
          </span>
          <button
            onClick={() => inputRef.current?.click()}
            className="shrink-0 font-medium underline-offset-2 hover:underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-2/50 py-2.5 text-xs font-medium text-muted hover:text-foreground"
        >
          <UploadIcon className="h-4 w-4" /> Subir documento
        </button>
      )}
    </div>
  );
}
