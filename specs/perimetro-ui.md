# Spec: UI de Perímetro

Estado: implementado y aprobado.
Repo: `seguridad-web` (frontend). Contraparte de backend: `seguridad` → `specs/perimetro.md` (estado: aprobado, `BE [x]` en `MODULES_CHECKLIST.md`).

## 1. Propósito

Permite, dentro de un proyecto, relevar el perímetro del predio dividido por tramos/sectores (cerramiento, altura, continuidad, escalabilidad, vegetación, visibilidad, iluminación, sensores, vulnerabilidades en texto libre y criticidad), para alimentar después completitud/checklist/dashboard/informe técnico. Igual que Activos y Metodología, es un CRUD de lista sin cálculos propios — la UI no calcula nada, solo muestra y edita los 18 campos que ya define el backend, en el orden en que los devuelve el `GET`.

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos/[id]/perimetro` | Lista de `PerimeterSectorEntry` del proyecto, en el orden de inserción que devuelve el `GET` (sin reordenar, ver sección 3), con acceso a agregar/editar/borrar. Comparte `layout.tsx` con el resto de módulos por-proyecto (solo header del proyecto, sin nav secundaria/tabs — ver `proyectos-ui.md` nota 2026-06-26). |

Se agrega como card de acceso en `/proyectos/[id]` (página de Resumen, constante `MODULES` de `src/app/proyectos/[id]/page.tsx`):

```ts
{
  label: "Perimetro",
  suffix: "/perimetro",
  icon: Grid3x3,
  description: "Tramos del cerramiento perimetral: cerramiento, continuidad, vulnerabilidades y criticidad",
},
```

En `src/components/app-sidebar.tsx`, el ítem "Perimetro" del grupo "Relevamiento" hoy está deshabilitado (sin `href`, línea 76 de `app-sidebar.tsx` al momento de escribir este spec: `{ label: "Perimetro", icon: Grid3x3 }`). Pasa a usar `projectScoped("/perimetro")`, igual patrón que "Activos Protegidos":

```ts
{ label: "Perimetro", href: projectScoped("/perimetro"), icon: Grid3x3 },
```

No hace falta moverlo de grupo: ya está en "Relevamiento", que es el grupo correcto según el checklist. No hay nav secundaria/tabs dentro de `proyectos/[id]/layout.tsx` — cada módulo es su propia ruta, igual convención que Activos/Mosler/Tiempos/Metodología.

## 3. Contrato de API consumido

Fuente exacta: `../seguridad/specs/perimetro.md` secciones 2, 3 y 5.

- `GET /projects/:projectId/perimetro` → lista de `PerimeterSectorEntry` del proyecto **en el orden de inserción**, sin ningún `.sort()` aplicado por el backend (a diferencia de Activos, que ordena por criticidad descendente). La UI **tampoco reordena en el cliente**: respeta el orden recibido tal cual.
- `POST /projects/:projectId/perimetro` → body: `sector` (requerido, string), resto opcionales: `longitud` (numérico), `cerramiento`, `altura` (numérico), `estado`, `escalabilidad`, `continuidad`, `vegetacion`, `visibilidad`, `iluminacion`, `camaras` (texto libre), `sensores` (texto libre), `cercoElec` (booleano), `concertina` (booleano), `sendero` (booleano), `rondines` (texto libre), `vulns` (texto libre), `obsPer` (texto libre), `criticidad`.
- `PATCH /projects/:projectId/perimetro/:id` → actualización parcial.
- `DELETE /projects/:projectId/perimetro/:id`.
- `GET /catalogs/perimetro_cerramiento` → 8 strings, termina en `"Mixto"`. Puebla `cerramiento`.
- `GET /catalogs/perimetro_estado` → 4 strings (`Correcto,Regular,Deficiente,Critico`). Puebla `estado`.
- `GET /catalogs/perimetro_escalabilidad` → 3 strings (`Baja,Media,Alta` — **sin** "Critica", a diferencia de los catálogos de 4 valores). Puebla `escalabilidad`.
- `GET /catalogs/perimetro_continuidad` → 3 strings (`Completa,Con interrupciones,Deficiente`). Puebla `continuidad`.
- `GET /catalogs/perimetro_vegetacion` → 3 strings (`Sin vegetacion,Controlada,Descontrolada`). Puebla `vegetacion`.
- `GET /catalogs/perimetro_visibilidad` → 3 strings (`Buena,Regular,Pobre`). Puebla `visibilidad`.
- `GET /catalogs/perimetro_iluminacion` → 4 strings (`Correcto,Regular,Deficiente,Critico` — catálogo independiente de `perimetro_estado` aunque los valores coincidan textualmente; no se comparte el mismo `<select>` ni el mismo fetch). Puebla `iluminacion`.
- `GET /catalogs/perimetro_criticidad` → 4 strings (`Baja,Media,Alta,Critica`). Puebla `criticidad`.
- `POST /projects` (creación de proyecto) **no** crea ninguna `PerimeterSectorEntry` automática — el array nace vacío, igual que Activos. El estado "vacío" de esta UI es el caso normal de un proyecto recién creado, no una excepción (ver sección 6).

No hay campos calculados de solo lectura en este módulo (a diferencia de Mosler/Tiempos) — todo el body de la entrada es editable por el analista. `vulns` es texto libre, no relación a `VulnerabilityEntry` — el form lo trata como `Textarea` simple, sin combobox ni FK (misma convención que `amenazas`/`vulnerabilidades` en Activos).

## 4. Mobile-first: criterio de layout

Mismo patrón que `AssetList`/`MoslerList`/`AdversaryTimeList`/`MethodologyList`: cards apiladas en mobile, tabla desde `md:`.

- **Card (mobile)**: `sector` como título, `cerramiento` como subtítulo, `criticidad` como badge (ver nota de badge abajo), extracto de `estado`/`continuidad` si existen, `vulns`/`obsPer` truncados si existen, botones "Editar"/"Borrar" siempre visibles (no hover-only).
- **Tabla (`md:` en adelante)**: columnas **Sector / Cerramiento / Altura / Estado / Iluminación / Criticidad / Acciones** — mismo orden y subconjunto de campos que usa la tabla del informe técnico (`perimetro.md` sección 4.7: Sector/Cerramiento/Altura/Estado/Iluminacion/Criticidad). El resto de los 18 campos (`longitud`, `escalabilidad`, `continuidad`, `vegetacion`, `visibilidad`, `camaras`, `sensores`, `cercoElec`, `concertina`, `sendero`, `rondines`, `vulns`, `obsPer`) no se listan en la grilla principal — se editan en el form, igual criterio que Activos omitiendo `amenazas`/`vulnerabilidades`/`controles`/`impacto`/`obs` de su tabla.
- El orden de filas/cards es el que devuelve el `GET` (orden de inserción) — la UI no aplica ningún `.sort()` propio sobre la lista recibida, ni siquiera por criticidad (a diferencia de Activos).
- **Indicador visual de criticidad**: `criticidad` se muestra con el badge de color de 4 niveles (`Baja/Media/Alta/Critica`) ya existente en `src/components/AssetCriticalityBadge.tsx`. El componente ya es genérico por diseño — recibe `valor: string | null | undefined` y mapea por texto, sin lógica específica de Activos — así que se reusa tal cual, sin crear un componente nuevo idéntico (ver sección 9 sobre el nombre del componente).
- Form de alta/edición — organización sugerida dada la cantidad de campos (18), agrupando por afinidad temática en vez de un único bloque de 18 filas sueltas:
  1. **Identificación del tramo**: `sector` (`Input`, ancho completo, único requerido) + `longitud` (`Input` numérico).
  2. **Cerramiento físico**: grid `sm:grid-cols-2` con los 4 selects/campos relacionados al cerco en sí: `cerramiento` (Select), `altura` (Input numérico), `estado` (Select), `escalabilidad` (Select).
  3. **Condición del entorno**: grid `sm:grid-cols-2` con `continuidad` (Select), `vegetacion` (Select), `visibilidad` (Select), `iluminacion` (Select).
  4. **Apoyo electrónico y físico**: `camaras` (Textarea), `sensores` (Textarea) en grid `sm:grid-cols-2`; debajo, fila de 3 `Checkbox` (`cercoElec`, `concertina`, `sendero`) uno junto al otro (`flex flex-wrap gap-4`), igual patrón visual que el único `Checkbox` de `MethodologyForm` pero repetido x3.
  5. **Operación y hallazgos**: `rondines` (Textarea), `vulns` (Textarea), `obsPer` (Textarea) — cada una de ancho completo, en ese orden.
  6. **Clasificación final**: `criticidad` (Select), al final del form, separado del resto por ser el campo que se refleja como badge en la lista.

## 5. Componentes

```
src/
  lib/api/
    perimeter.ts           tipos + cliente + hooks de TanStack Query (mismo patron que assets.ts/methodology.ts)
  components/
    PerimeterForm.tsx       form crear/editar entrada (18 campos de la tabla de perimetro.md seccion 2)
    PerimeterList.tsx       listado (card en mobile, tabla en md+), respeta el orden del GET
  app/
    proyectos/[id]/perimetro/page.tsx
