"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AccessPointForm } from "@/components/AccessPointForm";
import { AccessPointList } from "@/components/AccessPointList";
import { Button } from "@/components/ui/button";
import {
  AccessPointEntry,
  AccessPointInput,
  useCatalog,
  useAccessPoints,
  useCreateAccessPoint,
  useDeleteAccessPoint,
  useUpdateAccessPoint,
} from "@/lib/api";

export default function ProyectoAccesosPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: tipos, isError: tiposError } = useCatalog("accesos_tipo");
  const { data: ctrlPeatonales, isError: ctrlPeatonalesError } = useCatalog("accesos_ctrlPeatonal");
  const { data: ctrlVehiculares, isError: ctrlVehiculresError } = useCatalog("accesos_ctrlVehicular");
  const { data: congestiones, isError: congestionesError } = useCatalog("accesos_congestion");
  const { data: trazabilidades, isError: trazabilidadesError } = useCatalog("accesos_trazabilidad");

  const { data: entries, isError: entriesError } = useAccessPoints(projectId);
  const createAccessPoint = useCreateAccessPoint(projectId);
  const updateAccessPoint = useUpdateAccessPoint(projectId);
  const deleteAccessPoint = useDeleteAccessPoint(projectId);

  const [editing, setEditing] = useState<AccessPointEntry | "new" | null>(null);

  async function handleSubmit(input: AccessPointInput) {
    if (editing && editing !== "new") {
      await updateAccessPoint.mutateAsync({ id: editing.id, input });
    } else {
      await createAccessPoint.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: AccessPointEntry) {
    await deleteAccessPoint.mutateAsync(entry.id);
  }

  const anyCatalogError =
    tiposError ||
    ctrlPeatonalesError ||
    ctrlVehiculresError ||
    congestionesError ||
    trazabilidadesError;

  const catalogsReady = tipos && ctrlPeatonales && ctrlVehiculares && congestiones && trazabilidades;

  return (
    <div className="flex flex-col gap-4">
      {anyCatalogError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar alguno de los catalogos de accesos.
        </p>
      )}

      {editing && catalogsReady ? (
        <AccessPointForm
          catalogs={{
            tipos: tipos ?? [],
            ctrlPeatonales: ctrlPeatonales ?? [],
            ctrlVehiculares: ctrlVehiculares ?? [],
            congestiones: congestiones ?? [],
            trazabilidades: trazabilidades ?? [],
          }}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nuevo acceso
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <AccessPointList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}

      {entriesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar la lista de accesos.
        </p>
      )}
    </div>
  );
}
