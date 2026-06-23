import { Badge } from "@/components/ui/badge";
import { AdversaryTimeState } from "@/lib/api";

const STYLES: Record<AdversaryTimeState, string> = {
  favorable: "bg-green-500/15 text-green-400 border-green-500/30",
  ajustado: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  limite: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  desfavorable: "bg-red-500/15 text-red-400 border-red-500/30",
  critico: "bg-red-600/20 text-red-300 border-red-600/40",
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
    <Badge variant="outline" className={STYLES[estado]}>
      {LABELS[estado]}
    </Badge>
  );
}
