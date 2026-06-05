import type { Badge } from "@/lib/types";

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((b) => (
        <div
          key={b.id}
          className={`rounded-2xl border p-3 ${
            b.desbloqueado
              ? "border-accent/30 bg-surface/60"
              : "border-border bg-surface/30 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`text-2xl ${b.desbloqueado ? "" : "grayscale"}`}>
              {b.emoji}
            </span>
            <p className="text-sm font-semibold leading-tight">{b.nombre}</p>
          </div>
          <p className="mt-1.5 text-[11px] text-muted">{b.descripcion}</p>
          {!b.desbloqueado && (
            <p className="mt-1 text-[10px] font-medium text-muted">🔒 Bloqueado</p>
          )}
        </div>
      ))}
    </div>
  );
}
