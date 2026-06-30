# Spec: UI de Control de Accesos

Estado: implementado y aprobado.
Repo: `seguridad-web` (frontend). Contraparte de backend: `seguridad` → `specs/accesos.md` (estado: `BE [x]` en `MODULES_CHECKLIST.md`).

## 1. Propósito

Permite, dentro de un proyecto, relevar cada punto de acceso del predio (peatonal, vehicular, de servicio, de emergencia, etc.) con sus controles físicos y electrónicos, protocolos de ingreso, trazabilidad, respaldo energético y hallazgos. Es un CRUD de lista sin cálculos propios — la UI no calcula nada, solo muestra y edita los 24 campos que define el backend, en el orden en que los devuelve el `GET`. Alimenta completitud (peso 6), checklist de calidad (protocolo de visitas), conteo en "Chart 3" del dashboard e informe técnico sección 12.

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos/[id]/accesos` | Lista de `AccessPointEntry` del proyecto, en el orden de inserción que devuelve el `GET` (sin reordenar), con acceso a agregar/editar/borrar. Comparte `layout.tsx` con el resto de módulos por-proyecto (solo header del proyecto, sin nav secundaria/tabs — convención establecida desde `proyectos-ui.md`). |

Se agrega como card de acceso en `/proyectos/[id]` (constante `MODULES` de `src/app/proyectos/[id]/page.tsx`):

```ts
{
  label: "Control de Accesos",
  suffix: "/accesos",
  icon: DoorOpen,
  description: "Puntos de acceso: controles fisicos, electronicos, protocolos y trazabilidad",
},
```

`DoorOpen` ya está importado en `app-sidebar.tsx` — no requiere instalación adicional.

En `src/components/app-sidebar.tsx`, el ítem "Control de Accesos" del grupo "Relevamiento" hoy está deshabilitado (sin `href`, línea 79: `{ label: "Control de Accesos", icon: DoorOpen }`). Pasa a usar `projectScoped("/accesos")`, igual patrón que "Activos Protegidos" y "Perimetro":

```ts
{ label: "Control de Accesos", href: projectScoped("/accesos"), icon: DoorOpen },
```

No hace falta moverlo de grupo: ya está en "Relevamiento", que es el grupo correcto según el checklist.

## 3. Contrato de API consumido

Fuente exacta: `../seguridad/specs/accesos.md` secciones 2, 3 y 5.

- `GET /projects/:projectId/accesos` → lista de `AccessPointEntry` del proyecto en el orden de inserción. Sin ningún `.sort()` aplicado por el backend (igual que Perímetro, a diferencia de Activos que ordena por criticidad). La UI tampoco reordena en el cliente.
- `POST /projects/:projectId/accesos` → body: `nombre` (requerido, string), resto opcionales según tabla de la sección 2 de `accesos.md`. Los 12 booleanos (`barreras`, `portones`, `molinetes`, `biometria`, `rfid`, `qr`, `app`, `validManual`, `registroNube`, `lpr`, `ups`, `generador`) nacen `false` por defecto si no se envían.
- `PATCH /projects/:projectId/accesos/:id` → actualización parcial.
- `DELETE /projects/:projectId/accesos/:id`.
- `POST /projects` (creación de proyecto) **no** crea ninguna `AccessPointEntry` automática — el array nace vacío. El estado "vacío" es el caso normal de un proyecto recién creado.

### Catálogos

| Endpoint | Valores | Campo que puebla |
|---|---|---|
| `GET /catalogs/accesos_tipo` | `Principal,Secundario,Servicio,Proveedores,Emergencia,Peatonal,Vehicular` (7 valores) | `tipo` |
| `GET /catalogs/accesos_ctrlPeatonal` | `Completo,Parcial,Inexistente` | `ctrlPeatonal` |
| `GET /catalogs/accesos_ctrlVehicular` | `Completo,Parcial,Inexistente` | `ctrlVehicular` |
| `GET /catalogs/accesos_congestion` | `Baja,Media,Alta` (3 valores, sin "Critica") | `congestion` |
| `GET /catalogs/accesos_trazabilidad` | `Completa,Parcial,Nula` | `trazabilidad` |

`accesos_ctrlPeatonal` y `accesos_ctrlVehicular` comparten los mismos valores de texto pero son entradas de catálogo independientes — se fetchean con dos llamadas separadas y pueblan `<Select>` distintos, sin mezclar (igual criterio que `perimetro_estado`/`perimetro_iluminacion`).

No hay campos calculados de solo lectura — todo el body es editable por el analista. `vulns` y `riesgo` son texto libre (Textarea), no relaciones a `VulnerabilityEntry` ni catálogos.

## 4. Mobile-first: criterio de layout

Mismo patrón que `PerimeterList`/`AssetList`: cards apiladas en mobile, tabla desde `md:`.

### Lista

- **Card (mobile, `< md`)**: `nombre` como título, `tipo` como subtítulo (si existe), `congestion` como indicador visual (ver nota abajo), extracto de `riesgo` truncado si existe, botones "Editar"/"Borrar" siempre visibles (no hover-only).
- **Tabla (`md:` en adelante)**: columnas **Nombre / Tipo / Biometría / LPR / Congestión / Acciones** — mismo subconjunto de 5 campos que usa el informe técnico (`accesos.md` sección 4.6: Nombre/Tipo/Biometría/LPR/Congestion), más la columna Acciones. Los 19 campos restantes no se muestran en la grilla — se editan solo en el form.
- El orden de filas/cards es el que devuelve el `GET` (orden de inserción) — la UI no aplica ningún `.sort()` propio.
- **Indicador visual de congestión**: `congestion` tiene solo 3 valores (`Baja/Media/Alta`), sin "Critica". `CriticalityBadge` acepta cualquier string y solo muestra el fallback "Sin dato" para valores no reconocidos — los 3 valores de `accesos_congestion` sí están en su mapa de estilos (`Baja` → verde, `Media` → amarillo, `Alta` → naranja). Se usa `CriticalityBadge` tal cual sin modificarlo: los 3 valores mapean correctamente a sus colores y el nivel "Critica" (rojo) simplemente no aparece en este módulo porque el catálogo no lo incluye. No se crea un componente nuevo ni se modifica `CriticalityBadge`.
- Los campos booleanos `biometria` y `lpr` se muestran en la tabla como texto `"Sí"/"No"`, igual que en el informe (`accesos.md` sección 4.6).

### Form — organización en bloques temáticos

Con 24 campos es el form más largo hasta ahora. Se organiza en 5 bloques para evitar un bloque único de 24 filas sueltas, siguiendo el mismo criterio de `PerimeterForm` (18 campos, 6 bloques):

1. **Identificación del acceso**
   - `nombre` (`Input`, ancho completo, único requerido — label "Nombre del acceso")
   - `tipo` (`Select` con `accesos_tipo`, 7 opciones)
   - `carriles` (`Input` tipo número, label "Carriles/dársenas")
   - `uso` (`Input` texto libre, label "Uso")

2. **Control de acceso**
   - `ctrlPeatonal` (`Select` con `accesos_ctrlPeatonal`) y `ctrlVehicular` (`Select` con `accesos_ctrlVehicular`) en grid `sm:grid-cols-2`
   - Fila de checkboxes de controles físicos (`flex flex-wrap gap-4`): `barreras`, `portones`, `molinetes`
   - Fila de checkboxes de identificación electrónica (`flex flex-wrap gap-4`): `biometria`, `rfid`, `qr`, `app`, `validManual`

3. **Protocolos**
   - `protoVisitas` (`Textarea`, label "Protocolo de visitas", ancho completo)
   - `protoProv` (`Textarea`, label "Protocolo de proveedores", ancho completo)
   - `registroNube` (`Checkbox`, label "Registro en nube")

4. **Equipamiento y monitoreo**
   - `camaras` (`Input` texto libre, label "Cámaras asociadas") y `lpr` (`Checkbox`, label "LPR") en la misma fila o sección contigua
   - `ups` (`Checkbox`, label "UPS") y `generador` (`Checkbox`, label "Generador") en fila `flex flex-wrap gap-4`
   - `congestion` (`Select` con `accesos_congestion`, label "Nivel de congestión")
   - `trazabilidad` (`Select` con `accesos_trazabilidad`, label "Trazabilidad")

5. **Hallazgos**
   - `vulns` (`Textarea`, label "Vulnerabilidades detectadas", ancho completo)
   - `riesgo` (`Textarea`, label "Riesgo asociado", ancho completo)

El bloque 5 va al final, separado del resto, por ser el campo de resumen analítico que se refleja en la columna `riesgo` citada en `lf` del legado (`accesos.md` sección 2).

## 5. Componentes

```
src/
  lib/api/
    accesos.ts            tipos + cliente + hooks de TanStack Query (mismo patron que assets.ts/perimeter.ts)
  components/
    AccessPointForm.tsx   form crear/editar entrada (24 campos de accesos.md seccion 2)
    AccessPointList.tsx   listado (card en mobile, tabla en md+), respeta el orden del GET
  app/
    proyectos/[id]/accesos/page.tsx
