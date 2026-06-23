import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdversaryTimeEntry } from "@/lib/api";
import { TimeStatusBadge } from "./TimeStatusBadge";

interface AdversaryTimeListProps {
  entries: AdversaryTimeEntry[];
  onEdit: (entry: AdversaryTimeEntry) => void;
  onDelete: (entry: AdversaryTimeEntry) => void;
}

export function AdversaryTimeList({ entries, onEdit, onDelete }: AdversaryTimeListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavia no hay escenarios de tiempos. Cargar el primero.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="adversary-time-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-none">{entry.amenaza}</p>
                <TimeStatusBadge estado={entry.estado} />
              </div>
              <p className="text-sm">Delta: {entry.delta}</p>
              <p className="text-sm text-muted-foreground">{entry.msg}</p>
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

      <div className="hidden md:block" data-testid="adversary-time-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amenaza</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.amenaza}</TableCell>
                <TableCell>{entry.delta}</TableCell>
                <TableCell>
                  <TimeStatusBadge estado={entry.estado} />
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
