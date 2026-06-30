import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccessPointEntry } from "@/lib/api";
import { CriticalityBadge } from "./CriticalityBadge";

interface AccessPointListProps {
  entries: AccessPointEntry[];
  onEdit: (entry: AccessPointEntry) => void;
  onDelete: (entry: AccessPointEntry) => void;
}

export function AccessPointList({ entries, onEdit, onDelete }: AccessPointListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavia no hay accesos cargados. Agregar uno.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="access-point-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">{entry.nombre}</p>
                  {entry.tipo && (
                    <p className="mt-1 text-sm text-muted-foreground">{entry.tipo}</p>
                  )}
                </div>
                <CriticalityBadge valor={entry.congestion} />
              </div>
              {entry.riesgo && (
                <p className="truncate text-sm text-muted-foreground">{entry.riesgo}</p>
              )}
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

      <div className="hidden md:block" data-testid="access-point-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Biometria</TableHead>
              <TableHead>LPR</TableHead>
              <TableHead>Congestion</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.nombre}</TableCell>
                <TableCell>{entry.tipo}</TableCell>
                <TableCell>{entry.biometria ? "Si" : "No"}</TableCell>
                <TableCell>{entry.lpr ? "Si" : "No"}</TableCell>
                <TableCell>
                  <CriticalityBadge valor={entry.congestion} />
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
