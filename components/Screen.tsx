"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRuti } from "@/lib/store";
import { Avatar, RutiLogo } from "./Brand";
import { LogoutIcon } from "./icons";

/** Envoltorio de pantallas internas: exige sesión y dibuja el encabezado. */
export function Screen({
  titulo,
  subtitulo,
  children,
  fill = false,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  /** Si es true, el contenido llena la altura sin scroll de página
   *  (para pantallas con scroll interno propio, como el chat de voz o el mapa). */
  fill?: boolean;
}) {
  const router = useRouter();
  const usuario = useRuti((s) => s.usuario);
  const hydrated = useRuti((s) => s.hydrated);
  const logout = useRuti((s) => s.logout);

  const cerrarSesion = () => {
    logout();
    router.replace("/");
  };

  useEffect(() => {
    if (hydrated && !usuario) router.replace("/");
  }, [hydrated, usuario, router]);

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Cargando…
      </div>
    );
  }
  if (!usuario) return null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border bg-background/85 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <RutiLogo size={34} />
          <div>
            <h1 className="text-base font-bold leading-tight">{titulo}</h1>
            {subtitulo && (
              <p className="text-[11px] text-muted">{subtitulo}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar nombre={usuario.nombre} size={34} />
          <button
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:border-danger/50 hover:text-danger"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div
        className={`min-h-0 flex-1 px-5 py-4 ${
          fill ? "flex flex-col" : "no-scrollbar overflow-y-auto"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
