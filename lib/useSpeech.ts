"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Tipos mínimos de la Web Speech API (no están en lib.dom por defecto).
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeech(lang = "es-PE") {
  // Capacidad calculada una sola vez (evita setState dentro del effect).
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return getRecognitionCtor() !== null && "speechSynthesis" in window;
  });
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef<((t: string) => void) | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const texto = e.results?.[0]?.[0]?.transcript ?? "";
      onResultRef.current?.(texto.trim());
    };
    rec.onend = () => setEscuchando(false);
    rec.onerror = () => setEscuchando(false);
    recRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {}
    };
  }, [lang]);

  const escuchar = useCallback((onResult: (t: string) => void) => {
    const rec = recRef.current;
    if (!rec) return;
    onResultRef.current = onResult;
    try {
      // Evita solaparse con la voz del agente.
      window.speechSynthesis?.cancel();
      setEscuchando(true);
      rec.start();
    } catch {
      setEscuchando(false);
    }
  }, []);

  const detener = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    setEscuchando(false);
  }, []);

  const hablar = useCallback(
    (texto: string) =>
      new Promise<void>((resolve) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          resolve();
          return;
        }
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = lang;
        u.rate = 1.02;
        u.pitch = 1;
        const voz = window.speechSynthesis
          .getVoices()
          .find((v) => v.lang?.toLowerCase().startsWith("es"));
        if (voz) u.voice = voz;

        let resuelto = false;
        const terminar = () => {
          if (resuelto) return;
          resuelto = true;
          clearTimeout(guard);
          setHablando(false);
          resolve();
        };
        // Si onend no dispara (p. ej. equipos sin audio), no bloqueamos la
        // conversación: liberamos tras un tiempo estimado por longitud.
        const guard = setTimeout(terminar, 3000 + texto.length * 70);

        u.onstart = () => setHablando(true);
        u.onend = terminar;
        u.onerror = terminar;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }),
    [lang],
  );

  return { supported, escuchando, hablando, escuchar, detener, hablar };
}
