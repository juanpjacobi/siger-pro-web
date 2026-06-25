import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "./client";

export type AdversaryTimeState = "favorable" | "ajustado" | "limite" | "desfavorable" | "critico";

export interface AdversaryTimeEntry {
  id: string;
  projectId: string;
  amenaza: string;
  ti: number;
  te: number;
  td: number;
  tr: number;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
  ta: number;
  ts: number;
  delta: number;
  res: string;
  estado: AdversaryTimeState;
  fav: boolean;
  msg: string;
  recomendaciones: string[];
}

export interface AdversaryTimeInput {
  amenaza: string;
  ti: number;
  te: number;
  td: number;
  tr: number;
  obs?: string;
}

export const adversaryTimeApi = {
  list: (projectId: string) => request<AdversaryTimeEntry[]>(`/projects/${projectId}/adversary-time`),
  create: (projectId: string, input: AdversaryTimeInput) =>
    request<AdversaryTimeEntry>(`/projects/${projectId}/adversary-time`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (projectId: string, id: string, input: Partial<AdversaryTimeInput>) =>
    request<AdversaryTimeEntry>(`/projects/${projectId}/adversary-time/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (projectId: string, id: string) =>
    request<void>(`/projects/${projectId}/adversary-time/${id}`, { method: "DELETE" }),
};

const adversaryTimeKey = (projectId: string) => ["adversary-time", projectId] as const;

export function useAdversaryTimeEntries(projectId: string) {
  return useQuery({
    queryKey: adversaryTimeKey(projectId),
    queryFn: () => adversaryTimeApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAdversaryTimeEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdversaryTimeInput) => adversaryTimeApi.create(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adversaryTimeKey(projectId) }),
  });
}

export function useUpdateAdversaryTimeEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AdversaryTimeInput> }) =>
      adversaryTimeApi.update(projectId, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adversaryTimeKey(projectId) }),
  });
}

export function useDeleteAdversaryTimeEntry(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adversaryTimeApi.remove(projectId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adversaryTimeKey(projectId) }),
  });
}
