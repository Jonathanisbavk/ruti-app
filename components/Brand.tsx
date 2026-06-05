export function RutiLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 19V6a2 2 0 0 1 2-2h6l4 4v11" />
        <circle cx="8" cy="19" r="1.6" />
        <circle cx="16" cy="19" r="1.6" />
        <path d="M5 12h9" />
      </svg>
    </div>
  );
}

export function Wordmark({ size = 44 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <RutiLogo size={size} />
      <div className="leading-none">
        <p className="text-2xl font-extrabold tracking-tight">RUTI</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Creaciones Fast
        </p>
      </div>
    </div>
  );
}

export function Avatar({
  nombre,
  size = 36,
}: {
  nombre: string;
  size?: number;
}) {
  const iniciales = nombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary font-bold text-background"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {iniciales}
    </div>
  );
}
