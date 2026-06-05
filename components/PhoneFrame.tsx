import { BottomNav } from "./BottomNav";

/** Marco tipo teléfono: en móvil ocupa la pantalla, en escritorio se ve como
 *  un dispositivo centrado para que los jurados perciban una app móvil real. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-0 sm:p-6">
      <div className="relative flex h-dvh w-full max-w-[400px] flex-col overflow-hidden bg-background sm:h-[850px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border-[6px] sm:border-zinc-900 shadow-[0_0_80px_rgba(139,92,246,0.15)] ring-1 ring-white/10 backdrop-blur-md">
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