```

Componentes reutilizados de `src/components/` y `src/components/ui/`:
- `CriticalityBadge` (ya en `src/components/CriticalityBadge.tsx`, renombrado desde `AssetCriticalityBadge` — resuelto en Perímetro) para pintar `congestion`.
- `Card`/`CardContent`, `Table`/`TableBody`/`TableCell`/`TableHead`/`TableHeader`/`TableRow`.
- `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` (5 instancias en el form: `tipo`, `ctrlPeatonal`, `ctrlVehicular`, `congestion`, `trazabilidad`).
- `Checkbox` (ya instalado, usado en Metodología y Perímetro) — 12 instancias en el form.
- `Textarea` (ya instalado) — 4 instancias: `protoVisitas`, `protoProv`, `vulns`, `riesgo`.
- `Input`, `Label`, `Button`.

No requiere instalar ningún componente shadcn nuevo.

## 6. Estados a manejar

Mismo patrón ya fijado en Proyectos/Mosler/Tiempos/Metodología/Activos/Perímetro (nunca mostrar "cargando" y error simultáneamente):

- **Cargando**: mensaje/skeleton simple mientras `entries === undefined` y no hay error.
- **Vacío**: mensaje + CTA ("Todavía no hay accesos cargados. Agregar uno."). Es el estado normal de cualquier proyecto recién creado — no hay seed, se trata como caso esperado y frecuente, no un caso límite raro.
- **Error de red/API (lista)**: mensaje de error legible, no JSON/stack crudo.
- **Error de red/API (catálogos)**: con 5 catálogos a cargar, si alguno falla la UI debe poder seguir mostrando el form con los demás `Select` poblados — no bloquear todo el form por un solo catálogo caído. Mismo criterio que `PerimeterForm` con 8 catálogos y `AssetForm` con 4. El `Select` del catálogo caído queda vacío o muestra un estado de error inline sin impedir que el resto del form funcione.
- **Error de mutación (POST/PATCH/DELETE)**: mensaje de error inline, no toast bloqueante. La lista no se invalida hasta confirmar respuesta 2xx.
- **Validación de formulario**: único campo requerido es `nombre` (igual que el backend — `POST` sin `nombre` devuelve 400). `carriles` se envía como número si se completa, no string. Los 12 booleanos se envían como `false` por defecto si no se tocan (no `undefined`). Los 4 Textarea y el `Input` de `camaras` se envían como string vacío o `null` si no se completan — consistente con la convención del backend (`text` nullable).

## 7. Criterios de aceptación

1. `AccessPointForm` no permite submit si falta `nombre` — muestra error inline y no llama a `onSubmit`.
2. `AccessPointForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado: `nombre` (string), `carriles` (número, no string), los 12 booleanos como `boolean` y los 5 `Select` como string, sin campos calculados (este módulo no tiene ninguno).
3. `AccessPointForm` con `initial` precarga los 24 campos, incluyendo los 12 `Checkbox` reflejando su valor booleano real (`true`/`false`).
4. `AccessPointForm` sin tocar ningún `Checkbox` envía los 12 como `false` (default, no `undefined`): `barreras: false`, `portones: false`, `molinetes: false`, `biometria: false`, `rfid: false`, `qr: false`, `app: false`, `validManual: false`, `registroNube: false`, `lpr: false`, `ups: false`, `generador: false`.
5. `AccessPointForm` puebla los 5 `Select` (`tipo`, `ctrlPeatonal`, `ctrlVehicular`, `congestion`, `trazabilidad`) con los valores recibidos de sus respectivos catálogos — mocks independientes para cada uno, sin mezclar `accesos_ctrlPeatonal` con `accesos_ctrlVehicular` aunque tengan los mismos valores de texto.
6. `AccessPointForm` con `accesos_tipo` mockeado devuelve exactamente 7 opciones terminando en "Vehicular".
7. `AccessPointForm` con `accesos_congestion` mockeado devuelve exactamente 3 opciones (`Baja,Media,Alta`), sin "Critica".
8. `AccessPointList` renderiza una fila/card por entrada recibida, en el mismo orden en que llegan — test con lista mock en orden arbitrario, verificando que el primer elemento renderizado es el primero del array recibido (sin reordenar).
9. `AccessPointList` muestra estado vacío con CTA cuando la lista es `[]`, sin mostrarlo como error.
10. `AccessPointList` muestra `CriticalityBadge` con el valor correcto para `Baja`, `Media` y `Alta` en el campo `congestion`. Para `null`/`undefined` muestra el fallback "Sin dato".
11. `AccessPointList` muestra `biometria` y `lpr` como texto "Sí"/"No" en la columna correspondiente de la tabla desktop.
12. En viewport mobile (`< md`), `AccessPointList` no renderiza la tabla (`<table>` ausente u oculta) — se prueba vía clases/estructura, no pixel-perfect.
13. La tabla desktop de `AccessPointList` muestra exactamente las columnas Nombre / Tipo / Biometría / LPR / Congestión / Acciones, en ese orden.
14. `npm run build` compila sin errores.

