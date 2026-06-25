"use client";

import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, Project, api } from "@/lib/api";

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.projects
      .list()
      .then(setProjects)
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "No se pudo cargar la lista de proyectos."));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Button render={<Link href="/proyectos/nuevo" />} nativeButton={false}>
          <Plus className="size-4" />
          Nuevo
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {projects === null && !error && <p className="text-sm text-muted-foreground">Cargando proyectos...</p>}

      {projects && projects.length === 0 && (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Todavia no hay proyectos. Crear el primero.
        </p>
      )}

      {projects && projects.length > 0 && (
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/proyectos/${project.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium leading-none">{project.nombre}</p>
                    {project.cliente && (
                      <p className="mt-1 text-sm text-muted-foreground">{project.cliente}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
