# Spec: UI de Sistema de Monitoreo / CCTV

Estado: implementado y aprobado.
Repo: `seguridad-web` (frontend). Contraparte de backend: `seguridad` → `specs/cctv.md` (estado: `BE [x]` en `MODULES_CHECKLIST.md`).

## 1. Propósito

Permite, dentro de un proyecto, relevar el sistema de video vigilancia del predio cámara por cámara: ubicación, tipo, analíticas, estado de imagen, obstrucciones, energía, conectividad, grabación y retención. Es un CRUD de lista sin cálculos propios — la UI no calcula nada, solo muestra y edita los 27 campos que define el backend, en el orden en que los devuelve el `GET`. Alimenta completitud (peso 6), checklist de calidad ("estado de imagen completo"), conteo en "Chart 3" del dashboard e informe técnico sección 11.

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos/[id]/cctv` | Lista de `CctvCameraEntry` del proyecto, en el orden de inserción que devuelve el `GET` (sin reordenar), con acceso a agregar/editar/borrar. Comparte `layout.tsx` con el resto de módulos por-proyecto (solo header del proyecto, sin nav secundaria/tabs — convención establecida desde `proyectos-ui.md`). |

Se agrega como card de acceso en `/proyectos/[id]` (constante `MODULES` de `src/app/proyectos/[id]/page.tsx`):

```ts
{
  label: "Sistema de Monitoreo",
  suffix: "/cctv",
  icon: Camera,
  description: "Camaras de video vigilancia: ubicacion, analiticas, estado, grabacion y criticidad",
},
```

`Camera` se importa de `lucide-react` — verificar disponibilidad; si no estuviera, usar `Video` (también de `lucide-react`).

En `src/components/app-sidebar.tsx`, el ítem "Sistema de Monitoreo / CCTV" del grupo "Relevamiento" hoy está deshabilitado (sin `href`). Pasa a usar `projectScoped("/cctv")`, igual patrón que los módulos ya habilitados (Activos, Perímetro, Accesos):

```ts
{ label: "Sistema de Monitoreo", href: projectScoped("/cctv"), icon: Camera },
```

No hace falta moverlo de grupo: ya está en "Relevamiento", que es el grupo correcto según el checklist.

## 3. Contrato de API consumido

Fuente exacta: `../seguridad/specs/cctv.md` secciones 2, 3 y 5.

- `GET /projects/:projectId/cctv` → lista de `CctvCameraEntry` del proyecto **en el orden de inserción**, sin ningún `.sort()` aplicado por el backend (a diferencia de Activos que ordena por criticidad). La UI **tampoco reordena en el cliente**.
- `POST /projects/:projectId/cctv` → body: `camId` (requerido, string — es el identificador de cámara dado por el analista, ej. `"CAM-01"`, **no** es el PK uuid de la tabla), resto opcionales según tabla de `cctv.md` sección 2. Los 13 booleanos nacen `false` por defecto si no se envían.
- `PATCH /projects/:projectId/cctv/:id` → actualización parcial. El `:id` es el uuid del registro, **no** `camId`.
- `DELETE /projects/:projectId/cctv/:id`.
- `POST /projects` (creación de proyecto) **no** crea ninguna `CctvCameraEntry` automática — el array nace vacío. El estado "vacío" es el caso normal de un proyecto recién creado.

### Campos de la respuesta

La respuesta expone tanto `id` (uuid del registro DB) como `camId` (identificador del analista). La UI usa `id` para las operaciones `PATCH`/`DELETE` y muestra `camId` al usuario como identificador legible.

### Catálogos

| Endpoint | Valores | Campo que puebla |
|---|---|---|
| `GET /catalogs/cctv_tipo` | `Bullet,Domo,PTZ,Termica,LPR,Panoramica` (6 valores) | `tipo` |
| `GET /catalogs/cctv_estado` | `Optimo,Aceptable,Deficiente,Fuera de servicio` (4 valores) | `estado` |
| `GET /catalogs/cctv_energia` | `Estable,Inestable,Falla` (3 valores) | `energia` |
| `GET /catalogs/cctv_conectividad` | `Estable,Inestable,Falla` (3 valores — catálogo independiente de `cctv_energia`) | `conectividad` |
| `GET /catalogs/cctv_grabacion` | `24/7,Eventos,Sin grabacion` (3 valores) | `grabacion` |
| `GET /catalogs/cctv_criticidad` | `Baja,Media,Alta,Critica` (4 valores) | `criticidad` |

`cctv_energia` y `cctv_conectividad` comparten los mismos valores de texto pero son entradas de catálogo independientes — se fetchean con dos llamadas separadas y pueblan `<Select>` distintos, sin mezclar (mismo criterio que `accesos_ctrlPeatonal`/`accesos_ctrlVehicular` en Accesos y `perimetro_estado`/`perimetro_iluminacion` en Perímetro).

No hay campos calculados de solo lectura — todo el body es editable por el analista.

## 4. Mobile-first: criterio de layout

Mismo patrón que `AccessPointList`/`PerimeterList`/`AssetList`: cards apiladas en mobile, tabla desde `md:`.

### Lista

- **Card (mobile, `< md`)**: `camId` como título, `nombre` como subtítulo si existe, `tipo` como etiqueta secundaria si existe, `estado` como texto de estado, `criticidad` como badge (ver nota abajo), botones "Editar"/"Borrar" siempre visibles (no hover-only).
- **Tabla (`md:` en adelante)**: columnas **ID / Nombre / Tipo / Estado / Grabación / Criticidad / Acciones** — mismo subconjunto de 6 campos que usa el informe técnico (`cctv.md` sección 4.6: ID/Nombre/Tipo/Estado/Grabacion/Criticidad), más la columna Acciones. Los 21 campos restantes no se muestran en la grilla — se editan solo en el form.
- El orden de filas/cards es el que devuelve el `GET` (orden de inserción) — la UI no aplica ningún `.sort()` propio.
- **Indicador visual de criticidad**: `criticidad` tiene 4 valores (`Baja/Media/Alta/Critica`). Se usa `CriticalityBadge` (ya en `src/components/CriticalityBadge.tsx`, renombrado desde `AssetCriticalityBadge` al cerrar `accesos-ui.md`) tal cual sin modificarlo — los 4 valores mapean directamente a sus colores. Para `null`/`undefined` muestra el fallback "Sin dato".

### Form — organización en 5 bloques temáticos

Con 27 campos (incluyendo los 13 booleanos y los 6 catálogos) se organiza en 5 bloques para evitar un único bloque de 27 filas sueltas, siguiendo el criterio de `AccessPointForm` (24 campos, 5 bloques) y `PerimeterForm` (18 campos, 6 bloques):

**Bloque 1 — Identificación de la cámara**
- `camId` (`Input`, ancho completo, único requerido — label "ID Cámara" — ej. `CAM-01`)
- `nombre` (`Input`, ancho completo, label "Nombre")
- `sector` y `ubicacion` en grid `sm:grid-cols-2` (`Input` texto libre)
- `tipo` (`Select` con `cctv_tipo`, 6 opciones) y `marca` (`Input` texto libre, label "Marca/Modelo") en grid `sm:grid-cols-2`
- `resolucion` (`Input` texto libre) y `alcance` (`Input` tipo número, label "Alcance estimado (m)") en grid `sm:grid-cols-2`

**Bloque 2 — Capacidades ópticas**
- Dos checkboxes en fila (`flex flex-wrap gap-4`): `nocturna` (label "Visión nocturna") y `ir` (label "IR")

**Bloque 3 — Analíticas**
- Seis checkboxes en fila (`flex flex-wrap gap-4`): `cruceLinea` (label "Cruce de línea"), `intrusion` (label "Intrusión"), `merodeo` (label "Merodeo"), `movimiento` (label "Movimiento"), `facial` (label "Facial"), `patente` (label "Patente")

**Bloque 4 — Estado e imagen**
- `estado` (`Select` con `cctv_estado`, 4 opciones, label "Estado de la cámara") en ancho completo o grid `sm:grid-cols-2` con `antivandalica` (`Checkbox`, label "Protección antivandalica")
- Tres checkboxes de problemas de imagen en fila (`flex flex-wrap gap-4`): `suciedad` (label "Suciedad"), `desenfoque` (label "Desenfoque"), `obstruccion` (label "Obstrucción")

**Bloque 5 — Infraestructura y grabación**
- `energia` (`Select` con `cctv_energia`) y `conectividad` (`Select` con `cctv_conectividad`) en grid `sm:grid-cols-2`
- `grabacion` (`Select` con `cctv_grabacion`) y `retencion` (`Input` tipo número, label "Retención (días)") en grid `sm:grid-cols-2`
- `alerta` (`Checkbox`, label "Alerta activa")

**Bloque 6 — Hallazgos y clasificación**
- `obsCCTV` (`Textarea`, label "Observaciones", ancho completo)
- `criticidad` (`Select` con `cctv_criticidad`, label "Criticidad", al final del form, separado del resto por ser el campo que se refleja como badge en la lista)

> Nota: el formulario tiene 6 bloques lógicos, no 5 — la división refleja la agrupación temática natural del esquema `MS.cctv`. Los módulos anteriores tenían 5 o 6 bloques según la cantidad de campos; CCTV con 27 campos justifica 6.

## 5. Componentes

```
src/
  lib/api/
    cctv.ts               tipos + cliente + hooks de TanStack Query (mismo patron que accesos.ts)
  components/
    CctvCameraForm.tsx    form crear/editar entrada (27 campos de cctv.md seccion 2)
    CctvCameraList.tsx    listado (card en mobile, tabla en md+), respeta el orden del GET
  app/
    proyectos/[id]/cctv/page.tsx
