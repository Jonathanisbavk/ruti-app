import type { Nivel, EstadoDocumento, Documento } from "./types";

export const NIVELES: Nivel[] = [
  {
    nombre: "Bronce",
    min: 0,
    color: "#cd7f32",
    emoji: "🥉",
    beneficio: "Acceso a rutas verificadas",
  },
  {
    nombre: "Plata",
    min: 50,
    color: "#c0c0c0",
    emoji: "🥈",
    beneficio: "-10% en comisión de plataforma",
  },
  {
    nombre: "Oro",
    min: 75,
    color: "#ffd700",
    emoji: "🥇",
    beneficio: "Prioridad de pasajeros + respaldo ante la ATU",
  },
];

export function nivelDeScore(score: number): Nivel {
  return (
    [...NIVELES].reverse().find((n) => score >= n.min) ?? NIVELES[0]
  );
}

/** Progreso (0-1) hacia el siguiente nivel. */
export function progresoSiguienteNivel(score: number): {
  siguiente: Nivel | null;
  progreso: number;
} {
  const actual = nivelDeScore(score);
  const idx = NIVELES.findIndex((n) => n.nombre === actual.nombre);
  const siguiente = NIVELES[idx + 1] ?? null;
  if (!siguiente) return { siguiente: null, progreso: 1 };
  const span = siguiente.min - actual.min;
  return { siguiente, progreso: Math.min(1, (score - actual.min) / span) };
}

/** Eventos de conducción simulados que afectan la reputación. */
export const EVENTOS = {
  buenaConduccion: { label: "Viaje sin incidentes", delta: +4, emoji: "✅" },
  respetaSemaforo: { label: "Respetó el semáforo", delta: +2, emoji: "🚦" },
  excesoVelocidad: { label: "Exceso de velocidad", delta: -6, emoji: "⚠️" },
  usoCelular: { label: "Uso del celular en marcha", delta: -8, emoji: "📵" },
} as const;

export type EventoKey = keyof typeof EVENTOS;

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ---- Documentos ----

export function estadoDocumento(doc: Documento): EstadoDocumento {
  const dias = diasParaVencer(doc.fechaVencimiento);
  if (dias < 0) return "vencido";
  if (dias <= 15) return "por_vencer";
  return "vigente";
}

export function diasParaVencer(fechaISO: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaISO + "T00:00:00");
  return Math.round((venc.getTime() - hoy.getTime()) / 86_400_000);
}

export function formatFecha(fechaISO: string): string {
  return new Date(fechaISO + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
