import type { Documento } from "@/lib/types";
import { estadoDocumento, diasParaVencer } from "@/lib/gamification";
import { AlertIcon, CheckIcon } from "./icons";

export function AlertBanner({ documentos }: { documentos: Documento[] }) {
  const vencidos = documentos.filter((d) => estadoDocumento(d) === "vencido");
  const porVencer = documentos
    .filter((d) => estadoDocumento(d) === "por_vencer")
    .sort((a, b) => diasParaVencer(a.fechaVencimiento) - diasParaVencer(b.fechaVencimiento));

  if (vencidos.length === 0 && porVencer.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-success">
        <CheckIcon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          Todos tus documentos están vigentes. ¡Listo para circular!
        </p>
      </div>
    );
  }

  const critico = vencidos[0];
  if (critico) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-danger">
        <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">
            Tu {critico.tipo} está vencido
          </p>
          <p className="text-xs opacity-80">
            Regulariza este documento para evitar sanciones de la ATU.
          </p>
        </div>
      </div>
    );
  }

  const prox = porVencer[0];
  const dias = diasParaVencer(prox.fechaVencimiento);
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-warning">
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">
          Tu {prox.tipo} vence en {dias} {dias === 1 ? "día" : "días"}
        </p>
        <p className="text-xs opacity-80">
          Renuévalo a tiempo para mantener tu reputación al máximo.
        </p>
      </div>
    </div>
  );
}
