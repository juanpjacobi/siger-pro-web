import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export type RiskLevel = "Bajo" | "Medio" | "Alto" | "Critico";
export type RiskColor = "bajo" | "medio" | "alto" | "critico";

export interface MoslerEntry {
  id: string;
  projectId: string;
  amenaza: string;
  amenazaOtra: string | null;
  sector: string | null;
  bien: string | null;
  dano: string | null;
  controles: string | null;
  f: number;
  s: number;
  p: number;
  e: number;
  a: number;
  v: number;
  medidas: string | null;
  tipoMedida: string | null;
  costo: number | null;
  responsable: string | null;
  plazo: string | null;
  residual: string | null;
  estadoMedida: string | null;
  createdAt: string;
  updatedAt: string;
  imp: number;
  dan: number;
  car: number;
  prob: number;
  ev: number;
  nivel: RiskLevel;
  color: RiskColor;
}

export interface MoslerInput {
  amenaza: string;
  amenazaOtra?: string;
  sector?: string;
  bien?: string;
  dano?: string;
  controles?: string;
  F: number;
  S: number;
  P: number;
  E: number;
  A: number;
  V: number;
  medidas?: string;
  tipoMedida?: string;
  costo?: number;
  responsable?: string;
  plazo?: string;
  residual?: string;
  estadoMedida?: string;
}

export const moslerApi = {
  list: (projectId: string) => request<MoslerEntry[]>(`/projects/${projectId}/mosler`),
  create: (projectId: string, input: MoslerInput) =>
    request<MoslerEntry>(`/projects/${projectId}/mosler`, { method: "POST", body: JSON.stringify(input) }),
  update: (projectId: string, id: string, input: Partial<MoslerInput>) =>
    request<MoslerEntry>(`/projects/${projectId}/mosler/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/mosler/${id}`, { method: "DELETE" }),
};

const moslerKey = (projectId: string) => ["mosler", projectId] as const;

export function useMoslerEntries(projectId: string) {
  return useQuery({ queryKey: moslerKey(projectId), queryFn: () => moslerApi.list(projectId), enabled: !!projectId });
}

export function useCreateMoslerEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MoslerInput) => moslerApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moslerKey(projectId) }),
  });
}

export function useUpdateMoslerEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MoslerInput> }) =>
      moslerApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moslerKey(projectId) }),
  });
}

export function useDeleteMoslerEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moslerApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moslerKey(projectId) }),
  });
}
