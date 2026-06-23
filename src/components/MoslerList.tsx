import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoslerEntry } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";

interface MoslerListProps {
  entries: MoslerEntry[];
  onEdit: (entry: MoslerEntry) => void;
  onDelete: (entry: MoslerEntry) => void;
}

export function MoslerList({ entries, onEdit, onDelete }: MoslerListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavia no hay entradas Mosler. Cargar la primera.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden" data-testid="mosler-cards">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">
                    {entry.amenaza === "Otra" ? entry.amenazaOtra : entry.amenaza}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.sector}</p>
                </div>
                <RiskBadge nivel={entry.nivel} />
              </div>
              <p className="text-sm">EV: {entry.ev}</p>
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

      <div className="hidden md:block" data-testid="mosler-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amenaza</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>EV</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.amenaza === "Otra" ? entry.amenazaOtra : entry.amenaza}</TableCell>
                <TableCell>{entry.sector}</TableCell>
                <TableCell>{entry.ev}</TableCell>
                <TableCell>
                  <RiskBadge nivel={entry.nivel} />
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
