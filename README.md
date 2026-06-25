# SIGER-PRO — Frontend (Next.js)

Frontend de SIGER-PRO, plataforma de evaluación de riesgo de seguridad física. Consume la API de `siger-pro-api` (repo backend separado).

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4, mobile-first
- TanStack Query para data-fetching (cache, loading/error, invalidación tras mutar) — ver `src/lib/api/`
- Jest + React Testing Library para tests de componente

## Desarrollo

```bash
npm install
cp .env.local.example .env.local   # ajustar NEXT_PUBLIC_API_URL si la API no corre en localhost:3333
npm run dev                        # http://localhost:3001
```

La API (`siger-pro-api`) debe estar corriendo aparte (`npm run start:dev` en ese repo, puerto 3333) para que las pantallas tengan datos.

> Puerto 3001 y no el 3000 por defecto de Next: en esta PC el puerto 3000 lo ocupa un servicio de Windows (`FlexxusLocalLicenseServer`), que pisa al servidor de Next y deja la página en blanco si se usa ese puerto.

## Tests

```bash
npm run test          # una corrida
npm run test:watch    # modo watch
```

## Build

```bash
npm run build
```

## Estructura

```
src/
  app/                  rutas (App Router)
  components/           componentes de UI + sus tests (__tests__/)
  lib/api/              un archivo por feature (projects.ts, mosler.ts...): tipos + cliente + hooks de TanStack Query
  lib/query-provider.tsx  QueryClientProvider, montado en app/layout.tsx
specs/                  specs de cada módulo de UI, una por módulo migrado
```

## Convención de módulos

Cada módulo de negocio se construye en paralelo con su contraparte de backend (ver `siger-pro-api/specs/MODULES_CHECKLIST.md`). El spec de cada módulo de UI vive en `specs/<modulo>-ui.md`, se escribe **antes** del código (estado `propuesto`) y referencia el contrato de API del spec equivalente del backend.

## Flujo spec-driven + TDD (agentes)

Igual que el backend, este repo tiene su propio ciclo spec → TDD → review en `.claude/agents/` (`spec-writer-ui`, `developer-ui`, `reviewer-ui`) orquestado por el skill `/feature-ui <modulo>`. Requiere que el módulo ya esté aprobado del lado del backend (`BE [x]` en el checklist).
