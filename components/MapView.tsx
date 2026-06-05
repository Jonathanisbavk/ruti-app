"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Pasajero } from "@/lib/types";

function pasajeroIcon(aceptado: boolean) {
  const color = aceptado ? "#22c55e" : "#2563eb";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:30px;height:38px;">
      <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);
        width:26px;height:26px;border-radius:50% 50% 50% 0;rotate:-45deg;
        background:${color};border:2px solid #eaf0ff;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>
      <div style="position:absolute;left:50%;top:7px;transform:translateX(-50%);
        width:10px;height:10px;border-radius:50%;background:#0b1020;"></div>
    </div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -34],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#22d3ee;
    border:3px solid #0b1020;box-shadow:0 0 0 3px rgba(34,211,238,.4);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function MapView({
  center,
  userPos,
  pasajeros,
  aceptados,
  onAceptar,
}: {
  center: [number, number];
  userPos: [number, number] | null;
  pasajeros: Pasajero[];
  aceptados: string[];
  onAceptar: (p: Pasajero) => void;
}) {
  const iconos = useMemo(
    () => ({ on: pasajeroIcon(true), off: pasajeroIcon(false) }),
    [],
  );

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />

      {userPos && (
        <>
          <Circle
            center={userPos}
            radius={350}
            pathOptions={{
              color: "#22d3ee",
              fillColor: "#22d3ee",
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
          <Marker position={userPos} icon={userIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>
        </>
      )}

      {pasajeros.map((p) => {
        const aceptado = aceptados.includes(p.id);
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={aceptado ? iconos.on : iconos.off}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{p.nombre}</strong> · ⭐ {p.ratingPasajero}
                <br />
                {p.origen} → {p.destino}
                <br />
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  S/ {p.tarifa.toFixed(2)}
                </span>
                <br />
                <button
                  onClick={() => onAceptar(p)}
                  disabled={aceptado}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: aceptado ? "#22c55e" : "#2563eb",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: aceptado ? "default" : "pointer",
                  }}
                >
                  {aceptado ? "Aceptado ✓" : "Aceptar viaje"}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
