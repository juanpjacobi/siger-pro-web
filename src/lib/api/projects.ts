import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface Project {
  id: string;
  nombre: string;
  cliente: string | null;
  tipo: string | null;
  ubicacion: string | null;
  fecha: string | null;
  profesional: string | null;
  empresa: string | null;
  responsable: string | null;
  superficie: string | null;
  perimetro: string | null;
  lotes: number | null;
  habitantes: number | null;
  accesos: number | null;
  alcance: string | null;
  exclusiones: string | null;
  normativa: string | null;
  criterioAceptacion: string | null;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  nombre: string;
  cliente?: string;
  tipo?: string;
  ubicacion?: string;
  fecha?: string;
  profesional?: string;
  empresa?: string;
  responsable?: string;
  superficie?: number;
  perimetro?: number;
  lotes?: number;
  habitantes?: number;
  accesos?: number;
  alcance?: string;
  exclusiones?: string;
  normativa?: string;
  criterioAceptacion?: string;
  obs?: string;
}

export const projectsApi = {
  list: () => request<Project[]>("/projects"),
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (input: ProjectInput) => request<Project>("/projects", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: Partial<ProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
};

const projectsKey = ["projects"] as const;
const projectKey = (id: string) => ["projects", id] as const;

export function useProjects() {
  return useQuery({ queryKey: projectsKey, queryFn: projectsApi.list });
}

export function useProject(id: string) {
  return useQuery({ queryKey: projectKey(id), queryFn: () => projectsApi.get(id), enabled: !!id });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKey }),
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProjectInput>) => projectsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey });
      queryClient.invalidateQueries({ queryKey: projectKey(id) });
    },
  });
}
