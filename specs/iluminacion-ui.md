# Spec: UI de Iluminación

Estado: implementado y aprobado.
Repo: `seguridad-web` (frontend). Contraparte de backend: `seguridad` → `specs/iluminacion.md` (estado: `BE [x]` en `MODULES_CHECKLIST.md`).

## 1. Propósito

Permite, dentro de un proyecto, relevar la iluminación del predio sector por sector: tipo de luminaria, cobertura, estado técnico, zonas oscuras, automatización (fotocélula/timer), alimentación, relación con el sistema de monitoreo, relación con el perímetro y recomendación técnica. Es un CRUD de lista sin cálculos propios — la UI no calcula nada, solo muestra y edita los 13 campos que define el backend, en el orden en que los devuelve el `GET`. Alimenta completitud (peso 5), checklist de calidad ("Iluminacion evaluada") y conteo en "Chart 3" del dashboard.

## 2. Precondición

El módulo de backend está marcado `BE [x]` en `MODULES_CHECKLIST.md`. El contrato de API (`iluminacion.md` sección 5) y los tres catálogos (`iluminacion_estado`, `iluminacion_cobertura`, `iluminacion_criticidad`) están definidos y aprobados — este spec los consume tal cual, sin reinterpretarlos.

## 3. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos/[id]/iluminacion` | Lista de `IlluminationEntry` del proyecto, en el orden de inserción que devuelve el `GET` (sin reordenar), con acceso a agregar/editar/borrar. Comparte `layout.tsx` con el resto de módulos por-proyecto (solo header del proyecto, sin nav secundaria/tabs — convención establecida desde `proyectos-ui.md`). |

Se agrega como card de acceso en `/proyectos/[id]` (constante `MODULES` de `src/app/proyectos/[id]/page.tsx`):

```ts
{
  label: "Iluminacion",
  suffix: "/iluminacion",
  icon: Lightbulb,
  description: "Sectores de iluminacion: cobertura, estado, zonas oscuras, automatizacion y criticidad",
},
```

`Lightbulb` ya está importado en `app-sidebar.tsx` — verificar que también se importe en `page.tsx`; si se prefiere un icono distinto, `SunMedium` o `Lamp` también están disponibles en `lucide-react`, pero `Lightbulb` es consistente con el sidebar.

En `src/components/app-sidebar.tsx`, el ítem "Iluminacion" del grupo "Relevamiento" hoy está deshabilitado (sin `href`). Pasa a usar `projectScoped("/iluminacion")`:

```ts
{ label: "Iluminacion", href: projectScoped("/iluminacion"), icon: Lightbulb },
```

No hace falta moverlo de grupo: ya está en "Relevamiento", que es el grupo correcto según el checklist.

## 4. Contrato de API consumido

Fuente exacta: `../seguridad/specs/iluminacion.md` secciones 2, 3 y 5.

- `GET /projects/:projectId/iluminacion` → lista de `IlluminationEntry` del proyecto **en el orden de inserción**, sin ningún `.sort()` aplicado por el backend. La UI **tampoco reordena en el cliente**.
- `POST /projects/:projectId/iluminacion` → body: `sector` (requerido, string), resto opcionales según tabla de `iluminacion.md` sección 2. Los 2 booleanos (`fotocelula`, `timer`) nacen `false` por defecto si no se envían.
- `PATCH /projects/:projectId/iluminacion/:id` → actualización parcial. El `:id` es el uuid del registro.
- `DELETE /projects/:projectId/iluminacion/:id`.
- `POST /projects` (creación de proyecto) **no** crea ninguna `IlluminationEntry` automática — el array nace vacío. El estado "vacío" es el caso normal de un proyecto recién creado.

### Campos de la respuesta relevantes para la UI

| Campo | Tipo TS | Uso en UI |
|---|---|---|
| `id` | `string` | Clave para `PATCH`/`DELETE` — no se muestra al usuario |
| `projectId` | `string` | Contexto, no se muestra |
| `sector` | `string` | Título principal en card y primera columna de tabla — único requerido |
| `tipo` | `string \| null` | Subtítulo en card, columna en tabla |
| `potencia` | `number \| null` | Input numérico; se muestra como `{valor} W` en la lista |
| `estado` | `string \| null` | Select `iluminacion_estado`; columna en tabla |
| `cobertura` | `string \| null` | Select `iluminacion_cobertura`; columna en tabla |
| `oscuras` | `string \| null` | Textarea; no se muestra en la lista (solo en form) |
| `fotocelula` | `boolean` | Checkbox; indicador visual en card (icono o etiqueta pequeña) |
| `timer` | `boolean` | Checkbox; indicador visual en card |
| `alimentacion` | `string \| null` | Input texto; no se muestra en la lista |
| `cctv` | `string \| null` | Input texto libre; no se muestra en la lista |
| `perimetro` | `string \| null` | Input texto libre; no se muestra en la lista |
| `recomendacion` | `string \| null` | Textarea; no se muestra en la lista |
| `criticidad` | `string \| null` | Select `iluminacion_criticidad`; badge en card y columna en tabla |
| `createdAt`, `updatedAt` | `string` | No se muestran en UI |

