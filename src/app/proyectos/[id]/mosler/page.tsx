"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { MoslerForm } from "@/components/MoslerForm";
import { MoslerList } from "@/components/MoslerList";
import { Button } from "@/components/ui/button";
import {
  MoslerEntry,
  MoslerInput,
  useCatalog,
  useCreateMoslerEntry,
  useDeleteMoslerEntry,
  useMoslerEntries,
  useUpdateMoslerEntry,
} from "@/lib/api";

export default function ProyectoMoslerPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: amenazas, isError: amenazasError } = useCatalog("mosler_amenaza");
  const { data: tiposMedida, isError: tiposMedidaError } = useCatalog("mosler_tipoMedida");
  const { data: residuales, isError: residualesError } = useCatalog("mosler_residual");
  const { data: estadosMedida, isError: estadosMedidaError } = useCatalog("mosler_estadoMedida");
  const catalogs =
    amenazas && tiposMedida && residuales && estadosMedida
      ? { amenazas, tiposMedida, residuales, estadosMedida }
      : null;
  const catalogsError = amenazasError || tiposMedidaError || residualesError || estadosMedidaError;

  const { data: entries, isError: entriesError } = useMoslerEntries(projectId);
  const createMosler = useCreateMoslerEntry(projectId);
  const updateMosler = useUpdateMoslerEntry(projectId);
  const deleteMosler = useDeleteMoslerEntry(projectId);

  const [editing, setEditing] = useState<MoslerEntry | "new" | null>(null);

  async function handleSubmit(input: MoslerInput) {
    if (editing && editing !== "new") {
      await updateMosler.mutateAsync({ id: editing.id, input });
    } else {
      await createMosler.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: MoslerEntry) {
    await deleteMosler.mutateAsync(entry.id);
  }

  return (
    <div className="flex flex-col gap-4">
      {catalogsError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudieron cargar los catalogos.
        </p>
      )}

      {editing && catalogs ? (
        <MoslerForm
          catalogs={catalogs}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nueva entrada Mosler
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <MoslerList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}
