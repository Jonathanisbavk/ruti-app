"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRuti } from "@/lib/store";
import { Mic, FileText, Map as MapIcon, Award } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { href: "/onboarding", label: "Registro", Icon: Mic },
  { href: "/documentos", label: "Documentos", Icon: FileText },
  { href: "/mapa", label: "Ruta", Icon: MapIcon },
  { href: "/reputacion", label: "Reputación", Icon: Award },
];

export function BottomNav() {
  const pathname = usePathname();
  const usuario = useRuti((s) => s.usuario);

  // Sólo se muestra tras iniciar sesión y nunca en la pantalla de login.
  if (!usuario || pathname === "/") return null;

  return (
    <nav className="shrink-0 glass-panel relative z-50">
      <ul className="grid grid-cols-4 px-2 py-2">
        {items.map(({ href, label, Icon }) => {
          const activo = pathname === href;
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1.5 py-2.5 transition-all duration-300 ${
                  activo ? "text-primary scale-110" : "text-muted hover:text-foreground hover:scale-105"
                }`}
              >
                {activo && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-primary-soft rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`h-6 w-6 relative z-10 transition-colors ${activo ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className={`text-[10px] font-medium tracking-wide relative z-10 ${activo ? "font-bold" : ""}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
