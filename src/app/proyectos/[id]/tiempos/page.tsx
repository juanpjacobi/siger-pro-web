"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AdversaryTimeForm } from "@/components/AdversaryTimeForm";
import { AdversaryTimeList } from "@/components/AdversaryTimeList";
import { Button } from "@/components/ui/button";
import {
  AdversaryTimeEntry,
  AdversaryTimeInput,
  useAdversaryTimeEntries,
  useCatalog,
  useCreateAdversaryTimeEntry,
  useDeleteAdversaryTimeEntry,
  useUpdateAdversaryTimeEntry,
} from "@/lib/api";

export default function ProyectoTiemposPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: amenazas, isError: amenazasError } = useCatalog("mosler_amenaza");

  const { data: entries, isError: entriesError } = useAdversaryTimeEntries(projectId);
  const createAdversaryTime = useCreateAdversaryTimeEntry(projectId);
  const updateAdversaryTime = useUpdateAdversaryTimeEntry(projectId);
  const deleteAdversaryTime = useDeleteAdversaryTimeEntry(projectId);

  const [editing, setEditing] = useState<AdversaryTimeEntry | "new" | null>(null);

  async function handleSubmit(input: AdversaryTimeInput) {
    if (editing && editing !== "new") {
      await updateAdversaryTime.mutateAsync({ id: editing.id, input });
    } else {
      await createAdversaryTime.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: AdversaryTimeEntry) {
    await deleteAdversaryTime.mutateAsync(entry.id);
  }

  return (
    <div className="flex flex-col gap-4">
      {amenazasError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar el catalogo de amenazas.
        </p>
      )}

      {editing && amenazas ? (
        <AdversaryTimeForm
          catalogs={{ amenazas }}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nuevo escenario de tiempos
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <AdversaryTimeList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}
