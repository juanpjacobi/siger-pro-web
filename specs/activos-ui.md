# Spec: UI de Activos Protegidos

Estado: implementado y aprobado.
Repo: `seguridad-web` (frontend). Contraparte de backend: `seguridad` → `specs/activos.md` (estado: aprobado, `BE [x]` en `MODULES_CHECKLIST.md`).

## 1. Propósito

Permite, dentro de un proyecto, identificar y mantener la lista de qué se protege (personas, bienes, infraestructura, sistemas, información, etc.), con su exposición y prioridad, para alimentar luego completitud/checklist/dashboard/informe técnico. Igual que Metodología, es un CRUD de lista sin cálculos propios — la UI no calcula nivel de riesgo, solo muestra y edita los campos que ya define el backend.

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos/[id]/activos` | Lista de `AssetEntry` del proyecto, ya ordenada por criticidad descendente (la trae así el `GET`, ver sección 3), con acceso a agregar/editar/borrar. Comparte `layout.tsx` con el resto de módulos por-proyecto (solo header del proyecto — sin nav secundaria, ver `proyectos-ui.md` nota 2026-06-26). |

Se agrega como card de acceso en `/proyectos/[id]` (página de Resumen, constante `MODULES` de `src/app/proyectos/[id]/page.tsx`):

```ts
{
  label: "Activos Protegidos",
  suffix: "/activos",
  icon: ShieldAlert,
  description: "Que se protege: personas, bienes, infraestructura, sistemas, informacion",
},
```

En `src/components/app-sidebar.tsx`, el ítem "Activos Protegidos" del grupo "Relevamiento" hoy está deshabilitado (sin `href`, ver línea 73 de `app-sidebar.tsx` al momento de escribir este spec). Pasa a usar `projectScoped("/activos")`, igual patrón que "Marco Teorico"/"Matriz Mosler":

```ts
{ label: "Activos Protegidos", href: projectScoped("/activos"), icon: ShieldAlert },
```

No hace falta moverlo de grupo: ya está en "Relevamiento", que es el grupo correcto según el checklist.

## 3. Contrato de API consumido

Fuente exacta: `../seguridad/specs/activos.md` secciones 2, 3 y 5.

- `GET /projects/:projectId/activos` → lista de `AssetEntry` **ya ordenada por criticidad descendente** por el backend (`exposicion` con fallback a `prioridad`, vía `critVal`: `Critica=4,Alta=3,Media=2,Baja=1`, no reconocido=0). La UI **no reordena en el cliente**: respeta el orden recibido tal cual (ver sección 4).
- `POST /projects/:projectId/activos` → body: `nombre` (requerido, string), resto opcionales: `tipo`, `ubicacion`, `valorCualitativo`, `valorEconomico` (numérico), `exposicion`, `amenazas` (texto libre), `vulnerabilidades` (texto libre), `controles`, `impacto`, `prioridad`, `obs`.
- `PATCH /projects/:projectId/activos/:id` → actualización parcial.
- `DELETE /projects/:projectId/activos/:id`.
- `GET /catalogs/activos_tipo` → 16 strings, termina en `"Otro"`. Puebla el `<select>` de `tipo`.
- `GET /catalogs/activos_valorCualitativo` → 4 strings (`Bajo,Medio,Alto,Critico`). Puebla `valorCualitativo`.
- `GET /catalogs/activos_exposicion` → 4 strings (`Baja,Media,Alta,Critica`). Puebla `exposicion`.
- `GET /catalogs/activos_prioridad` → 4 strings (`Baja,Media,Alta,Critica`). Puebla `prioridad`.
- `POST /projects` (creación de proyecto) **no** crea ninguna `AssetEntry` automática — a diferencia de Metodología, el array nace vacío. El estado "vacío" de esta UI es el caso normal de un proyecto recién creado, no una excepción (ver sección 6).

No hay campos calculados de solo lectura en este módulo (a diferencia de Mosler/Tiempos) — todo el body de la entrada es editable por el analista. `amenazas` y `vulnerabilidades` son texto libre, no relaciones a `MoslerEntry`/`VulnerabilityEntry` — el form los trata como `Textarea` simples, sin combobox ni FK.

## 4. Mobile-first: criterio de layout

Mismo patrón que `MoslerList`/`AdversaryTimeList`/`MethodologyList`: cards apiladas en mobile, tabla desde `md:`.

- **Card (mobile)**: `nombre` como título, `tipo` como subtítulo/badge, `ubicacion` si existe, `exposicion`/`prioridad` visibles en la card (ver nota de badge abajo), extracto de `amenazas`/`impacto` si existen, botones "Editar"/"Borrar" siempre visibles (no hover-only).
- **Tabla (`md:` en adelante)**: columnas `Nombre` / `Tipo` / `Sector` (`ubicacion`) / `Exposición` / `Prioridad` / `Acciones`, mismo orden de columnas que usa el informe técnico para la tabla de activos (`genRpt`, ver `activos.md` sección 4.7: Activo/Tipo/Sector/Exposición/Prioridad/Amenazas/Vulnerabilidades — la UI omite Amenazas/Vulnerabilidades en la grilla principal por ser texto largo, igual criterio que Mosler no mostrando `medidas` completo en la tabla). `valorEconomico`, `amenazas`, `vulnerabilidades`, `controles`, `impacto`, `obs` no se listan en la tabla — se editan en el form.
- El orden de filas/cards es el que devuelve el `GET` (criticidad descendente, ya resuelto por el backend) — la UI no aplica ningún `.sort()` propio sobre la lista recibida.
- **Indicador visual de criticidad** (decisión del usuario, sección 9): `exposicion` y `prioridad` se muestran cada uno con su propio `AssetCriticalityBadge`, **sin fallback entre sí** (el fallback `exposicion→prioridad` es solo el criterio de orden que ya aplica el backend, no determina qué se pinta) — mapea el valor textual (`Baja/Media/Alta/Critica`) a la misma paleta de 4 colores que ya usan `RiskBadge`/`TimeStatusBadge`, como componente nuevo propio de este módulo (ver sección 5).
- Form de alta/edición: un campo por fila en mobile (`grid-cols-1`); `sm:grid-cols-2` para los 4 selects de catálogo (`tipo`, `valorCualitativo`, `exposicion`, `prioridad`) y `valorEconomico`; `amenazas`/`vulnerabilidades`/`controles`/`impacto`/`obs` son `Textarea` de ancho completo siempre (igual criterio que los campos largos de `ProjectForm`/`MoslerForm`).

## 5. Componentes

```
src/
  lib/api/
    assets.ts             tipos + cliente + hooks de TanStack Query (mismo patron que mosler.ts/methodology.ts)
  components/
    AssetCriticalityBadge.tsx   badge de color segun exposicion/prioridad (Baja/Media/Alta/Critica)
    AssetForm.tsx          form crear/editar entrada (12 campos de la tabla de activos.md seccion 2)
    AssetList.tsx          listado (card en mobile, tabla en md+), respeta el orden del GET
  app/
    proyectos/[id]/activos/page.tsx
