import { useQuery } from "@tanstack/react-query";
import { request } from "./client";

export const catalogsApi = {
  get: (key: string) => request<string[]>(`/catalogs/${key}`),
};

export function useCatalog(key: string) {
  return useQuery({ queryKey: ["catalogs", key], queryFn: () => catalogsApi.get(key) });
}
