"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/ProjectForm";
import { ApiError, ProjectInput, api } from "@/lib/api";

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [tipos, setTipos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.catalogs
      .get("proyecto_tipo")
      .then(setTipos)
      .catch(() => setError("No se pudo cargar el catalogo de tipos de objetivo."));
  }, []);

  async function handleSubmit(input: ProjectInput) {
    try {
      const project = await api.projects.create(input);
      router.push(`/proyectos/${project.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear el proyecto.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Nuevo proyecto</h1>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <ProjectForm tipos={tipos} onSubmit={handleSubmit} onCancel={() => router.push("/proyectos")} />
    </div>
  );
}
