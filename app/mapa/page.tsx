"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Screen } from "@/components/Screen";
import { useRuti } from "@/lib/store";
import { pasajerosSeed, rutasSeed, LIMA_CENTER } from "@/lib/seed";
import type { Pasajero } from "@/lib/types";
import { MapPin, CheckCircle2, Navigation, Users, DollarSign, TrendingUp, type LucideIcon } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center glass-panel text-sm text-primary animate-pulse font-medium">
      Cargando mapa en tiempo real...
    </div>
  ),
});

export default function MapaPage() {
  const rutaSeleccionada = useRuti((s) => s.rutaSeleccionada);
  const seleccionarRuta = useRuti((s) => s.seleccionarRuta);
  const aceptarPasajero = useRuti((s) => s.aceptarPasajero);
  const aplicarEvento = useRuti((s) => s.aplicarEvento);
  const aceptados = useRuti((s) => s.pasajerosAceptados);
  const ingresos = useRuti((s) => s.ingresos);

  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!rutaSeleccionada) seleccionarRuta(rutasSeed[0]);
  }, [rutaSeleccionada, seleccionarRuta]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const center = userPos ?? LIMA_CENTER;

  const pasajeros: Pasajero[] = useMemo(() => {
    const base = userPos;
    if (!base) return pasajerosSeed;
    return pasajerosSeed.map((p) => ({
      ...p,
      lat: base[0] + (p.lat - LIMA_CENTER[0]),
      lng: base[1] + (p.lng - LIMA_CENTER[1]),
    }));
  }, [userPos]);

  const handleAceptar = (p: Pasajero) => {
    if (aceptados.includes(p.id)) return;
    aceptarPasajero(p);
    aplicarEvento("buenaConduccion");
  };

  return (
    <Screen titulo="Rutas Inteligentes" subtitulo="Radares en tiempo real" fill>
      <div className="flex h-full flex-col gap-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 blur-[120px] -z-10 rounded-full pointer-events-none" />
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Mini valor={`${aceptados.length}`} label="Pasajeros" Icon={Users} />
          <Mini valor={`S/ ${ingresos.toFixed(2)}`} label="Ingresos" Icon={DollarSign} />
          <Mini valor="+20%" label="Meta ruta" acento Icon={TrendingUp} />
        </div>

        {/* Rutas */}
        <div className="flex flex-col gap-1.5">
          <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
            {rutasSeed.map((r) => {
              const activa = rutaSeleccionada?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => seleccionarRuta(r)}
                  className={`shrink-0 rounded-2xl border px-4 py-2 text-[13px] font-semibold transition-all relative overflow-hidden group ${
                    activa
                      ? "border-accent/50 text-accent"
                      : "border-white/10 glass text-muted hover:border-white/20"
                  }`}
                >
                  {activa && <div className="absolute inset-0 bg-accent/10 -z-10" />}
                  <div className="flex items-center gap-2">
                    <Navigation className={`w-3.5 h-3.5 ${activa ? "text-accent" : "text-muted"}`} />
                    Ruta {r.codigo}
                  </div>
                </button>
              );
            })}
          </div>
          {rutaSeleccionada && (
            <p
              key={rutaSeleccionada.id}
              className="fade-up text-xs text-muted font-medium ml-1 flex items-center gap-1.5"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {rutaSeleccionada.nombre}
            </p>
          )}
        </div>

        {/* Mapa */}
        <div className="min-h-[220px] flex-1 overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none z-10 mix-blend-overlay" />
          <MapView
            center={center}
            userPos={userPos}
            pasajeros={pasajeros}
            aceptados={aceptados}
            onAceptar={handleAceptar}
          />
        </div>

        {/* Lista de pasajeros */}
        <div className="no-scrollbar max-h-[36%] shrink-0 space-y-3 overflow-y-auto pb-2">
          {pasajeros.map((p, idx) => {
            const aceptado = aceptados.includes(p.id);
            return (
              <div
                key={p.id}
                className="fade-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
              <div
                className={`glass-panel group flex items-center gap-4 rounded-3xl p-3.5 transition-all duration-300 ${aceptado ? 'opacity-60 saturate-50 border-success/20' : 'hover:scale-[1.02] border-white/10'}`}
              >
                <div className={`rounded-2xl p-2.5 transition-colors ${aceptado ? 'bg-success/20 text-success' : 'bg-accent/15 text-accent group-hover:bg-accent group-hover:text-black'}`}>
                  <MapPin className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-foreground">
                    {p.nombre} <span className="text-yellow-400 font-medium text-xs ml-1">⭐ {p.ratingPasajero}</span>
                  </p>
                  <p className="truncate text-[12px] text-muted/80 mt-0.5">
                    {p.origen} <span className="mx-1 text-accent/50">→</span> {p.destino}
                  </p>
                  <p className="text-[13px] font-bold text-primary mt-0.5">
                    S/ {p.tarifa.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleAceptar(p)}
                  disabled={aceptado}
                  className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 text-[13px] font-bold transition-all ${
                    aceptado
                      ? "bg-success/20 text-success"
                      : "bg-gradient-to-r from-accent to-cyan-500 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
                  }`}
                >
                  {aceptado ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Aceptado
                    </>
                  ) : (
                    "Aceptar"
                  )}
                </button>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

function Mini({
  valor,
  label,
  acento,
  Icon,
}: {
  valor: string;
  label: string;
  acento?: boolean;
  Icon?: LucideIcon;
}) {
  return (
    <div className={`glass-panel rounded-3xl p-3 flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 border ${acento ? 'border-accent/30 bg-accent/5' : 'border-white/5'}`}>
      {Icon && <Icon className={`h-4 w-4 mb-1 ${acento ? "text-accent" : "text-muted"}`} />}
      <p className={`text-[17px] font-extrabold tracking-tight ${acento ? "text-accent drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "text-foreground"}`}>
        {valor}
      </p>
      <p className="text-[10px] font-medium text-muted/80 uppercase tracking-wider">{label}</p>
    </div>
  );
}
