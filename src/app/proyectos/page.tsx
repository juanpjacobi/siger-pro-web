"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Proyectos</h1>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cliente">Cliente</Label>
              <Input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <Button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? "Creando..." : "Crear proyecto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {projects === null && <p className="text-sm text-muted-foreground">Cargando proyectos...</p>}

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
