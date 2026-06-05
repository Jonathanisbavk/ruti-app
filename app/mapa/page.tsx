"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Screen } from "@/components/Screen";
import { useRuti } from "@/lib/store";
import { pasajerosSeed, rutasSeed, LIMA_CENTER } from "@/lib/seed";
import type { Pasajero } from "@/lib/types";
import { PinIcon, CheckIcon } from "@/components/icons";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface text-sm text-muted">
      Cargando mapa…
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

  // Reubica los pasajeros alrededor de la posición real del conductor
  // manteniendo su disposición relativa, para que se vean "cercanos".
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
    <Screen titulo="Ruta y pasajeros" subtitulo="Paso 5 · pasajeros cercanos" fill>
      <div className="flex h-full flex-col gap-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Mini valor={`${aceptados.length}`} label="Pasajeros" />
          <Mini valor={`S/ ${ingresos.toFixed(2)}`} label="Ingresos" />
          <Mini valor="+20%" label="Meta ruta" acento />
        </div>

        {/* Rutas */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {rutasSeed.map((r) => {
            const activa = rutaSeleccionada?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => seleccionarRuta(r)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                  activa
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-surface text-muted"
                }`}
              >
                Ruta {r.codigo}
              </button>
            );
          })}
        </div>
        {rutaSeleccionada && (
          <p className="-mt-1 text-[11px] text-muted">
            {rutaSeleccionada.nombre}
          </p>
        )}

        {/* Mapa */}
        <div className="min-h-[200px] flex-1 overflow-hidden rounded-2xl border border-border">
          <MapView
            center={center}
            userPos={userPos}
            pasajeros={pasajeros}
            aceptados={aceptados}
            onAceptar={handleAceptar}
          />
        </div>

        {/* Lista de pasajeros */}
        <div className="no-scrollbar max-h-[34%] shrink-0 space-y-2 overflow-y-auto">
          {pasajeros.map((p) => {
            const aceptado = aceptados.includes(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-3"
              >
                <div className="rounded-xl bg-primary/15 p-2 text-accent">
                  <PinIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {p.nombre} · ⭐ {p.ratingPasajero}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {p.origen} → {p.destino} · S/ {p.tarifa.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleAceptar(p)}
                  disabled={aceptado}
                  className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold ${
                    aceptado
                      ? "bg-success/15 text-success"
                      : "bg-primary text-white active:scale-95"
                  }`}
                >
                  {aceptado ? (
                    <>
                      <CheckIcon className="h-4 w-4" /> Aceptado
                    </>
                  ) : (
                    "Aceptar"
                  )}
                </button>
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
}: {
  valor: string;
  label: string;
  acento?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-2.5 text-center">
      <p className={`text-base font-bold ${acento ? "text-accent" : ""}`}>
        {valor}
      </p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
