"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  api,
} from "@/lib/api";

interface Catalogs {
  amenazas: string[];
  tiposMedida: string[];
  residuales: string[];
  estadosMedida: string[];
}

export default function ProyectoDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [moslerEntries, setMoslerEntries] = useState<MoslerEntry[] | null>(null);
  const [adversaryEntries, setAdversaryEntries] = useState<AdversaryTimeEntry[] | null>(null);
  const [editingMosler, setEditingMosler] = useState<MoslerEntry | "new" | null>(null);
  const [editingTime, setEditingTime] = useState<AdversaryTimeEntry | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.catalogs.get("mosler_amenaza"),
      api.catalogs.get("mosler_tipoMedida"),
      api.catalogs.get("mosler_residual"),
      api.catalogs.get("mosler_estadoMedida"),
    ])
      .then(([amenazas, tiposMedida, residuales, estadosMedida]) =>
        setCatalogs({ amenazas, tiposMedida, residuales, estadosMedida }),
      )
      .catch(() => setError("No se pudieron cargar los catalogos."));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    api.mosler.list(projectId).then(setMoslerEntries).catch(() => setError("No se pudo cargar la matriz Mosler."));
    api.adversaryTime
      .list(projectId)
      .then(setAdversaryEntries)
      .catch(() => setError("No se pudieron cargar los tiempos adversario."));
  }, [projectId]);

  async function handleMoslerSubmit(input: MoslerInput) {
    if (editingMosler && editingMosler !== "new") {
      const updated = await api.mosler.update(projectId, editingMosler.id, input);
      setMoslerEntries((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? null);
    } else {
      const created = await api.mosler.create(projectId, input);
      setMoslerEntries((prev) => [...(prev ?? []), created]);
    }
    setEditingMosler(null);
  }

  async function handleMoslerDelete(entry: MoslerEntry) {
    await api.mosler.remove(projectId, entry.id);
    setMoslerEntries((prev) => prev?.filter((e) => e.id !== entry.id) ?? null);
  }

  async function handleTimeSubmit(input: AdversaryTimeInput) {
    if (editingTime && editingTime !== "new") {
      const updated = await api.adversaryTime.update(projectId, editingTime.id, input);
      setAdversaryEntries((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? null);
    } else {
      const created = await api.adversaryTime.create(projectId, input);
      setAdversaryEntries((prev) => [...(prev ?? []), created]);
    }
    setEditingTime(null);
  }

  async function handleTimeDelete(entry: AdversaryTimeEntry) {
    await api.adversaryTime.remove(projectId, entry.id);
    setAdversaryEntries((prev) => prev?.filter((e) => e.id !== entry.id) ?? null);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
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

          {moslerEntries === null ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
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

          {adversaryEntries === null ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <AdversaryTimeList entries={adversaryEntries} onEdit={setEditingTime} onDelete={handleTimeDelete} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
