import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/api";

const STYLES: Record<RiskLevel, string> = {
  Bajo: "bg-green-500/15 text-green-400 border-green-500/30",
  Medio: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Alto: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Critico: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function RiskBadge({ nivel }: { nivel: RiskLevel }) {
  return (
    <Badge variant="outline" className={STYLES[nivel]}>
      {nivel}
    </Badge>
  );
}
