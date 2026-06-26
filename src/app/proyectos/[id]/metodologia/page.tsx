"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { MethodologyForm } from "@/components/MethodologyForm";
import { MethodologyList } from "@/components/MethodologyList";
import { Button } from "@/components/ui/button";
import {
  MethodologyEntry,
  MethodologyInput,
  useCatalog,
  useCreateMethodologyEntry,
  useDeleteMethodologyEntry,
  useMethodologyEntries,
  useUpdateMethodologyEntry,
} from "@/lib/api";

export default function ProyectoMetodologiaPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: enfoques, isError: enfoquesError } = useCatalog("metodologia_enfoque");

  const { data: entries, isError: entriesError } = useMethodologyEntries(projectId);
  const createEntry = useCreateMethodologyEntry(projectId);
  const updateEntry = useUpdateMethodologyEntry(projectId);
  const deleteEntry = useDeleteMethodologyEntry(projectId);

  const [editing, setEditing] = useState<MethodologyEntry | "new" | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function handleSubmit(input: MethodologyInput) {
    if (editing && editing !== "new") {
      await updateEntry.mutateAsync({ id: editing.id, input });
    } else {
      await createEntry.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: MethodologyEntry) {
    await deleteEntry.mutateAsync(entry.id);
  }

  async function handleToggleActivo(entry: MethodologyEntry, nuevoValor: boolean) {
    setToggleError(null);
    try {
      await updateEntry.mutateAsync({ id: entry.id, input: { activo: nuevoValor } });
    } catch {
      setToggleError("No se pudo actualizar el estado. Intentalo de nuevo.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {enfoquesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar el catalogo de enfoques.
        </p>
      )}

      {toggleError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {toggleError}
        </p>
      )}

      {editing && enfoques ? (
        <MethodologyForm
          enfoques={enfoques}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nuevo enfoque
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <MethodologyList
          entries={entries}
          onEdit={setEditing}
          onDelete={handleDelete}
          onToggleActivo={handleToggleActivo}
        />
      )}

      {entriesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudieron cargar los enfoques metodologicos.
        </p>
      )}
    </div>
  );
}