### Catálogos

| Endpoint | Valores | Campo que puebla |
|---|---|---|
| `GET /catalogs/iluminacion_estado` | `Correcto,Regular,Deficiente,Critico` (4 valores) | `estado` |
| `GET /catalogs/iluminacion_cobertura` | `Completa,Parcial,Deficiente` (3 valores) | `cobertura` |
| `GET /catalogs/iluminacion_criticidad` | `Baja,Media,Alta,Critica` (4 valores) | `criticidad` |

Los 3 catálogos se cargan con el hook `useCatalog` ya existente en `src/lib/api`. Cada uno es una llamada independiente — si uno falla, el `<Select>` correspondiente queda vacío y el resto del form sigue funcionando (mismo criterio que CCTV con 6 catálogos y Accesos con 5 catálogos).

**Nota — campos de texto libre sin FK**: `cctv` y `perimetro` son texto libre (el analista escribe a mano el nombre o ID de cámaras/tramos relacionados). La UI no agrega combobox, autocomplete ni FK — `iluminacion.md` sección 2 es explícito en este punto.

## 5. Mobile-first: criterio de layout

Mismo patrón que `CctvCameraList`/`AccessPointList`/`PerimeterSectionList`: cards apiladas en mobile, tabla desde `md:`.

### Lista

- **Card (mobile, `< md`)**: `sector` como título, `tipo` como subtítulo si existe, indicadores de `fotocelula`/`timer` como etiquetas pequeñas (`Fotocélula` / `Timer`) cuando son `true`, `criticidad` como badge (`CriticalityBadge`), botones "Editar"/"Borrar" siempre visibles (no hover-only).
- **Tabla (`md:` en adelante)**: columnas **Sector / Tipo / Estado / Cobertura / Criticidad / Acciones** — subconjunto de 5 campos informativos más la columna Acciones. Los campos de detalle (`oscuras`, `alimentacion`, `cctv`, `perimetro`, `recomendacion`, `potencia`, `fotocelula`, `timer`) no se muestran en la grilla — se editan solo en el form.
- El orden de filas/cards es el que devuelve el `GET` (orden de inserción) — la UI no aplica ningún `.sort()` propio.
- **Indicador visual de criticidad**: `criticidad` tiene 4 valores (`Baja/Media/Alta/Critica`). Se usa `CriticalityBadge` (ya en `src/components/CriticalityBadge.tsx`) tal cual sin modificarlo — los 4 valores mapean directamente a sus colores. Para `null`/`undefined` muestra el fallback "Sin dato".

### Form — organización en 4 bloques temáticos

Con 13 campos (incluyendo 2 booleanos y 3 catálogos) se organiza en 4 bloques para mantener coherencia temática, siguiendo el criterio de módulos anteriores:

**Bloque 1 — Identificación del sector**
- `sector` (`Input`, ancho completo, único requerido — label "Sector" — ej. `"Estacionamiento Norte"`)
- `tipo` y `alimentacion` en grid `sm:grid-cols-2` (`Input` texto libre, labels "Tipo de luminaria" / "Alimentacion")
- `potencia` (`Input` tipo número, label "Potencia (W)", ancho completo o `sm:grid-cols-2` con campo vacío si se prefiere alinear)

**Bloque 2 — Estado y cobertura**
- `estado` (`Select` con `iluminacion_estado`, 4 opciones, label "Estado") y `cobertura` (`Select` con `iluminacion_cobertura`, 3 opciones, label "Cobertura") en grid `sm:grid-cols-2`
- `oscuras` (`Textarea`, label "Zonas oscuras", ancho completo)

**Bloque 3 — Automatización**
- Dos checkboxes en fila (`flex flex-wrap gap-4`): `fotocelula` (label "Fotocélula") y `timer` (label "Timer")