```

### `src/lib/api/cctv.ts` — estructura

Siguiendo el patrón exacto de `accesos.ts`:

- **`CctvCameraEntry`** (interface): todos los campos del backend — `id` (uuid), `projectId`, `camId` (string), `nombre`, `sector`, `ubicacion`, `tipo`, `marca`, `resolucion`, `nocturna`, `ir`, `alcance`, `cruceLinea`, `intrusion`, `merodeo`, `movimiento`, `facial`, `patente`, `estado`, `suciedad`, `desenfoque`, `obstruccion`, `antivandalica`, `energia`, `conectividad`, `grabacion`, `retencion`, `alerta`, `obsCCTV`, `criticidad`, `createdAt`, `updatedAt`. Los 13 booleanos como `boolean` (no `boolean | null`); los campos string opcionales como `string | null`; los numéricos como `number | null`.
- **`CctvCameraInput`** (interface): `camId` (requerido, string), resto como opcionales. Los 13 booleanos como `boolean?`.
- **`cctvApi`** (objeto): `list`, `create`, `update`, `remove` — mismo patrón que `accesosApi`.
- **Hooks**: `useCctvCameras(projectId)`, `useCreateCctvCamera(projectId)`, `useUpdateCctvCamera(projectId)`, `useDeleteCctvCamera(projectId)` — mismo patrón que Accesos, invalidando el query key `["cctv", projectId]`.

### Catálogos en el form

Los 6 catálogos se cargan con el hook `useCatalog` ya existente en `src/lib/api`. Cada uno es una llamada independiente — si uno falla, el `<Select>` correspondiente queda vacío y el resto del form sigue funcionando (mismo criterio que Accesos con 5 catálogos y Perímetro con 8 catálogos).

### Componentes reutilizados de `src/components/` y `src/components/ui/`

- `CriticalityBadge` (ya en `src/components/CriticalityBadge.tsx`) para pintar `criticidad`.
- `Card`/`CardContent`, `Table`/`TableBody`/`TableCell`/`TableHead`/`TableHeader`/`TableRow`.
- `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` (6 instancias en el form: `tipo`, `estado`, `energia`, `conectividad`, `grabacion`, `criticidad`).
- `Checkbox` (ya instalado, usado en Perímetro y Accesos) — 13 instancias en el form.
- `Textarea` (ya instalado) — 1 instancia: `obsCCTV`.
- `Input`, `Label`, `Button`.

No requiere instalar ningún componente shadcn nuevo.

## 6. Estados a manejar

Mismo patrón ya fijado en Proyectos/Mosler/Tiempos/Metodología/Activos/Perímetro/Accesos (nunca mostrar "cargando" y error simultáneamente):

- **Cargando**: mensaje/skeleton simple mientras `entries === undefined` y no hay error.
- **Vacío**: mensaje + CTA ("Todavía no hay cámaras cargadas. Agregar una."). Es el estado normal de cualquier proyecto recién creado — no hay seed, se trata como caso esperado y frecuente, no un caso límite raro.
- **Error de red/API (lista)**: mensaje de error legible, no JSON/stack crudo.
- **Error de red/API (catálogos)**: con 6 catálogos a cargar, si alguno falla la UI debe poder seguir mostrando el form con los demás `Select` poblados — no bloquear todo el form por un solo catálogo caído. El `Select` del catálogo caído queda vacío o muestra un estado de error inline sin impedir que el resto del form funcione. Mismo criterio que Perímetro (8 catálogos) y Accesos (5 catálogos).
- **Error de mutación (POST/PATCH/DELETE)**: mensaje de error inline, no toast bloqueante. La lista no se invalida hasta confirmar respuesta 2xx.
- **Validación de formulario**: único campo requerido es `camId` (igual que el backend — `POST` sin `camId` devuelve 400). Los 13 booleanos se envían como `false` por defecto si no se tocan (no `undefined`). `alcance` y `retencion` se envían como número si se completan (no string). Los campos string opcionales se envían como string vacío o `null` si no se completan — consistente con la convención del backend (`text` nullable).

## 7. Criterios de aceptación

1. `CctvCameraForm` no permite submit si falta `camId` — muestra error inline y no llama a `onSubmit`.
2. `CctvCameraForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado: `camId` (string), `alcance` y `retencion` como número (no string), los 13 booleanos como `boolean`, los 6 `Select` como string.
3. `CctvCameraForm` con `initial` precarga los 27 campos, incluyendo los 13 `Checkbox` reflejando su valor booleano real (`true`/`false`).
4. `CctvCameraForm` sin tocar ningún `Checkbox` envía los 13 como `false` (default, no `undefined`): `nocturna: false`, `ir: false`, `cruceLinea: false`, `intrusion: false`, `merodeo: false`, `movimiento: false`, `facial: false`, `patente: false`, `suciedad: false`, `desenfoque: false`, `obstruccion: false`, `antivandalica: false`, `alerta: false`.
5. `CctvCameraForm` puebla los 6 `Select` (`tipo`, `estado`, `energia`, `conectividad`, `grabacion`, `criticidad`) con los valores recibidos de sus respectivos catálogos — mocks independientes para cada uno, sin mezclar `cctv_energia` con `cctv_conectividad` aunque tengan los mismos valores de texto.
6. `CctvCameraForm` con `cctv_tipo` mockeado devuelve exactamente 6 opciones terminando en "Panoramica".
7. `CctvCameraForm` con `cctv_estado` mockeado devuelve exactamente 4 opciones terminando en "Fuera de servicio" (no "Critico").
8. `CctvCameraForm` con `cctv_grabacion` mockeado devuelve exactamente 3 opciones: `24/7`, `Eventos`, `Sin grabacion`.
9. `CctvCameraList` renderiza una fila/card por entrada recibida, en el mismo orden en que llegan — test con lista mock en orden arbitrario, verificando que el primer elemento renderizado es el primero del array recibido (sin reordenar).
10. `CctvCameraList` muestra estado vacío con CTA cuando la lista es `[]`, sin mostrarlo como error.
11. `CctvCameraList` muestra `CriticalityBadge` con el valor correcto para `Baja`, `Media`, `Alta` y `Critica` en el campo `criticidad`. Para `null`/`undefined` muestra el fallback "Sin dato".
12. `CctvCameraList` muestra `camId` como identificador principal (no el uuid interno `id`) tanto en las cards mobile como en la primera columna de la tabla desktop.
13. En viewport mobile (`< md`), `CctvCameraList` no renderiza la tabla (`<table>` ausente u oculta) — se prueba vía clases/estructura, no pixel-perfect.
14. La tabla desktop de `CctvCameraList` muestra exactamente las columnas ID / Nombre / Tipo / Estado / Grabación / Criticidad / Acciones, en ese orden.
15. `npm run build` compila sin errores.

