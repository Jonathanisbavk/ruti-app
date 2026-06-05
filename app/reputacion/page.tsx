"use client";

import { Screen } from "@/components/Screen";
import { ScoreRing } from "@/components/ScoreRing";
import { BadgeGrid } from "@/components/BadgeGrid";
import { useRuti } from "@/lib/store";
import { badgesSeed } from "@/lib/seed";
import {
  EVENTOS,
  EventoKey,
  nivelDeScore,
  progresoSiguienteNivel,
  estadoDocumento,
} from "@/lib/gamification";

export default function ReputacionPage() {
  const score = useRuti((s) => s.score);
  const historial = useRuti((s) => s.historial);
  const documentos = useRuti((s) => s.documentos);
  const aplicarEvento = useRuti((s) => s.aplicarEvento);
  const resetDemo = useRuti((s) => s.resetDemo);

  const nivel = nivelDeScore(score);
  const { siguiente, progreso } = progresoSiguienteNivel(score);
  const docsAlDia = documentos.every((d) => estadoDocumento(d) === "vigente");

  const badges = badgesSeed.map((b) => ({
    ...b,
    desbloqueado:
      b.id === "documentos"
        ? docsAlDia
        : b.id === "velocidad"
          ? score >= 75
          : b.id === "semaforos"
            ? score >= 50
            : b.desbloqueado,
  }));

  const eventos = Object.entries(EVENTOS) as [
    EventoKey,
    (typeof EVENTOS)[EventoKey],
  ][];

  return (
    <Screen titulo="Reputación vial" subtitulo="Gamificación · beneficios">
      <div className="space-y-5">
        {/* Score */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface/60 p-5">
          <ScoreRing score={score} />
          <div className="mt-3 w-full">
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>{nivel.nombre}</span>
              <span>{siguiente ? siguiente.nombre : "Máximo nivel"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${progreso * 100}%` }}
              />
            </div>
            <div className="mt-3 rounded-xl bg-primary/10 p-3 text-center text-xs">
              <span className="font-semibold text-accent">Beneficio actual:</span>{" "}
              {nivel.beneficio}
            </div>
          </div>
        </div>

        {/* Simular comportamiento vial */}
        <div>
          <h2 className="mb-2 text-sm font-semibold">Simular comportamiento vial</h2>
          <div className="grid grid-cols-2 gap-2">
            {eventos.map(([key, ev]) => (
              <button
                key={key}
                onClick={() => aplicarEvento(key)}
                className={`flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-xs ${
                  ev.delta > 0
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                <span className="flex items-center gap-1.5 text-left">
                  <span>{ev.emoji}</span> {ev.label}
                </span>
                <span className="font-bold">
                  {ev.delta > 0 ? `+${ev.delta}` : ev.delta}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Insignias */}
        <div>
          <h2 className="mb-2 text-sm font-semibold">Insignias</h2>
          <BadgeGrid badges={badges} />
        </div>

        {/* Historial */}
        {historial.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold">Actividad reciente</h2>
            <div className="space-y-1.5">
              {historial.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl bg-surface/50 px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span>{h.emoji}</span> {h.label}
                  </span>
                  <span
                    className={`font-bold ${
                      h.delta > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {h.delta > 0 ? `+${h.delta}` : h.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={resetDemo}
          className="w-full rounded-xl border border-border py-2.5 text-xs text-muted hover:text-foreground"
        >
          Reiniciar demo
        </button>
      </div>
    </Screen>
  );
}
