import { RiskLevel } from "@/lib/api";

const STYLES: Record<RiskLevel, string> = {
  Bajo: "bg-green-100 text-green-800",
  Medio: "bg-yellow-100 text-yellow-800",
  Alto: "bg-orange-100 text-orange-800",
  Critico: "bg-red-100 text-red-800",
};

export function RiskBadge({ nivel }: { nivel: RiskLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STYLES[nivel]}`}>
      {nivel}
    </span>
  );
}
