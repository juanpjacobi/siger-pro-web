import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface AssetEntry {
  id: string;
  projectId: string;
  nombre: string;
  tipo: string | null;
  ubicacion: string | null;
  valorCualitativo: string | null;
  valorEconomico: number | null;
  exposicion: string | null;
  amenazas: string | null;
  vulnerabilidades: string | null;
  controles: string | null;
  impacto: string | null;
  prioridad: string | null;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetInput {
  nombre: string;
  tipo?: string;
  ubicacion?: string;
  valorCualitativo?: string;
  valorEconomico?: number;
  exposicion?: string;
  amenazas?: string;
  vulnerabilidades?: string;
  controles?: string;
  impacto?: string;
  prioridad?: string;
  obs?: string;
}

export const assetsApi = {
  list: (projectId: string) => request<AssetEntry[]>(`/projects/${projectId}/activos`),
  create: (projectId: string, input: AssetInput) =>
    request<AssetEntry>(`/projects/${projectId}/activos`, { method: "POST", body: JSON.stringify(input) }),
  update: (projectId: string, id: string, input: Partial<AssetInput>) =>
    request<AssetEntry>(`/projects/${projectId}/activos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/activos/${id}`, { method: "DELETE" }),
};

const assetsKey = (projectId: string) => ["activos", projectId] as const;

export function useAssets(projectId: string) {
  return useQuery({
    queryKey: assetsKey(projectId),
    queryFn: () => assetsApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAsset(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssetInput) => assetsApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetsKey(projectId) }),
  });
}

export function useUpdateAsset(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AssetInput> }) =>
      assetsApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetsKey(projectId) }),
  });
}

export function useDeleteAsset(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetsKey(projectId) }),
  });
}
