"use client";

import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { ApiError, ProjectInput, useCatalog, useCreateProject } from "@/lib/api";

export default function NuevoProyectoPage() {
  const router = useRouter();
  const { data: tipos, error: catalogError } = useCatalog("proyecto_tipo");
  const createProject = useCreateProject();

  async function handleSubmit(input: ProjectInput) {
    const project = await createProject.mutateAsync(input);
    router.push(`/proyectos/${project.id}`);
  }

  const error = catalogError
    ? "No se pudo cargar el catalogo de tipos de objetivo."
    : createProject.isError
      ? createProject.error instanceof ApiError
        ? createProject.error.message
        : "No se pudo crear el proyecto."
      : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Nuevo proyecto</h1>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <ProjectForm tipos={tipos ?? []} onSubmit={handleSubmit} onCancel={() => router.push("/proyectos")} />
    </div>
  );
}
