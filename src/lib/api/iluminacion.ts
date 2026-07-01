import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface IlluminationEntry {
  id: string;
  projectId: string;
  sector: string;
  tipo: string | null;
  alimentacion: string | null;
  potencia: number | null;
  estado: string | null;
  cobertura: string | null;
  oscuras: string | null;
  fotocelula: boolean;
  timer: boolean;
  cctv: string | null;
  perimetro: string | null;
  recomendacion: string | null;
  criticidad: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IlluminationInput {
  sector: string;
  tipo?: string;
  alimentacion?: string;
  potencia?: number;
  estado?: string;
  cobertura?: string;
  oscuras?: string;
  fotocelula?: boolean;
  timer?: boolean;
  cctv?: string;
  perimetro?: string;
  recomendacion?: string;
  criticidad?: string;
}

export const iluminacionApi = {
  list: (projectId: string) =>
    request<IlluminationEntry[]>(`/projects/${projectId}/iluminacion`),
  create: (projectId: string, input: IlluminationInput) =>
    request<IlluminationEntry>(`/projects/${projectId}/iluminacion`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (projectId: string, id: string, input: Partial<IlluminationInput>) =>
    request<IlluminationEntry>(`/projects/${projectId}/iluminacion/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/iluminacion/${id}`, { method: "DELETE" }),
};

const iluminacionKey = (projectId: string) => ["iluminacion", projectId] as const;

export function useIlluminationSectors(projectId: string) {
  return useQuery({
    queryKey: iluminacionKey(projectId),
    queryFn: () => iluminacionApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateIlluminationSector(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IlluminationInput) => iluminacionApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: iluminacionKey(projectId) }),
  });
}

export function useUpdateIlluminationSector(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<IlluminationInput> }) =>
      iluminacionApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: iluminacionKey(projectId) }),
  });
}

export function useDeleteIlluminationSector(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => iluminacionApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: iluminacionKey(projectId) }),
  });
}
