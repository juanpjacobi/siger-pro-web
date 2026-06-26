"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AssetForm } from "@/components/AssetForm";
import { AssetList } from "@/components/AssetList";
import { Button } from "@/components/ui/button";
import {
  AssetEntry,
  AssetInput,
  useAssets,
  useCatalog,
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
} from "@/lib/api";

export default function ProyectoActivosPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: tipos, isError: tiposError } = useCatalog("activos_tipo");
  const { data: valoresCualitativos, isError: valoresCualitativosError } = useCatalog(
    "activos_valorCualitativo",
  );
  const { data: exposiciones, isError: exposicionesError } = useCatalog("activos_exposicion");
  const { data: prioridades, isError: prioridadesError } = useCatalog("activos_prioridad");

  const { data: entries, isError: entriesError } = useAssets(projectId);
  const createAsset = useCreateAsset(projectId);
  const updateAsset = useUpdateAsset(projectId);
  const deleteAsset = useDeleteAsset(projectId);

  const [editing, setEditing] = useState<AssetEntry | "new" | null>(null);

  async function handleSubmit(input: AssetInput) {
    if (editing && editing !== "new") {
      await updateAsset.mutateAsync({ id: editing.id, input });
    } else {
      await createAsset.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: AssetEntry) {
    await deleteAsset.mutateAsync(entry.id);
  }

  const catalogsReady = tipos && valoresCualitativos && exposiciones && prioridades;
  const anyCatalogError = tiposError || valoresCualitativosError || exposicionesError || prioridadesError;

  return (
    <div className="flex flex-col gap-4">
      {anyCatalogError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar alguno de los catalogos de activos.
        </p>
      )}

      {editing && catalogsReady ? (
        <AssetForm
          catalogs={{
            tipos: tipos ?? [],
            valoresCualitativos: valoresCualitativos ?? [],
            exposiciones: exposiciones ?? [],
            prioridades: prioridades ?? [],
          }}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nuevo activo
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <AssetList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}

      {entriesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar la lista de activos.
        </p>
      )}
    </div>
  );
}
