import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface MethodologyEntry {
  id: string;
  projectId: string;
  enfoque: string;
  activo: boolean;
  descripcion: string | null;
  aplicacion: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MethodologyInput {
  enfoque: string;
  activo?: boolean;
  descripcion?: string;
  aplicacion?: string;
  observaciones?: string;
}

export const methodologyApi = {
  list: (projectId: string) => request<MethodologyEntry[]>(`/projects/${projectId}/metodologia`),
  create: (projectId: string, input: MethodologyInput) =>
    request<MethodologyEntry>(`/projects/${projectId}/metodologia`, { method: "POST", body: JSON.stringify(input) }),
  update: (projectId: string, id: string, input: Partial<MethodologyInput>) =>
    request<MethodologyEntry>(`/projects/${projectId}/metodologia/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/metodologia/${id}`, { method: "DELETE" }),
};

const methodologyKey = (projectId: string) => ["metodologia", projectId] as const;

export function useMethodologyEntries(projectId: string) {
  return useQuery({
    queryKey: methodologyKey(projectId),
    queryFn: () => methodologyApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateMethodologyEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MethodologyInput) => methodologyApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: methodologyKey(projectId) }),
  });
}

export function useUpdateMethodologyEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MethodologyInput> }) =>
      methodologyApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: methodologyKey(projectId) }),
  });
}

export function useDeleteMethodologyEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => methodologyApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: methodologyKey(projectId) }),
  });
}
