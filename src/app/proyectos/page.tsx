"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, Project, api } from "@/lib/api";

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [cliente, setCliente] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.projects
      .list()
      .then(setProjects)
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "No se pudo cargar la lista de proyectos."));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const project = await api.projects.create({ nombre, cliente: cliente || undefined });
      setProjects((prev) => [...(prev ?? []), project]);
      setNombre("");
      setCliente("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear el proyecto.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Proyectos</h1>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded border border-gray-200 p-4">
        <h2 className="font-semibold">Nuevo proyecto</h2>
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium">
            Nombre
          </label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium">
            Cliente
          </label>
          <input
            id="cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50 sm:w-auto"
        >
          {creating ? "Creando..." : "Crear proyecto"}
        </button>
      </form>

      {projects === null && <p className="text-sm text-gray-500">Cargando proyectos...</p>}

      {projects && projects.length === 0 && (
        <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Todavia no hay proyectos. Crear el primero.
        </p>
      )}

      {projects && projects.length > 0 && (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/proyectos/${project.id}`}
                className="block rounded border border-gray-200 p-4 hover:border-blue-400"
              >
                <p className="font-medium">{project.nombre}</p>
                {project.cliente && <p className="text-sm text-gray-500">{project.cliente}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
