import { nivelDeScore } from "@/lib/gamification";

export function ScoreRing({ score }: { score: number }) {
  const nivel = nivelDeScore(score);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);

  return (
    <div className="relative grid h-[150px] w-[150px] place-items-center">
      <svg className="-rotate-90" width="150" height="150">
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth="12"
        />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke={nivel.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold">{score}</span>
        <span className="text-[11px] text-muted">/ 100</span>
        <span className="mt-0.5 text-xs font-semibold" style={{ color: nivel.color }}>
          {nivel.emoji} {nivel.nombre}
        </span>
      </div>
    </div>
  );
}