```

Reusa: `Card`/`CardContent`, `Table`/`TableBody`/`TableCell`/`TableHead`/`TableHeader`/`TableRow`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Textarea`, `Input`, `Label`, `Button`, `Checkbox` (ya instalado para Metodología, no se reinstala), y `AssetCriticalityBadge` de `src/components/AssetCriticalityBadge.tsx` para pintar `criticidad` (ver nota de nombre en sección 9). No requiere instalar ningún componente shadcn nuevo.

## 6. Estados a manejar

Mismo patrón ya fijado en Proyectos/Mosler/Tiempos/Metodología/Activos (nunca mostrar "cargando" y error simultáneamente):

- **Cargando**: mensaje/skeleton simple mientras `entries === undefined` y no hay error.
- **Vacío**: mensaje + CTA ("Todavía no hay tramos perimetrales cargados. Agregar uno."). Es el caso normal para cualquier proyecto recién creado — no hay seed, igual criterio que Activos: esta pantalla debe tratarlo como estado esperado y frecuente, no un caso límite raro.
- **Error de red/API** (lista, catálogos o mutación): mensaje de error legible, no JSON/stack crudo. Con 8 catálogos a cargar, si alguno falla la UI debe poder seguir mostrando el form con los demás selects poblados (no bloquear todo el form por un solo catálogo caído) — mismo criterio que `amenazasError` en `MoslerForm`/los 4 catálogos de `AssetForm`.
- **Validación de formulario**: único campo requerido es `sector` (igual que el backend — `POST` sin `sector` devuelve 400). El resto son opcionales, sin validación de formato salvo `longitud`/`altura` que deben enviarse como número si se completan (no string), y `cercoElec`/`concertina`/`sendero` que se envían como booleano (`false` por default si no se tocan, igual que el backend).

