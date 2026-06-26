import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface PerimeterSectorEntry {
  id: string;
  projectId: string;
  sector: string;
  longitud: number | null;
  cerramiento: string | null;
  altura: number | null;
  estado: string | null;
  escalabilidad: string | null;
  continuidad: string | null;
  vegetacion: string | null;
  visibilidad: string | null;
  iluminacion: string | null;
  camaras: string | null;
  sensores: string | null;
  cercoElec: boolean;
  concertina: boolean;
  sendero: boolean;
  rondines: string | null;
  vulns: string | null;
  obsPer: string | null;
  criticidad: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerimeterSectorInput {
  sector: string;
  longitud?: number;
  cerramiento?: string;
  altura?: number;
  estado?: string;
  escalabilidad?: string;
  continuidad?: string;
  vegetacion?: string;
  visibilidad?: string;
  iluminacion?: string;
  camaras?: string;
  sensores?: string;
  cercoElec?: boolean;
  concertina?: boolean;
  sendero?: boolean;
  rondines?: string;
  vulns?: string;
  obsPer?: string;
  criticidad?: string;
}

export const perimeterApi = {
  list: (projectId: string) => request<PerimeterSectorEntry[]>(`/projects/${projectId}/perimetro`),
  create: (projectId: string, input: PerimeterSectorInput) =>
    request<PerimeterSectorEntry>(`/projects/${projectId}/perimetro`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (projectId: string, id: string, input: Partial<PerimeterSectorInput>) =>
    request<PerimeterSectorEntry>(`/projects/${projectId}/perimetro/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/perimetro/${id}`, { method: "DELETE" }),
};

const perimeterKey = (projectId: string) => ["perimetro", projectId] as const;

export function usePerimeterSectors(projectId: string) {
  return useQuery({
    queryKey: perimeterKey(projectId),
    queryFn: () => perimeterApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreatePerimeterSector(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PerimeterSectorInput) => perimeterApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: perimeterKey(projectId) }),
  });
}

export function useUpdatePerimeterSector(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PerimeterSectorInput> }) =>
      perimeterApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: perimeterKey(projectId) }),
  });
}

export function useDeletePerimeterSector(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => perimeterApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: perimeterKey(projectId) }),
  });
}
