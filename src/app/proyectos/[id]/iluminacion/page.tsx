"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { LightingSectorForm } from "@/components/LightingSectorForm";
import { LightingSectorList } from "@/components/LightingSectorList";
import { Button } from "@/components/ui/button";
import {
  IlluminationEntry,
  IlluminationInput,
  useCatalog,
  useCreateIlluminationSector,
  useDeleteIlluminationSector,
  useIlluminationSectors,
  useUpdateIlluminationSector,
} from "@/lib/api";

export default function ProyectoIluminacionPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: estados, isError: estadosError } = useCatalog("iluminacion_estado");
  const { data: coberturas, isError: coberturasError } = useCatalog("iluminacion_cobertura");
  const { data: criticidades, isError: criticidadesError } = useCatalog("iluminacion_criticidad");

  const { data: entries, isError: entriesError } = useIlluminationSectors(projectId);
  const createSector = useCreateIlluminationSector(projectId);
  const updateSector = useUpdateIlluminationSector(projectId);
  const deleteSector = useDeleteIlluminationSector(projectId);

  const [editing, setEditing] = useState<IlluminationEntry | "new" | null>(null);

  async function handleSubmit(input: IlluminationInput) {
    if (editing && editing !== "new") {
      await updateSector.mutateAsync({ id: editing.id, input });
    } else {
      await createSector.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: IlluminationEntry) {
    await deleteSector.mutateAsync(entry.id);
  }

  const anyCatalogError = estadosError || coberturasError || criticidadesError;

  const catalogsReady = estados && coberturas && criticidades;

  return (
    <div className="flex flex-col gap-4">
      {anyCatalogError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar alguno de los catalogos de iluminacion.
        </p>
      )}

      {editing && catalogsReady ? (
        <LightingSectorForm
          catalogs={{
            estados: estados ?? [],
            coberturas: coberturas ?? [],
            criticidades: criticidades ?? [],
          }}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nuevo sector
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <LightingSectorList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}

      {entriesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar la lista de sectores de iluminacion.
        </p>
      )}
    </div>
  );
}