## 8. Fuera de alcance

- Cálculo o visualización de completitud (peso 6), checklist "Accesos con protocolo de visitas", conteo en "Chart 3" del dashboard — son responsabilidad de los módulos transversales cuando se aborden.
- Render de la sección "12. Control de Accesos" del informe técnico — pertenece al módulo de Informe.
- Vinculación normalizada entre accesos y vulnerabilidades — el backend modela `vulns` como texto libre, la UI no agrega combobox ni FKs que el contrato no tiene.
- Edición de catálogos desde la UI — catálogos de solo lectura en el frontend (misma convención que todos los módulos anteriores).
- Reordenamiento manual de entradas (no hay drag-and-drop ni control de orden manual; el orden es el de inserción).
- Relación con el futuro módulo de Monitoreo/CCTV más allá de la coincidencia de campos `camaras`/`lpr` ya señalada en `accesos.md` sección 8.

## 9. Preguntas abiertas

Ninguna pendiente. El contrato de backend (`accesos.md`), los catálogos y las convenciones ya establecidas en este repo resuelven todos los puntos del spec. En particular:

- `CriticalityBadge` ya fue renombrado (resuelto al cerrar `perimetro-ui.md`) y sus 3 valores activos de `accesos_congestion` (`Baja/Media/Alta`) mapean directamente a los estilos existentes — no se modifica el componente.
- La asimetría `protoVisitas`/`protoProv` del checklist de backend (solo `protoVisitas` se verifica en `rChecklist`, no `protoProv`) es una regla de negocio del backend; la UI los trata a ambos como Textarea normales sin diferenciación visual.
- El campo `camaras` es texto libre (`Input`), no una relación al módulo de CCTV — se transcribe literal sin agregar un selector de entidades que el contrato no tiene.
