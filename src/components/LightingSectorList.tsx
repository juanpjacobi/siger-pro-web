import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IlluminationEntry } from "@/lib/api";
import { CriticalityBadge } from "./CriticalityBadge";

interface LightingSectorListProps {
  entries: IlluminationEntry[];
  onEdit: (entry: IlluminationEntry) => void;
  onDelete: (entry: IlluminationEntry) => void;
}

export function LightingSectorList({ entries, onEdit, onDelete }: LightingSectorListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavía no hay sectores de iluminación cargados. Agregar uno.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="lighting-sector-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">{entry.sector}</p>
                  {entry.tipo && (
                    <p className="mt-1 text-sm text-muted-foreground">{entry.tipo}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.fotocelula && (
                      <span
                        data-label="fotocelula"
                        className="rounded-sm bg-accent px-1.5 py-0.5 text-xs text-accent-foreground"
                      >
                        Fotocélula
                      </span>
                    )}
                    {entry.timer && (
                      <span
                        data-label="timer"
                        className="rounded-sm bg-accent px-1.5 py-0.5 text-xs text-accent-foreground"
                      >
                        Timer
                      </span>
                    )}
                  </div>
                </div>
                <CriticalityBadge valor={entry.criticidad} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(entry)}>
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(entry)}
                >
                  Borrar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden md:block" data-testid="lighting-sector-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sector</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cobertura</TableHead>
              <TableHead>Criticidad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.sector}</TableCell>
                <TableCell>{entry.tipo}</TableCell>
                <TableCell>{entry.estado}</TableCell>
                <TableCell>{entry.cobertura}</TableCell>
                <TableCell>
                  <CriticalityBadge valor={entry.criticidad} />
                </TableCell>
                <TableCell>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={() => onEdit(entry)}>
                    Editar
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-destructive"
                    onClick={() => onDelete(entry)}
                  >
                    Borrar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
