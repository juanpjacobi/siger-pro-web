"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdversaryTimeForm } from "@/components/AdversaryTimeForm";
import { AdversaryTimeList } from "@/components/AdversaryTimeList";
import { MoslerForm } from "@/components/MoslerForm";
import { MoslerList } from "@/components/MoslerList";
import {
  AdversaryTimeEntry,
  AdversaryTimeInput,
  MoslerEntry,
  MoslerInput,
  api,
} from "@/lib/api";

type Tab = "mosler" | "tiempos";

interface Catalogs {
  amenazas: string[];
  tiposMedida: string[];
  residuales: string[];
  estadosMedida: string[];
}

export default function ProyectoDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [tab, setTab] = useState<Tab>("mosler");
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
    <main className="flex flex-col gap-6">
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("mosler")}
          className={`px-3 py-2 text-sm font-medium ${tab === "mosler" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Matriz Mosler
        </button>
        <button
          onClick={() => setTab("tiempos")}
          className={`px-3 py-2 text-sm font-medium ${tab === "tiempos" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Tiempos Adversario
        </button>
      </div>

      {tab === "mosler" && (
        <section className="flex flex-col gap-4">
          {editingMosler && catalogs ? (
            <MoslerForm
              catalogs={catalogs}
              initial={editingMosler !== "new" ? editingMosler : undefined}
              onSubmit={handleMoslerSubmit}
              onCancel={() => setEditingMosler(null)}
            />
          ) : (
            <button
              onClick={() => setEditingMosler("new")}
              className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white sm:w-auto"
            >
              Nueva entrada Mosler
            </button>
          )}

          {moslerEntries === null ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <MoslerList entries={moslerEntries} onEdit={setEditingMosler} onDelete={handleMoslerDelete} />
          )}
        </section>
      )}

      {tab === "tiempos" && (
        <section className="flex flex-col gap-4">
          {editingTime && catalogs ? (
            <AdversaryTimeForm
              catalogs={{ amenazas: catalogs.amenazas }}
              initial={editingTime !== "new" ? editingTime : undefined}
              onSubmit={handleTimeSubmit}
              onCancel={() => setEditingTime(null)}
            />
          ) : (
            <button
              onClick={() => setEditingTime("new")}
              className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white sm:w-auto"
            >
              Nuevo escenario de tiempos
            </button>
          )}

          {adversaryEntries === null ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <AdversaryTimeList entries={adversaryEntries} onEdit={setEditingTime} onDelete={handleTimeDelete} />
          )}
        </section>
      )}
    </main>
  );
}
