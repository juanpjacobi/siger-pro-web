import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MethodologyEntry } from "@/lib/api";

interface MethodologyListProps {
  entries: MethodologyEntry[];
  onEdit: (entry: MethodologyEntry) => void;
  onDelete: (entry: MethodologyEntry) => void;
  onToggleActivo: (entry: MethodologyEntry, nuevoValor: boolean) => void;
}

export function MethodologyList({ entries, onEdit, onDelete, onToggleActivo }: MethodologyListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavia no hay enfoques cargados. Agregar uno.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="methodology-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-none">{entry.enfoque}</p>
                <Checkbox
                  aria-label="Activo"
                  checked={entry.activo}
                  onCheckedChange={(checked) => onToggleActivo(entry, checked)}
                />
              </div>
              {entry.observaciones && <p className="text-sm text-muted-foreground">{entry.observaciones}</p>}
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

      <div className="hidden md:block" data-testid="methodology-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enfoque</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.enfoque}</TableCell>
                <TableCell>
                  <Checkbox
                    aria-label="Activo"
                    checked={entry.activo}
                    onCheckedChange={(checked) => onToggleActivo(entry, checked)}
                  />
                </TableCell>
                <TableCell className="max-w-xs truncate">{entry.observaciones}</TableCell>
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
