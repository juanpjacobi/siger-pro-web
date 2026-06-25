"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/ProjectForm";
import { ApiError, Project, ProjectInput, api } from "@/lib/api";

export default function EditarProyectoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tipos, setTipos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.projects.get(projectId).then(setProject).catch(() => setError("No se pudo cargar el proyecto."));
    api.catalogs
      .get("proyecto_tipo")
      .then(setTipos)
      .catch(() => setError("No se pudo cargar el catalogo de tipos de objetivo."));
  }, [projectId]);

  async function handleSubmit(input: ProjectInput) {
    try {
      await api.projects.update(projectId, input);
      router.push(`/proyectos/${projectId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo actualizar el proyecto.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Editar proyecto</h1>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {project ? (
        <ProjectForm
          tipos={tipos}
          initial={project}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/proyectos/${projectId}`)}
        />
      ) : (
        !error && <p className="text-sm text-muted-foreground">Cargando...</p>
      )}
    </div>
  );
}
