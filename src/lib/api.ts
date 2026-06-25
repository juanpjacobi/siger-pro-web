const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

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

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.message ?? `Error ${res.status} al llamar ${path}`;
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  projects: {
    list: () => request<Project[]>("/projects"),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (input: ProjectInput) => request<Project>("/projects", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Partial<ProjectInput>) =>
      request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  },
  mosler: {
    list: (projectId: string) => request<MoslerEntry[]>(`/projects/${projectId}/mosler`),
    create: (projectId: string, input: MoslerInput) =>
      request<MoslerEntry>(`/projects/${projectId}/mosler`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (projectId: string, id: string, input: Partial<MoslerInput>) =>
      request<MoslerEntry>(`/projects/${projectId}/mosler/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    remove: (projectId: string, id: string) =>
      request<void>(`/projects/${projectId}/mosler/${id}`, { method: "DELETE" }),
  },
  adversaryTime: {
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
  },
  catalogs: {
    get: (key: string) => request<string[]>(`/catalogs/${key}`),
  },
};
