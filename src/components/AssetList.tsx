import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssetEntry } from "@/lib/api";
import { AssetCriticalityBadge } from "./AssetCriticalityBadge";

interface AssetListProps {
  entries: AssetEntry[];
  onEdit: (entry: AssetEntry) => void;
  onDelete: (entry: AssetEntry) => void;
}

export function AssetList({ entries, onEdit, onDelete }: AssetListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavia no hay activos cargados. Agregar uno.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="asset-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">{entry.nombre}</p>
                  {entry.tipo && <p className="mt-1 text-sm text-muted-foreground">{entry.tipo}</p>}
                  {entry.ubicacion && <p className="text-sm text-muted-foreground">{entry.ubicacion}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <AssetCriticalityBadge valor={entry.exposicion} />
                  <AssetCriticalityBadge valor={entry.prioridad} />
                </div>
              </div>
              {entry.amenazas && <p className="text-sm">Amenazas: {entry.amenazas}</p>}
              {entry.impacto && <p className="text-sm">Impacto: {entry.impacto}</p>}
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

      <div className="hidden md:block" data-testid="asset-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Exposicion</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.nombre}</TableCell>
                <TableCell>{entry.tipo}</TableCell>
                <TableCell>{entry.ubicacion}</TableCell>
                <TableCell>
                  <AssetCriticalityBadge valor={entry.exposicion} />
                </TableCell>
                <TableCell>
                  <AssetCriticalityBadge valor={entry.prioridad} />
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
