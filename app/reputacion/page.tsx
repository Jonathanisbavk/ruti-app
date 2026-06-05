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
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

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
      <div className="space-y-6 relative pb-6">
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-accent/20 blur-[100px] -z-10 rounded-full pointer-events-none" />

        {/* Score */}
        <div className="fade-up flex flex-col items-center rounded-[2.5rem] border border-white/10 glass-panel p-6 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 scale-110 mb-4 mt-2">
            <ScoreRing score={score} />
          </div>
          <div className="mt-4 w-full relative z-10">
            <div className="mb-2 flex justify-between text-[12px] font-bold text-muted/80 uppercase tracking-wide">
              <span className="text-primary">{nivel.nombre}</span>
              <span>{siguiente ? siguiente.nombre : "Máximo"}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-2 border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progreso * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="mt-4 rounded-2xl bg-primary/10 border border-primary/20 p-3.5 text-center text-[13px] shadow-inner">
              <span className="font-extrabold text-accent">Beneficio:</span>{" "}
              <span className="font-medium text-foreground">{nivel.beneficio}</span>
            </div>
          </div>
        </div>

        {/* Simular comportamiento vial */}
        <div className="fade-up" style={{ animationDelay: "120ms" }}>
          <h2 className="mb-3 text-[14px] font-extrabold tracking-tight">Simulador de Eventos</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {eventos.map(([key, ev]) => (
              <button
                key={key}
                onClick={() => aplicarEvento(key)}
                className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
                  ev.delta > 0
                    ? "bg-success/10 border-success/30 text-success hover:bg-success/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-danger/10 border-danger/30 text-danger hover:bg-danger/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                }`}
              >
                <span className="flex items-center gap-2 text-left font-semibold">
                  <span className="text-lg">{ev.emoji}</span> {ev.label}
                </span>
                <span className="font-extrabold text-[15px]">
                  {ev.delta > 0 ? `+${ev.delta}` : ev.delta}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Insignias */}
        <div className="fade-up" style={{ animationDelay: "180ms" }}>
          <h2 className="mb-3 text-[14px] font-extrabold tracking-tight">Insignias</h2>
          <div className="glass-panel p-4 rounded-3xl border border-white/5">
             <BadgeGrid badges={badges} />
          </div>
        </div>

        {/* Historial */}
        {historial.length > 0 && (
          <div className="fade-up" style={{ animationDelay: "240ms" }}>
            <h2 className="mb-3 text-[14px] font-extrabold tracking-tight">Actividad reciente</h2>
            <div className="space-y-2">
              {historial.map((h) => (
                <div
                  key={h.id}
                  className="fade-up flex items-center justify-between rounded-2xl glass border border-white/5 px-4 py-3 text-[13px]"
                >
                  <span className="flex items-center gap-2.5 font-medium text-muted">
                    <span className="text-base">{h.emoji}</span> {h.label}
                  </span>
                  <span
                    className={`font-extrabold ${
                      h.delta > 0 ? "text-success drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-danger"
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
          style={{ animationDelay: "300ms" }}
          className="fade-up flex items-center justify-center gap-2 w-full rounded-2xl border border-white/10 bg-surface-2/50 py-3.5 text-[13px] font-semibold text-muted hover:text-foreground hover:bg-surface-2 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Reiniciar demo
        </button>
      </div>
    </Screen>
  );
}
