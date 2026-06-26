"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useProject } from "@/lib/api";

export default function ProyectoLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const pathname = usePathname();
  const { data: project, isError } = useProject(projectId);
  const isEditing = pathname?.endsWith("/editar");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {isError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo cargar el proyecto.
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
          {!isEditing && (
            <Button variant="outline" render={<Link href={`/proyectos/${projectId}/editar`} />} nativeButton={false}>
              <Pencil className="size-4" />
              Editar
            </Button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