## 7. Criterios de aceptación (testeables)

1. `PerimeterForm` no permite submit si falta `sector` — muestra error inline y no llama a `onSubmit`.
2. `PerimeterForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado (18 campos de la sección 2 de `perimetro.md`, `longitud`/`altura` como número, no string; `cercoElec`/`concertina`/`sendero` como booleano), sin campos calculados (este módulo no tiene ninguno).
3. `PerimeterForm` con `initial` precarga los 18 campos, incluyendo los 3 `Checkbox` reflejando su valor booleano real (`true`/`false`).
4. `PerimeterForm` puebla los 8 `Select` (`cerramiento`, `estado`, `escalabilidad`, `continuidad`, `vegetacion`, `visibilidad`, `iluminacion`, `criticidad`) con los valores recibidos de sus respectivos catálogos (mocks independientes para cada uno, sin mezclar `perimetro_estado` con `perimetro_iluminacion` aunque tengan los mismos 4 valores).
5. `PerimeterForm` con submit sin tocar los 3 `Checkbox` envía `cercoElec: false`, `concertina: false`, `sendero: false` (default, no `undefined`).
6. `PerimeterList` renderiza una fila/card por entrada recibida, **en el mismo orden en que llegan** (sin reordenar en el cliente, ni por criticidad ni por ningún otro campo) — test con una lista mock en orden arbitrario, verificando que el primer elemento renderizado es el primero del array recibido.
7. `PerimeterList` muestra un estado vacío con CTA cuando la lista es `[]`, sin mostrarlo como error.
8. `PerimeterList` muestra el badge de criticidad correcto para los 4 valores posibles (`Baja/Media/Alta/Critica`) y un fallback neutral si el valor es vacío/no reconocido.
9. En viewport mobile (< 640px), `PerimeterList` no renderiza la tabla (`<table>` ausente u oculta) — se prueba vía clases/estructura, no pixel-perfect.
10. La tabla desktop de `PerimeterList` muestra exactamente las columnas Sector / Cerramiento / Altura / Estado / Iluminación / Criticidad / Acciones, en ese orden.
11. `npm run build` compila sin errores.

## 8. Fuera de alcance de este spec

Cálculo o visualización de completitud/checklist de calidad/conteo de "Chart 3" derivados de este módulo (ver `perimetro.md` sección 4) — son responsabilidad de los módulos transversales de Dashboard/Checklist cuando se aborden. Render de la sección "10. Relevamiento Fisico - Perimetro" del informe técnico — pertenece al módulo de Informe. Vinculación normalizada entre tramos perimetrales y vulnerabilidades — el backend modela `vulns` como texto libre, la UI no agrega comboboxes ni FKs que el contrato no tiene. Edición de catálogos desde la UI (mismo criterio que Activos/Mosler/Tiempos/Metodología: catálogos de solo lectura desde el frontend). Reordenamiento manual de las entradas (no hay drag-and-drop ni control de orden manual; el orden es el de inserción que devuelve el backend). Relación con el futuro módulo de Cercos Eléctricos/Sensores más allá de la coincidencia textual de catálogos ya señalada en `perimetro.md` — ese módulo tiene su propio spec futuro.

## 9. Preguntas abiertas

1. **Nombre del componente de badge de criticidad**: `AssetCriticalityBadge` (en `src/components/AssetCriticalityBadge.tsx`) es genérico por implementación (recibe `valor: string | null | undefined`, sin lógica específica de Activos) y este spec propone reusarlo tal cual para `criticidad` de Perímetro, evitando duplicar un componente idéntico. Sin embargo, el nombre quedaría engañoso (`Asset...` usado fuera del módulo de Activos) a medida que se agregue a más módulos con su propio campo de criticidad de 4 niveles (Perímetro ya es el segundo caso). No se resuelve en este spec si corresponde renombrarlo a algo más genérico (ej. `CriticalityBadge`) en este momento o diferirlo hasta que un tercer módulo lo necesite — queda a criterio de `developer-ui`/`reviewer-ui` decidir si el rename se hace ahora (con el costo de tocar `AssetList.tsx`/sus tests) o se posterga.
