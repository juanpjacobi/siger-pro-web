import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export interface AccessPointEntry {
  id: string;
  projectId: string;
  nombre: string;
  tipo: string | null;
  carriles: number | null;
  uso: string | null;
  barreras: boolean;
  portones: boolean;
  molinetes: boolean;
  biometria: boolean;
  rfid: boolean;
  qr: boolean;
  app: boolean;
  validManual: boolean;
  registroNube: boolean;
  protoVisitas: string | null;
  protoProv: string | null;
  ctrlPeatonal: string | null;
  ctrlVehicular: string | null;
  camaras: string | null;
  lpr: boolean;
  ups: boolean;
  generador: boolean;
  congestion: string | null;
  trazabilidad: string | null;
  vulns: string | null;
  riesgo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessPointInput {
  nombre: string;
  tipo?: string;
  carriles?: number;
  uso?: string;
  barreras?: boolean;
  portones?: boolean;
  molinetes?: boolean;
  biometria?: boolean;
  rfid?: boolean;
  qr?: boolean;
  app?: boolean;
  validManual?: boolean;
  registroNube?: boolean;
  protoVisitas?: string;
  protoProv?: string;
  ctrlPeatonal?: string;
  ctrlVehicular?: string;
  camaras?: string;
  lpr?: boolean;
  ups?: boolean;
  generador?: boolean;
  congestion?: string;
  trazabilidad?: string;
  vulns?: string;
  riesgo?: string;
}

export const accesosApi = {
  list: (projectId: string) =>
    request<AccessPointEntry[]>(`/projects/${projectId}/accesos`),
  create: (projectId: string, input: AccessPointInput) =>
    request<AccessPointEntry>(`/projects/${projectId}/accesos`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (projectId: string, id: string, input: Partial<AccessPointInput>) =>
    request<AccessPointEntry>(`/projects/${projectId}/accesos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/accesos/${id}`, { method: "DELETE" }),
};

const accesosKey = (projectId: string) => ["accesos", projectId] as const;

export function useAccessPoints(projectId: string) {
  return useQuery({
    queryKey: accesosKey(projectId),
    queryFn: () => accesosApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAccessPoint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AccessPointInput) => accesosApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accesosKey(projectId) }),
  });
}

export function useUpdateAccessPoint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AccessPointInput> }) =>
      accesosApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accesosKey(projectId) }),
  });
}

export function useDeleteAccessPoint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accesosApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accesosKey(projectId) }),
  });
}