**Bloque 4 — Relaciones y recomendación**
- `cctv` (`Input` texto libre, label "Relacion con sistema de monitoreo", ancho completo)
- `perimetro` (`Input` texto libre, label "Relacion con perimetro", ancho completo)
- `recomendacion` (`Textarea`, label "Recomendacion", ancho completo)
- `criticidad` (`Select` con `iluminacion_criticidad`, 4 opciones, label "Criticidad", al final del form — separado del resto por ser el campo que se refleja como badge en la lista)

## 6. Componentes

```
src/
  lib/api/
    iluminacion.ts          tipos + cliente + hooks de TanStack Query (mismo patron que cctv.ts)
  components/
    LightingSectorForm.tsx  form crear/editar entrada (13 campos de iluminacion.md seccion 2)
    LightingSectorList.tsx  listado (card en mobile, tabla en md+), respeta el orden del GET
  app/
    proyectos/[id]/iluminacion/page.tsx
```

### `src/lib/api/iluminacion.ts` — estructura

Siguiendo el patrón exacto de `cctv.ts`:

- **`IlluminationEntry`** (interface): todos los campos del backend — `id` (uuid), `projectId`, `sector` (string), `tipo`, `alimentacion` (string | null), `potencia` (number | null), `estado`, `cobertura`, `oscuras`, `cctv`, `perimetro`, `recomendacion`, `criticidad` (string | null), `fotocelula` y `timer` (boolean — no `boolean | null`), `createdAt`, `updatedAt`.
- **`IlluminationInput`** (interface): `sector` (requerido, string), resto como opcionales. Los 2 booleanos como `boolean?`.
- **`iluminacionApi`** (objeto): `list`, `create`, `update`, `remove` — mismo patrón que `cctvApi`.
- **Hooks**: `useIlluminationSectors(projectId)`, `useCreateIlluminationSector(projectId)`, `useUpdateIlluminationSector(projectId)`, `useDeleteIlluminationSector(projectId)` — mismo patrón que CCTV, invalidando el query key `["iluminacion", projectId]`.

### Componentes reutilizados de `src/components/` y `src/components/ui/`

- `CriticalityBadge` (ya en `src/components/CriticalityBadge.tsx`) para pintar `criticidad`.
- `Card`/`CardContent`, `Table`/`TableBody`/`TableCell`/`TableHead`/`TableHeader`/`TableRow`.
- `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` (3 instancias en el form: `estado`, `cobertura`, `criticidad`).
- `Checkbox` (ya instalado, usado en Perímetro, Accesos y CCTV) — 2 instancias en el form: `fotocelula`, `timer`.
- `Textarea` (ya instalado) — 2 instancias: `oscuras`, `recomendacion`.
- `Input`, `Label`, `Button`.

No requiere instalar ningún componente shadcn nuevo.

## 7. Estados a manejar

Mismo patrón ya fijado en Proyectos/Mosler/Tiempos/Metodología/Activos/Perímetro/Accesos/CCTV (nunca mostrar "cargando" y error simultáneamente):

- **Cargando**: mensaje/skeleton simple mientras `entries === undefined` y no hay error.
- **Vacío**: mensaje + CTA ("Todavía no hay sectores de iluminación cargados. Agregar uno."). Es el estado normal de cualquier proyecto recién creado — no hay seed, se trata como caso esperado y frecuente, no un caso límite raro.
- **Error de red/API (lista)**: mensaje de error legible, no JSON/stack crudo.
- **Error de red/API (catálogos)**: con 3 catálogos a cargar, si alguno falla la UI debe poder seguir mostrando el form con los demás `Select` poblados — no bloquear todo el form por un solo catálogo caído. El `Select` del catálogo caído queda vacío o muestra un estado de error inline sin impedir que el resto del form funcione. Mismo criterio que CCTV (6 catálogos) y Accesos (5 catálogos).
- **Error de mutación (POST/PATCH/DELETE)**: mensaje de error inline, no toast bloqueante. La lista no se invalida hasta confirmar respuesta 2xx.
- **Validación de formulario**: único campo requerido es `sector` (igual que el backend — `POST` sin `sector` devuelve 400). Los 2 booleanos se envían como `false` por defecto si no se tocan (no `undefined`). `potencia` se envía como número si se completa (no string). Los campos string opcionales se envían como string vacío o `null` si no se completan — consistente con la convención del backend (`text` nullable).

## 8. Criterios de aceptación

