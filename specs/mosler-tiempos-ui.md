# Spec: UI de Matriz Mosler + Tiempos Adversario

Estado: implementado y aprobado (verificado: build + tests en verde + consumo real contra la API local).
Repo: `seguridad-web` (frontend). Contraparte de backend: `siger-pro-api` → `specs/mosler-tiempos.md`.

> Actualizado 2026-06-25: Mosler y Tiempos Adversario dejaron de ser `Tabs` dentro de `/proyectos/[id]` y pasaron a ser rutas propias (`/proyectos/[id]/mosler`, `/proyectos/[id]/tiempos`), como parte de la reestructuración de navegación que introdujo el concepto de "proyecto activo" en el sidebar (ver `proyectos-ui.md` §2). Cambio de arquitectura de navegación, no de lógica de negocio — fórmulas y contrato de API sin cambios.

## 1. Propósito

Primera pantalla de negocio del frontend. Permite, dentro de un proyecto, cargar y revisar las amenazas evaluadas con el método Mosler y los escenarios de Tiempos Adversario, viendo siempre el cálculo (nivel de riesgo / favorable-desfavorable) que ya hace el backend — la UI no calcula nada, solo muestra lo que devuelve la API.

## 2. Páginas y rutas (Next.js App Router)

| Ruta | Qué muestra |
|---|---|
| `/` | Redirige a `/proyectos` |
| `/proyectos` | Lista de proyectos + botón "Nuevo" |
| `/proyectos/[id]` | Resumen del proyecto: header + cards de acceso a sus módulos |
| `/proyectos/[id]/mosler` | Matriz Mosler de ese proyecto |
| `/proyectos/[id]/tiempos` | Tiempos Adversario de ese proyecto |

`/proyectos/[id]/layout.tsx` es compartido entre las tres últimas rutas: muestra el header del proyecto (nombre, cliente/tipo/ubicación, botón Editar) y una navegación secundaria (Resumen / Matriz Mosler / Tiempos Adversario) con estado activo según la ruta actual.

No hay rutas separadas por entrada individual (no `/proyectos/[id]/mosler/[entryId]`): alta/edición de una entrada se hace en un modal/panel dentro de la misma pantalla, para minimizar navegación en mobile.

## 3. Contrato de API consumido

Base URL configurable vía `NEXT_PUBLIC_API_URL` (default `http://localhost:3333`).

- `GET/POST /projects`
- `GET/POST/PATCH/DELETE /projects/:projectId/mosler` — body de creación: `{amenaza, amenazaOtra?, sector?, bien?, dano?, controles?, F, S, P, E, A, V, medidas?, tipoMedida?, costo?, responsable?, plazo?, residual?, estadoMedida?}`. La respuesta trae además `{imp, dan, car, prob, ev, nivel, color}` — estos campos **nunca se envían en el POST/PATCH**, son de solo lectura.
- `GET/POST/PATCH/DELETE /projects/:projectId/adversary-time` — body: `{amenaza, ti, te, td, tr, obs?}`. La respuesta trae además `{ta, ts, delta, res, estado, fav, msg, recomendaciones}`, también de solo lectura.
- `GET /catalogs/:key` → `string[]` para poblar selects: `mosler_amenaza`, `mosler_tipoMedida`, `mosler_residual`, `mosler_estadoMedida` (reutilizado también como `*_residual`/`*_estadoMedida` genérico).

Fuente exacta de cada contrato: `siger-pro-api/specs/mosler-tiempos.md` secciones 2 y 4 (copiado al repo backend en el momento de implementar esta UI, no se reinterpreta).

## 4. Mobile-first: criterio de layout

Tailwind CSS v4. Regla del proyecto: **toda clase responsive se escribe para mobile por defecto, y se agregan variantes `sm:`/`md:`/`lg:` solo para ensanchar, nunca al revés.**

- Listas de Mosler/Tiempos: en mobile son tarjetas apiladas (una entrada = una card con los datos clave y el badge de nivel/estado); a partir de `md:` pasan a tabla.
- Forms: un input por fila en mobile (`grid-cols-1`), 2 columnas a partir de `sm:` para los campos cortos (F/S/P/E/A/V).
- Botones de acción primarios (crear, guardar) ocupan el ancho completo en mobile (`w-full`), automáticos en desktop.
- Nada de hover-only para acciones críticas: editar/borrar siempre visibles como botones, no aparecen solo on-hover (no hay hover real en touch).

## 5. Componentes

```
src/
  lib/api/
    mosler.ts            tipos + cliente + hooks de TanStack Query
    adversary-time.ts     idem
  components/
    RiskBadge.tsx      badge de color segun nivel Mosler (Bajo/Medio/Alto/Critico)
    TimeStatusBadge.tsx badge de color segun estado de tiempos (favorable..critico)
    MoslerForm.tsx     form crear/editar entrada Mosler
    MoslerList.tsx     listado (card en mobile, tabla en md+)
    AdversaryTimeForm.tsx
    AdversaryTimeList.tsx
  app/
    proyectos/page.tsx
    proyectos/[id]/layout.tsx   header del proyecto + nav secundaria
    proyectos/[id]/page.tsx     resumen
    proyectos/[id]/mosler/page.tsx
    proyectos/[id]/tiempos/page.tsx
```

## 6. Estados a manejar en cada pantalla

- **Cargando**: skeleton/spinner simple, no pantalla en blanco.
- **Vacío**: mensaje + CTA ("Todavía no hay entradas Mosler. Cargar la primera.").
- **Error de red/API**: mensaje de error legible, no el stack/JSON crudo.
- **Validación de formulario**: errores inline por campo (F/S/P/E/A/V requeridos 1-5, amenaza requerida, ti/te/td/tr requeridos ≥0), igual que las reglas del DTO del backend (`class-validator`) — la UI valida lo mismo antes de enviar, para no depender solo del 400 del servidor.

## 7. Criterios de aceptación (testeables)

1. `RiskBadge` renderiza el color/texto correcto para cada `nivel` (`Bajo/Medio/Alto/Critico`) — test de componente con los 4 casos.
2. `TimeStatusBadge` renderiza correctamente para los 5 `estado` posibles.
3. `MoslerForm` no permite submit si falta `amenaza` o algún F/S/P/E/A/V — muestra error inline y no llama a la API.
4. `MoslerForm`, al enviar, llama a `POST /projects/:id/mosler` con el body esperado (sin los campos calculados).
5. `MoslerList` renderiza una fila/card por entrada recibida, con su `RiskBadge` correspondiente, y un estado vacío cuando la lista es `[]`.
6. Mismos tres criterios anteriores (3-5) para `AdversaryTimeForm`/`AdversaryTimeList` con `TimeStatusBadge`.
7. En viewport mobile (< 640px), `MoslerList` no renderiza la tabla (`<table>` ausente o oculta) — se prueba vía clases/estructura, no pixel-perfect.
8. `npm run build` compila sin errores (incluye type-check de Next.js).

## 8. Fuera de alcance de este spec

Autenticación, manejo de catálogos administrables desde la UI (alta/edición de valores de catálogo — por ahora son de solo lectura desde el frontend), resto de módulos del checklist, tests e2e de navegador real (Playwright) — se evalúa sumarlos más adelante si hace falta verificar mobile real más allá de tests de componente.
