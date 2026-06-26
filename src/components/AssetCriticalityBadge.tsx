import { Badge } from "@/components/ui/badge";

const STYLES: Record<string, string> = {
  Baja: "bg-green-500/15 text-green-400 border-green-500/30",
  Media: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Alta: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Critica: "bg-red-500/15 text-red-400 border-red-500/30",
};

const FALLBACK_STYLE = "bg-muted text-muted-foreground border-border";

export function AssetCriticalityBadge({ valor }: { valor: string | null | undefined }) {
  const style = (valor && STYLES[valor]) || FALLBACK_STYLE;
  const label = valor && STYLES[valor] ? valor : "Sin dato";

  return (
    <Badge variant="outline" className={style}>
      {label}
    </Badge>
  );
}
