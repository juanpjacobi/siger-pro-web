# SIGER-PRO — Frontend (Next.js)

Frontend de SIGER-PRO, plataforma de evaluación de riesgo de seguridad física. Consume la API de `siger-pro-api` (repo backend separado).

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4, mobile-first
- Jest + React Testing Library para tests de componente

## Desarrollo

```bash
npm install
cp .env.local.example .env.local   # ajustar NEXT_PUBLIC_API_URL si la API no corre en localhost:3333
npm run dev                        # http://localhost:3000
```

La API (`siger-pro-api`) debe estar corriendo aparte (`npm run start:dev` en ese repo) para que las pantallas tengan datos.

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
  app/                rutas (App Router)
  components/          componentes de UI + sus tests (__tests__/)
  lib/api.ts           cliente tipado de la API del backend
specs/                  specs de cada módulo de UI, una por módulo migrado
```

## Convención de módulos

Cada módulo de negocio se construye en paralelo con su contraparte de backend (ver `siger-pro-api/specs/MODULES_CHECKLIST.md`). El spec de cada módulo de UI vive en `specs/<modulo>-ui.md` y referencia el contrato de API del spec equivalente del backend.
