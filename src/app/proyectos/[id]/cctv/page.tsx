"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { CctvCameraForm } from "@/components/CctvCameraForm";
import { CctvCameraList } from "@/components/CctvCameraList";
import { Button } from "@/components/ui/button";
import {
  CctvCameraEntry,
  CctvCameraInput,
  useCatalog,
  useCctvCameras,
  useCreateCctvCamera,
  useDeleteCctvCamera,
  useUpdateCctvCamera,
} from "@/lib/api";

export default function ProyectoCctvPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: tipos, isError: tiposError } = useCatalog("cctv_tipo");
  const { data: estados, isError: estadosError } = useCatalog("cctv_estado");
  const { data: energias, isError: energiasError } = useCatalog("cctv_energia");
  const { data: conectividades, isError: conectividadesError } = useCatalog("cctv_conectividad");
  const { data: grabaciones, isError: grabacionesError } = useCatalog("cctv_grabacion");
  const { data: criticidades, isError: criticidadesError } = useCatalog("cctv_criticidad");

  const { data: entries, isError: entriesError } = useCctvCameras(projectId);
  const createCctvCamera = useCreateCctvCamera(projectId);
  const updateCctvCamera = useUpdateCctvCamera(projectId);
  const deleteCctvCamera = useDeleteCctvCamera(projectId);

  const [editing, setEditing] = useState<CctvCameraEntry | "new" | null>(null);

  async function handleSubmit(input: CctvCameraInput) {
    if (editing && editing !== "new") {
      await updateCctvCamera.mutateAsync({ id: editing.id, input });
    } else {
      await createCctvCamera.mutateAsync(input);
    }
    setEditing(null);
  }

  async function handleDelete(entry: CctvCameraEntry) {
    await deleteCctvCamera.mutateAsync(entry.id);
  }

  const anyCatalogError =
    tiposError ||
    estadosError ||
    energiasError ||
    conectividadesError ||
    grabacionesError ||
    criticidadesError;

  const catalogsReady =
    tipos && estados && energias && conectividades && grabaciones && criticidades;

  return (
    <div className="flex flex-col gap-4">
      {anyCatalogError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar alguno de los catalogos de CCTV.
        </p>
      )}

      {editing && catalogsReady ? (
        <CctvCameraForm
          catalogs={{
            tipos: tipos ?? [],
            estados: estados ?? [],
            energias: energias ?? [],
            conectividades: conectividades ?? [],
            grabaciones: grabaciones ?? [],
            criticidades: criticidades ?? [],
          }}
          initial={editing !== "new" ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")} className="w-full sm:w-auto">
          Nueva cámara
        </Button>
      )}

      {entries === undefined ? (
        !entriesError && <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <CctvCameraList entries={entries} onEdit={setEditing} onDelete={handleDelete} />
      )}

      {entriesError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar la lista de cámaras.
        </p>
      )}
    </div>
  );
}
