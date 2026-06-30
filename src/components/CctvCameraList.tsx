import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CctvCameraEntry } from "@/lib/api";
import { CriticalityBadge } from "./CriticalityBadge";

interface CctvCameraListProps {
  entries: CctvCameraEntry[];
  onEdit: (entry: CctvCameraEntry) => void;
  onDelete: (entry: CctvCameraEntry) => void;
}

export function CctvCameraList({ entries, onEdit, onDelete }: CctvCameraListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavía no hay cámaras cargadas. Agregar una.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="cctv-camera-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">{entry.camId}</p>
                  {entry.nombre && (
                    <p className="mt-1 text-sm text-muted-foreground">{entry.nombre}</p>
                  )}
                  {entry.tipo && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{entry.tipo}</p>
                  )}
                  {entry.estado && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{entry.estado}</p>
                  )}
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

      <div className="hidden md:block" data-testid="cctv-camera-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Grabación</TableHead>
              <TableHead>Criticidad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.camId}</TableCell>
                <TableCell>{entry.nombre}</TableCell>
                <TableCell>{entry.tipo}</TableCell>
                <TableCell>{entry.estado}</TableCell>
                <TableCell>{entry.grabacion}</TableCell>
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
