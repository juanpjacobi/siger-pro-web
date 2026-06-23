import { AdversaryTimeState } from "@/lib/api";

const STYLES: Record<AdversaryTimeState, string> = {
  favorable: "bg-green-100 text-green-800",
  ajustado: "bg-yellow-100 text-yellow-800",
  limite: "bg-orange-100 text-orange-800",
  desfavorable: "bg-red-100 text-red-800",
  critico: "bg-red-200 text-red-900",
};

const LABELS: Record<AdversaryTimeState, string> = {
  favorable: "Favorable",
  ajustado: "Ajustado",
  limite: "Limite",
  desfavorable: "Desfavorable",
  critico: "Critico",
};

export function TimeStatusBadge({ estado }: { estado: AdversaryTimeState }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STYLES[estado]}`}>
      {LABELS[estado]}
    </span>
  );
}