1. `LightingSectorForm` no permite submit si falta `sector` — muestra error inline y no llama a `onSubmit`.
2. `LightingSectorForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado: `sector` (string), `potencia` como número (no string), los 2 booleanos (`fotocelula`, `timer`) como `boolean`, los 3 `Select` (`estado`, `cobertura`, `criticidad`) como string.
3. `LightingSectorForm` con `initial` precarga los 13 campos, incluyendo los 2 `Checkbox` reflejando su valor booleano real (`true`/`false`).
4. `LightingSectorForm` sin tocar ningún `Checkbox` envía `fotocelula: false` y `timer: false` (default, no `undefined`).
5. `LightingSectorForm` puebla los 3 `Select` con los valores recibidos de sus respectivos catálogos — mocks independientes para `iluminacion_estado`, `iluminacion_cobertura` e `iluminacion_criticidad`.
6. `LightingSectorForm` con `iluminacion_estado` mockeado devuelve exactamente 4 opciones en el orden `Correcto, Regular, Deficiente, Critico`.
7. `LightingSectorForm` con `iluminacion_cobertura` mockeado devuelve exactamente 3 opciones: `Completa, Parcial, Deficiente` (el tercer valor es `"Deficiente"`, no `"Inexistente"` ni `"Nula"`).
8. `LightingSectorForm` con `iluminacion_criticidad` mockeado devuelve exactamente 4 opciones: `Baja, Media, Alta, Critica`.
9. `LightingSectorList` renderiza una fila/card por entrada recibida, en el mismo orden en que llegan — test con lista mock en orden arbitrario, verificando que el primer elemento renderizado es el primero del array recibido (sin reordenar).
10. `LightingSectorList` muestra estado vacío con CTA cuando la lista es `[]`, sin mostrarlo como error.
11. `LightingSectorList` muestra `CriticalityBadge` con el valor correcto para `Baja`, `Media`, `Alta` y `Critica` en el campo `criticidad`. Para `null`/`undefined` muestra el fallback "Sin dato".
12. `LightingSectorList` muestra `sector` como identificador principal tanto en las cards mobile como en la primera columna de la tabla desktop.
13. En viewport mobile (`< md`), `LightingSectorList` no renderiza la tabla (`<table>` ausente u oculta) — se prueba vía clases/estructura, no pixel-perfect.
14. La tabla desktop de `LightingSectorList` muestra exactamente las columnas Sector / Tipo / Estado / Cobertura / Criticidad / Acciones, en ese orden.
15. `LightingSectorList` en modo card muestra las etiquetas "Fotocélula" y "Timer" únicamente cuando el valor correspondiente es `true` — cuando es `false` esas etiquetas no aparecen.
16. El ítem "Iluminacion" del sidebar queda habilitado (con `href`) cuando hay un proyecto activo en la URL, y deshabilitado (sin `href`) cuando no hay proyecto activo — mismo comportamiento que "Sistema de Monitoreo" y "Control de Accesos".
17. La card "Iluminacion" aparece en la página `/proyectos/[id]` con sufijo `/iluminacion` y es un link funcional a esa ruta.
18. `npm run build` compila sin errores.

## 9. Fuera de alcance

- Cálculo o visualización de completitud (peso 5), checklist "Iluminacion evaluada", conteo en "Chart 3" del dashboard — son responsabilidad de los módulos transversales cuando se aborden.
- Sección del informe técnico para Iluminación — el legado no tiene sección numerada propia en `genRpt` (`iluminacion.md` sección 4.6), por lo tanto la UI tampoco genera ni muestra sección de informe para este módulo.
- Vinculación normalizada entre `IlluminationEntry.cctv`/`IlluminationEntry.perimetro` y registros reales de `CctvCameraEntry` o `PerimeterSectionEntry` — el backend define ambos como texto libre sin FK ni validación de existencia.
- Edición de catálogos desde la UI — catálogos de solo lectura en el frontend (misma convención que todos los módulos anteriores).
- Reordenamiento manual de entradas (no hay drag-and-drop ni control de orden manual; el orden es el de inserción).

## 10. Preguntas abiertas

Ninguna pendiente. El contrato de backend (`iluminacion.md`), los 3 catálogos y las convenciones ya establecidas en este repo resuelven todos los puntos del spec. En particular:

- `CriticalityBadge` (en `src/components/CriticalityBadge.tsx`) ya soporta los 4 valores de `iluminacion_criticidad` (`Baja/Media/Alta/Critica`) — no se modifica el componente.
- Los campos `cctv` y `perimetro` son texto libre sin precedente en módulos anteriores en este rol específico (un campo de texto que referencia otro módulo sin FK) — pero la convención de `Input` texto libre para campos `'t'` del legado ya está fijada desde Activos/Perímetro/Accesos; no hay ambigüedad de implementación.
- `Lightbulb` ya está importado en `app-sidebar.tsx` (línea 19) — no se necesita ningún nuevo icono.