```

Reusa: `Card`/`CardContent`, `Table`/`TableBody`/`TableCell`/`TableHead`/`TableHeader`/`TableRow`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Textarea`, `Input`, `Label`, `Button`, `Badge` de shadcn/ui, `useCatalog` de `src/lib/api`. No requiere instalar ningún componente shadcn nuevo (a diferencia de Metodología, que sumó `Checkbox`) — los 4 catálogos se cubren con `Select`, ya instalado.

## 6. Estados a manejar

Mismo patrón ya fijado en Proyectos/Mosler/Tiempos/Metodología (nunca mostrar "cargando" y error simultáneamente):

- **Cargando**: mensaje/skeleton simple mientras `entries === undefined` y no hay error.
- **Vacío**: mensaje + CTA ("Todavía no hay activos cargados. Agregar uno."). A diferencia de Metodología (donde el vacío es excepcional por el seed automático), acá **es el caso normal** para cualquier proyecto recién creado — no hay seed, así que esta pantalla debe tratarlo como un estado esperado y frecuente, no un error ni un caso límite raro.
- **Error de red/API** (lista, catálogos o mutación): mensaje de error legible, no JSON/stack crudo. Con 4 catálogos a cargar, si alguno falla la UI debe poder seguir mostrando el form con los demás selects poblados (no bloquear todo el form por un solo catálogo caído) — mismo criterio que `amenazasError` en `MoslerForm`.
- **Validación de formulario**: único campo requerido es `nombre` (igual que el backend, sección 6 del spec — `POST` sin `nombre` devuelve 400). El resto son opcionales, sin validación de formato salvo `valorEconomico` que debe enviarse como número si se completa (no string).

