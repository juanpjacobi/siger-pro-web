"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { PerimeterForm } from "@/components/PerimeterForm";
import { PerimeterList } from "@/components/PerimeterList";
import { Button } from "@/components/ui/button";
import {
  PerimeterSectorEntry,
  PerimeterSectorInput,
  useCatalog,
  useCreatePerimeterSector,
  useDeletePerimeterSector,
  usePerimeterSectors,
  useUpdatePerimeterSector,
} from "@/lib/api";

export default function ProyectoPerimetroPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: cerramientos, isError: cerramientosError } = useCatalog("perimetro_cerramiento");
  const { data: estados, isError: estadosError } = useCatalog("perimetro_estado");
  const { data: escalabilidades, isError: escalabilidadesError } = useCatalog("perimetro_escalabilidad");
  const { data: continuidades, isError: continuidadesError } = useCatalog("perimetro_continuidad");
  const { data: vegetaciones, isError: vegetacionesError } = useCatalog("perimetro_vegetacion");
  const { data: visibilidades, isError: visibilidadesError } = useCatalog("perimetro_visibilidad");
  const { data: iluminaciones, isError: iluminacionesError } = useCatalog("perimetro_iluminacion");
  const { data: criticidades, isError: criticidadesError } = useCatalog("perimetro_criticidad");

  const { data: entries, isError: entriesError } = usePerimeterSectors(projectId);
  const createSector = useCreatePerimeterSector(projectId);
  const updateSector = useUpdatePerimeterSector(projectId);
  const deleteSector = useDeletePerimeterSector(projectId);

  const [editing, setEditing] = useState<PerimeterSectorEntry | "new" | null>(null);

  async function handleSubmit(input: PerimeterSectorInput) {
    if (editing && editing !== "new") {
      await updateSector.mutateAsync({ id: editing.id, input });
    } else {
      await createSector.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: PerimeterSectorEntry) {
    await deleteSector.mutateAsync(entry.id);
  }

  const catalogsReady =
    cerramientos &&
    estados &&
    escalabilidades &&
    continuidades &&
    vegetaciones &&
    visibilidades &&
    iluminaciones &&
    criticidades;
  const anyCatalogError =
    cerramientosError ||
    estadosError ||
    escalabilidadesError ||
    continuidadesError ||
    vegetacionesError ||
    visibilidadesError ||
    iluminacionesError ||
    criticidadesError;

  return (
    <div className="flex flex-col gap-4">
      {anyCatalogError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar alguno de los catalogos de perimetro.
        </p>
      )}

      {editing && catalogsReady ? (
        <PerimeterForm
          catalogs={{
            cerramientos: cerramientos ?? [],
            estados: estados ?? [],
            escalabilidades: escalabilidades ?? [],
            continuidades: continuidades ?? [],
            vegetaciones: vegetaciones ?? [],
            visibilidades: visibilidades ?? [],
            iluminaciones: iluminaciones ?? [],
            criticidades: criticidades ?? [],
          }}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nuevo tramo
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <PerimeterList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}

      {entriesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar la lista de tramos perimetrales.
        </p>
      )}
    </div>
  );
}
