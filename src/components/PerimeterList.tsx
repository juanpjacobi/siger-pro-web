import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PerimeterSectorEntry } from "@/lib/api";
import { CriticalityBadge } from "./CriticalityBadge";

interface PerimeterListProps {
  entries: PerimeterSectorEntry[];
  onEdit: (entry: PerimeterSectorEntry) => void;
  onDelete: (entry: PerimeterSectorEntry) => void;
}

export function PerimeterList({ entries, onEdit, onDelete }: PerimeterListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavia no hay tramos perimetrales cargados. Agregar uno.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="perimeter-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">{entry.sector}</p>
                  {entry.cerramiento && (
                    <p className="mt-1 text-sm text-muted-foreground">{entry.cerramiento}</p>
                  )}
                </div>
                <CriticalityBadge valor={entry.criticidad} />
              </div>
              {(entry.estado || entry.continuidad) && (
                <p className="text-sm">
                  {[entry.estado, entry.continuidad].filter(Boolean).join(" / ")}
                </p>
              )}
              {entry.vulns && <p className="truncate text-sm">Vulnerabilidades: {entry.vulns}</p>}
              {entry.obsPer && <p className="truncate text-sm">Observaciones: {entry.obsPer}</p>}
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

      <div className="hidden md:block" data-testid="perimeter-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sector</TableHead>
              <TableHead>Cerramiento</TableHead>
              <TableHead>Altura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Iluminacion</TableHead>
              <TableHead>Criticidad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.sector}</TableCell>
                <TableCell>{entry.cerramiento}</TableCell>
                <TableCell>{entry.altura}</TableCell>
                <TableCell>{entry.estado}</TableCell>
                <TableCell>{entry.iluminacion}</TableCell>
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