## 7. Criterios de aceptación (testeables)

1. `AssetForm` no permite submit si falta `nombre` — muestra error inline y no llama a `onSubmit`.
2. `AssetForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado (12 campos de la sección 2 de `activos.md`, `valorEconomico` como número, no string), sin campos calculados (este módulo no tiene ninguno).
3. `AssetForm` con `initial` precarga los 12 campos.
4. `AssetForm` puebla los 4 `Select` (`tipo`, `valorCualitativo`, `exposicion`, `prioridad`) con los valores recibidos de sus respectivos catálogos (mocks independientes para cada uno).
5. `AssetList` renderiza una fila/card por entrada recibida, **en el mismo orden en que llegan** (sin reordenar en el cliente) — test con una lista mock ya ordenada por criticidad descendente, verificando que el primer elemento renderizado es el primero del array recibido.
6. `AssetList` muestra un estado vacío con CTA cuando la lista es `[]`, sin mostrarlo como error.
7. `AssetCriticalityBadge` renderiza el color/texto correcto para los 4 valores posibles (`Baja/Media/Alta/Critica`) y un fallback neutral si el valor es vacío/no reconocido (mismo criterio que `critVal` en el backend, que no rompe con valores no reconocidos).
8. En viewport mobile (< 640px), `AssetList` no renderiza la tabla (`<table>` ausente u oculta) — se prueba vía clases/estructura, no pixel-perfect.
9. `npm run build` compila sin errores.

## 8. Fuera de alcance de este spec

Cálculo o visualización de completitud/checklist de calidad/`assetsHigh` derivados de este módulo (ver `activos.md` sección 4) — son responsabilidad de los módulos transversales de Dashboard/Checklist cuando se aborden. Render de la sección "7. Activos protegidos y nivel de exposición" del informe técnico — pertenece al módulo de Informe. Vinculación normalizada entre activos y amenazas/vulnerabilidades/medidas de tratamiento — el backend las modela como texto libre, la UI no agrega comboboxes ni FKs que el contrato no tiene. Edición de catálogos desde la UI (mismo criterio que Mosler/Tiempos/Metodología: catálogos de solo lectura desde el frontend). Reordenamiento manual de las entradas (el orden lo decide el backend por criticidad, sin drag-and-drop ni control de orden manual en la UI).

## 9. Preguntas abiertas

Ninguna pendiente. **Decisión del usuario (2026-06-27)**: sí se implementa `AssetCriticalityBadge`. Ambos campos (`exposicion` y `prioridad`) se muestran cada uno con su propio badge de color, **sin fallback entre sí** — el fallback `exposicion→prioridad` es exclusivamente el criterio de *ordenamiento* que ya aplica el backend (`critVal`, ver sección 3), no determina qué campo se pinta: cada campo mapea su propio valor textual (`Baja/Media/Alta/Critica`) a la paleta de 4 colores ya establecida por `RiskBadge`/`TimeStatusBadge`.
