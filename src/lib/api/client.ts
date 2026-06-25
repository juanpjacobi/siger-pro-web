const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
