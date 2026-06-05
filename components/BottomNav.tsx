"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRuti } from "@/lib/store";
import { MicIcon, DocIcon, MapIcon, TrophyIcon } from "./icons";

const items = [
  { href: "/onboarding", label: "Registro", Icon: MicIcon },
  { href: "/documentos", label: "Documentos", Icon: DocIcon },
  { href: "/mapa", label: "Ruta", Icon: MapIcon },
  { href: "/reputacion", label: "Reputación", Icon: TrophyIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const usuario = useRuti((s) => s.usuario);

  // Sólo se muestra tras iniciar sesión y nunca en la pantalla de login.
  if (!usuario || pathname === "/") return null;

  return (
    <nav className="shrink-0 border-t border-border bg-surface/90 backdrop-blur">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, Icon }) => {
          const activo = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                  activo ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${activo ? "stroke-[2.4]" : ""}`} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
