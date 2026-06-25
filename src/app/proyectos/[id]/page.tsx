"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AdversaryTimeForm } from "@/components/AdversaryTimeForm";
import { AdversaryTimeList } from "@/components/AdversaryTimeList";
import { MoslerForm } from "@/components/MoslerForm";
import { MoslerList } from "@/components/MoslerList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdversaryTimeEntry,
  AdversaryTimeInput,
  MoslerEntry,
  MoslerInput,
  useAdversaryTimeEntries,
  useCatalog,
  useCreateAdversaryTimeEntry,
  useCreateMoslerEntry,
  useDeleteAdversaryTimeEntry,
  useDeleteMoslerEntry,
  useMoslerEntries,
  useProject,
  useUpdateAdversaryTimeEntry,
  useUpdateMoslerEntry,
} from "@/lib/api";

export default function ProyectoDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: project, isError: projectError } = useProject(projectId);
  const { data: amenazas, isError: amenazasError } = useCatalog("mosler_amenaza");
  const { data: tiposMedida, isError: tiposMedidaError } = useCatalog("mosler_tipoMedida");
  const { data: residuales, isError: residualesError } = useCatalog("mosler_residual");
  const { data: estadosMedida, isError: estadosMedidaError } = useCatalog("mosler_estadoMedida");
  const catalogs =
    amenazas && tiposMedida && residuales && estadosMedida
      ? { amenazas, tiposMedida, residuales, estadosMedida }
      : null;

  const { data: moslerEntries, isError: moslerError } = useMoslerEntries(projectId);
  const createMosler = useCreateMoslerEntry(projectId);
  const updateMosler = useUpdateMoslerEntry(projectId);
  const deleteMosler = useDeleteMoslerEntry(projectId);

  const { data: adversaryEntries, isError: adversaryError } = useAdversaryTimeEntries(projectId);
  const createAdversaryTime = useCreateAdversaryTimeEntry(projectId);
  const updateAdversaryTime = useUpdateAdversaryTimeEntry(projectId);
  const deleteAdversaryTime = useDeleteAdversaryTimeEntry(projectId);

  const [editingMosler, setEditingMosler] = useState<MoslerEntry | "new" | null>(null);
  const [editingTime, setEditingTime] = useState<AdversaryTimeEntry | "new" | null>(null);

  const error =
    projectError || amenazasError || tiposMedidaError || residualesError || estadosMedidaError
      ? "No se pudo cargar el proyecto o sus catalogos."
      : null;

  async function handleMoslerSubmit(input: MoslerInput) {
    if (editingMosler && editingMosler !== "new") {
      await updateMosler.mutateAsync({ id: editingMosler.id, input });
    } else {
      await createMosler.mutateAsync(input);
    }
    setEditingMosler(null);
  }

  async function handleMoslerDelete(entry: MoslerEntry) {
    await deleteMosler.mutateAsync(entry.id);
  }

  async function handleTimeSubmit(input: AdversaryTimeInput) {
    if (editingTime && editingTime !== "new") {
      await updateAdversaryTime.mutateAsync({ id: editingTime.id, input });
    } else {
      await createAdversaryTime.mutateAsync(input);
    }
    setEditingTime(null);
  }

  async function handleTimeDelete(entry: AdversaryTimeEntry) {
    await deleteAdversaryTime.mutateAsync(entry.id);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {project && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {[project.cliente, project.tipo, project.ubicacion].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Button
            variant="outline"
            render={<Link href={`/proyectos/${projectId}/editar`} />}
            nativeButton={false}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
        </div>
      )}

      <Tabs defaultValue="mosler">
        <TabsList>
          <TabsTrigger value="mosler">Matriz Mosler</TabsTrigger>
          <TabsTrigger value="tiempos">Tiempos Adversario</TabsTrigger>
        </TabsList>

        <TabsContent value="mosler" className="flex flex-col gap-4">
          {editingMosler && catalogs ? (
            <MoslerForm
              catalogs={catalogs}
              initial={editingMosler !== "new" ? editingMosler : undefined}
              onSubmit={handleMoslerSubmit}
              onCancel={() => setEditingMosler(null)}
            />
          ) : (
            <Button onClick={() => setEditingMosler("new")} className="w-full sm:w-auto">
              Nueva entrada Mosler
            </Button>
          )}

          {moslerEntries === undefined ? (
            !moslerError && <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <MoslerList entries={moslerEntries} onEdit={setEditingMosler} onDelete={handleMoslerDelete} />
          )}
        </TabsContent>

        <TabsContent value="tiempos" className="flex flex-col gap-4">
          {editingTime && catalogs ? (
            <AdversaryTimeForm
              catalogs={{ amenazas: catalogs.amenazas }}
              initial={editingTime !== "new" ? editingTime : undefined}
              onSubmit={handleTimeSubmit}
              onCancel={() => setEditingTime(null)}
            />
          ) : (
            <Button onClick={() => setEditingTime("new")} className="w-full sm:w-auto">
              Nuevo escenario de tiempos
            </Button>
          )}

          {adversaryEntries === undefined ? (
            !adversaryError && <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <AdversaryTimeList entries={adversaryEntries} onEdit={setEditingTime} onDelete={handleTimeDelete} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