## 8. Fuera de alcance

- Cálculo o visualización de completitud (peso 6), checklist "Sistema de monitoreo con estado", conteo en "Chart 3" del dashboard — son responsabilidad de los módulos transversales cuando se aborden.
- Render de la sección "11. Relevamiento Electronico - Sistema de Monitoreo" del informe técnico — pertenece al módulo de Informe.
- Vinculación normalizada entre cámaras y vulnerabilidades — el backend no define tal relación; `obsCCTV` es texto libre, la UI no agrega combobox ni FKs que el contrato no tiene.
- Edición de catálogos desde la UI — catálogos de solo lectura en el frontend (misma convención que todos los módulos anteriores).
- Reordenamiento manual de entradas (no hay drag-and-drop ni control de orden manual; el orden es el de inserción).
- Relación con el campo `camaras` de `AccesosEntry` (texto libre que puede referenciar cámaras del sistema de monitoreo) — esa relación textual es responsabilidad del spec de Accesos y no implica FK ni combobox en la UI de CCTV.
- Relación con el futuro módulo de Iluminación (campo `cctv` en ese módulo) — responsabilidad del spec de Iluminación.

## 9. Preguntas abiertas

Ninguna pendiente. El contrato de backend (`cctv.md`), los 6 catálogos y las convenciones ya establecidas en este repo resuelven todos los puntos del spec. En particular:

- `CriticalityBadge` (en `src/components/CriticalityBadge.tsx`) fue renombrado desde `AssetCriticalityBadge` al implementar Accesos y sus 4 valores activos de `cctv_criticidad` (`Baja/Media/Alta/Critica`) mapean directamente a los estilos existentes — no se modifica el componente.
- La distinción `camId` (identificador del analista) vs. `id` (uuid PK) está explícitamente documentada en `cctv.md` sección 2 y sección 5 — la UI usa `id` para URLs de `PATCH`/`DELETE` y muestra `camId` al usuario. No hay ambigüedad.
- `cctv_energia` y `cctv_conectividad` son catálogos independientes con los mismos valores de texto: se fetchean por separado y no se comparte instancia de `<Select>` (mismo criterio que Accesos con `ctrlPeatonal`/`ctrlVehicular`).
