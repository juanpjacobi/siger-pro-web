import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface CctvCameraEntry {
  id: string;
  projectId: string;
  camId: string;
  nombre: string | null;
  sector: string | null;
  ubicacion: string | null;
  tipo: string | null;
  marca: string | null;
  resolucion: string | null;
  alcance: number | null;
  nocturna: boolean;
  ir: boolean;
  cruceLinea: boolean;
  intrusion: boolean;
  merodeo: boolean;
  movimiento: boolean;
  facial: boolean;
  patente: boolean;
  estado: string | null;
  suciedad: boolean;
  desenfoque: boolean;
  obstruccion: boolean;
  antivandalica: boolean;
  energia: string | null;
  conectividad: string | null;
  grabacion: string | null;
  retencion: number | null;
  alerta: boolean;
  obsCCTV: string | null;
  criticidad: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CctvCameraInput {
  camId: string;
  nombre?: string;
  sector?: string;
  ubicacion?: string;
  tipo?: string;
  marca?: string;
  resolucion?: string;
  alcance?: number;
  nocturna?: boolean;
  ir?: boolean;
  cruceLinea?: boolean;
  intrusion?: boolean;
  merodeo?: boolean;
  movimiento?: boolean;
  facial?: boolean;
  patente?: boolean;
  estado?: string;
  suciedad?: boolean;
  desenfoque?: boolean;
  obstruccion?: boolean;
  antivandalica?: boolean;
  energia?: string;
  conectividad?: string;
  grabacion?: string;
  retencion?: number;
  alerta?: boolean;
  obsCCTV?: string;
  criticidad?: string;
}

export const cctvApi = {
  list: (projectId: string) =>
    request<CctvCameraEntry[]>(`/projects/${projectId}/cctv`),
  create: (projectId: string, input: CctvCameraInput) =>
    request<CctvCameraEntry>(`/projects/${projectId}/cctv`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (projectId: string, id: string, input: Partial<CctvCameraInput>) =>
    request<CctvCameraEntry>(`/projects/${projectId}/cctv/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/cctv/${id}`, { method: "DELETE" }),
};

const cctvKey = (projectId: string) => ["cctv", projectId] as const;

export function useCctvCameras(projectId: string) {
  return useQuery({
    queryKey: cctvKey(projectId),
    queryFn: () => cctvApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateCctvCamera(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CctvCameraInput) => cctvApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cctvKey(projectId) }),
  });
}

export function useUpdateCctvCamera(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CctvCameraInput> }) =>
      cctvApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cctvKey(projectId) }),
  });
}

export function useDeleteCctvCamera(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cctvApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cctvKey(projectId) }),
  });
}
