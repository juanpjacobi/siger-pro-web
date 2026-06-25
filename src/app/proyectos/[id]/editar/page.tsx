"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { ApiError, ProjectInput, useCatalog, useProject, useUpdateProject } from "@/lib/api";

export default function EditarProyectoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const { data: project, isError: projectError } = useProject(projectId);
  const { data: tipos, isError: catalogError } = useCatalog("proyecto_tipo");
  const updateProject = useUpdateProject(projectId);

  async function handleSubmit(input: ProjectInput) {
    await updateProject.mutateAsync(input);
    router.push(`/proyectos/${projectId}`);
  }

  const error = projectError
    ? "No se pudo cargar el proyecto."
    : catalogError
      ? "No se pudo cargar el catalogo de tipos de objetivo."
      : updateProject.isError
        ? updateProject.error instanceof ApiError
          ? updateProject.error.message
          : "No se pudo actualizar el proyecto."
        : null;

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
          tipos={tipos ?? []}
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
