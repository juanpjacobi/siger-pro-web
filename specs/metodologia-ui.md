# Spec: UI de Marco Teórico / Metodología

Estado: implementado y aprobado (preguntas abiertas resueltas por decisión directa del usuario, 2026-06-26, ver sección 9).
Repo: `seguridad-web` (frontend). Contraparte de backend: `seguridad` → `specs/metodologia.md` (estado: aprobado, `BE [x]` en `MODULES_CHECKLIST.md`).

## 1. Propósito

Permite, dentro de un proyecto, revisar las 10 entradas de marco metodológico sembradas automáticamente al crear el proyecto, togglear cuáles se aplicaron en el informe (`activo`) y editar sus observaciones/descripción/aplicación. A diferencia de Mosler/Tiempos, no hay ningún cálculo: la UI es un CRUD simple, sin badges de riesgo. La interacción principal esperada es marcar/desmarcar `activo` y escribir observaciones sobre las filas ya existentes, no necesariamente crear filas nuevas (aunque el contrato de API lo permite y la UI debe soportarlo).

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos/[id]/metodologia` | Lista de las `MethodologyEntry` del proyecto (las 10 sembradas + las que el analista agregue), con toggle de `activo` inline y acceso a editar/agregar/borrar. Comparte `layout.tsx` con el resto de módulos por-proyecto (header del proyecto + nav secundaria, ver `proyectos-ui.md` §6 y `mosler-tiempos-ui.md` §2). |

Se agrega como cuarta tab en `TABS` (`src/app/proyectos/[id]/layout.tsx`), después de "Tiempos Adversario":

```ts
const TABS = [
  { label: "Resumen", suffix: "" },
  { label: "Matriz Mosler", suffix: "/mosler" },
  { label: "Tiempos Adversario", suffix: "/tiempos" },
  { label: "Marco Teorico", suffix: "/metodologia" },
];
```

En `src/components/app-sidebar.tsx`, el ítem "Marco Teorico" ya existe en el grupo "General" pero hoy está deshabilitado (sin `href`, ver línea 65 de `app-sidebar.tsx` al momento de escribir este spec). Pasa a usar `projectScoped("/metodologia")`, igual patrón que "Matriz Mosler"/"Tiempos Adversario" en el grupo "Analisis":

```ts
{ label: "Marco Teorico", href: projectScoped("/metodologia"), icon: FileText },
```

Nota: esto mueve el comportamiento del ítem (de siempre-deshabilitado a project-scoped) pero no su ubicación en el grupo "General" — no hace falta moverlo al grupo "Analisis", el agrupamiento visual del sidebar es independiente de si depende de proyecto activo (Proyectos también vive en "General" y no depende de proyecto activo, así que no hay precedente que obligue a mover Marco Teorico a otro grupo).

## 3. Contrato de API consumido

Fuente exacta: `../seguridad/specs/metodologia.md` sección 5.

- `GET /projects/:projectId/metodologia` → lista de `MethodologyEntry` en orden de creación (las 10 sembradas primero, en el orden de la sección 2 del spec de backend). Campos relevantes para la UI: `id`, `enfoque`, `activo`, `descripcion`, `aplicacion`, `observaciones`.
- `POST /projects/:projectId/metodologia` → body: `enfoque` (requerido, string libre), `activo` (boolean, opcional, default `false`), `descripcion`/`aplicacion`/`observaciones` (opcionales, texto libre). Usado solo cuando el analista agrega un enfoque nuevo además de los 10 sembrados.
- `PATCH /projects/:projectId/metodologia/:id` → actualización parcial. Uso principal de la UI: togglear `activo` solo (sin abrir el form completo) y editar `observaciones`/`descripcion`/`aplicacion` vía el form.
- `DELETE /projects/:projectId/metodologia/:id`.
- `GET /catalogs/metodologia_enfoque` → array de 16 strings (orden fijo, termina en `"Otro"`). Puebla el `<select>` de `enfoque` en el form de alta/edición.

No hay campos calculados de solo lectura en este módulo (a diferencia de Mosler/Tiempos) — todo el body de la entrada es editable por el analista.

## 4. Mobile-first: criterio de layout

Mismo patrón que `MoslerList`/`AdversaryTimeList`: cards apiladas en mobile, tabla desde `md:`.

- **Card (mobile)**: `enfoque` como título, switch/checkbox de `activo` visible en la card (no oculto detrás de "Editar"), extracto de `observaciones` si existe, botones "Editar"/"Borrar" siempre visibles (no hover-only).
- **Tabla (`md:` en adelante)**: columnas `Enfoque` / `Activo` (checkbox inline) / `Observaciones` (truncado) / `Acciones`. No se listan `descripcion`/`aplicacion` en la tabla — son campos largos, se editan en el form, no se muestran en la grilla principal (mismo criterio que Mosler no mostrando `medidas` completo en la tabla, solo en el form).
- El toggle de `activo` es interactivo directamente desde la lista (tanto en card como en tabla), sin necesidad de abrir el form de edición — dispara un `PATCH {activo: !valor}` inmediato. Esto es una diferencia respecto a Mosler/Tiempos, donde todo cambio requiere abrir el form completo; aquí se justifica porque `activo` es la interacción más frecuente del módulo (ver Preguntas abiertas para el detalle de componente concreto de este toggle).
- Form de alta/edición: un campo por fila en mobile (`grid-cols-1`); `descripcion`/`aplicacion`/`observaciones` son `Textarea` de ancho completo siempre (igual criterio que los campos largos de `ProjectForm`).

## 5. Componentes

```
src/
  lib/api/
    methodology.ts          tipos + cliente + hooks de TanStack Query (mismo patrón que mosler.ts)
  components/
    MethodologyList.tsx      listado (card en mobile, tabla en md+), incluye el toggle inline de activo
    MethodologyForm.tsx      form crear/editar entrada (enfoque + activo + descripcion + aplicacion + observaciones)
  app/
    proyectos/[id]/metodologia/page.tsx
```

Reusa: `Card`/`CardContent`, `Table`/`TableBody`/`TableCell`/`TableHead`/`TableHeader`/`TableRow`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Textarea`, `Input`, `Label`, `Button` de shadcn/ui, `useCatalog` de `src/lib/api`.

**Componente nuevo a instalar** (confirmado por inventario de `src/components/ui/`: hoy solo existen `sheet`, `button`, `sidebar`, `table`, `tooltip`, `skeleton`, `tabs`, `separator`, `badge`, `card`, `select`, `textarea`, `label`, `input`):

- `Checkbox` de shadcn/ui (`npx shadcn@latest add checkbox`) para el toggle de `activo` — decisión del usuario, coincide con la metáfora de "tildar/destildar" del legado. No se instala `Switch`.

### Campo `enfoque`: catálogo + "Otro"

`enfoque` es texto libre en el backend (sección 3 del spec de backend), pero la UI lo controla con el `Select` de shadcn ya instalado — **decisión del usuario**: no se instala ningún combobox nuevo (`Command`/`Popover`).

- El `Select` se puebla con `GET /catalogs/metodologia_enfoque` (16 valores, incluyendo `"Otro"` como última opción).
- A diferencia de `amenaza`/`amenazaOtra` en Mosler, aquí **no hay campo dedicado** para el caso libre: si el analista elige `"Otro"`, el campo `enfoque` se guarda literal como `"Otro"`, y el detalle real del enfoque se redacta en `descripcion` (que ya existe) — así lo define el spec de backend, sección 2 "Decisión del usuario — opción Otro". El form no necesita lógica condicional adicional para este caso.
- Esto restringe de hecho la UI a las 16 opciones del catálogo (el backend acepta cualquier string, pero el `Select` no ofrece un input de texto libre) — aceptado explícitamente como trade-off de esta decisión, ya que minimiza componentes nuevos y el caso "no catalogado" queda cubierto igual vía `"Otro"` + `descripcion`.

## 6. Estados a manejar

Mismo patrón ya fijado en Proyectos/Mosler/Tiempos (nunca mostrar "cargando" y error simultáneamente):

- **Cargando**: mensaje/skeleton simple mientras `entries === undefined` y no hay error.
- **Vacío**: mensaje + CTA ("Todavía no hay enfoques cargados. Agregar uno."). En la práctica no debería ocurrir nunca para un proyecto recién creado (siembra automática de 10 filas), pero la UI debe soportar el caso (proyecto creado antes de que existiera el seed, o las 10 filas borradas manualmente).
- **Error de red/API** (lista, catálogo o mutación): mensaje de error legible, no JSON/stack crudo. Mismo criterio que `MoslerForm`/`amenazasError` para el catálogo.
- **Validación de formulario**: único campo requerido es `enfoque` (igual que el backend, sección 5 del spec — `POST` sin `enfoque` devuelve 400). El resto (`activo`, `descripcion`, `aplicacion`, `observaciones`) son opcionales, sin validación de formato.
- **Toggle inline de `activo`**: mientras el `PATCH` está en curso, deshabilitar el control para evitar doble-toggle; si falla, revertir el estado visual y mostrar un error breve (toast o mensaje inline), sin perder el resto de la lista ya renderizada.

## 7. Criterios de aceptación (testeables)

1. `MethodologyForm` no permite submit si falta `enfoque` — muestra error inline y no llama a `onSubmit`.
2. `MethodologyForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado (`enfoque`, `activo`, `descripcion`, `aplicacion`, `observaciones`), sin campos calculados (este módulo no tiene ninguno).
3. `MethodologyForm` con `initial` precarga los 5 campos (`enfoque`, `activo`, `descripcion`, `aplicacion`, `observaciones`).
4. `MethodologyForm` puebla el control de `enfoque` con los valores recibidos del catálogo (mock de 16 valores) y permite además un valor que no esté en esa lista (ver Preguntas abiertas para el mecanismo exacto del control).
5. `MethodologyList` renderiza una fila/card por entrada recibida, con el estado de `activo` reflejado correctamente, y un estado vacío cuando la lista es `[]`.
6. Togglear `activo` desde `MethodologyList` (sin abrir el form) dispara `PATCH /projects/:id/metodologia/:entryId` con `{activo: <nuevo valor>}` únicamente.
7. En viewport mobile (< 640px), `MethodologyList` no renderiza la tabla (`<table>` ausente u oculta) — se prueba vía clases/estructura, no pixel-perfect.
8. `npm run build` compila sin errores.

## 8. Fuera de alcance de este spec

Cálculo o visualización de completitud/checklist de calidad derivados de este módulo (`some(m=>m.activo)`, ver `specs/metodologia.md` sección 4) — son responsabilidad de los módulos transversales de Dashboard/Checklist cuando se aborden. Render de la sección "4. Metodología aplicada" del informe técnico — pertenece al módulo de Informe. Edición de catálogos desde la UI (mismo criterio que Mosler/Tiempos: catálogos de solo lectura desde el frontend). Reordenamiento manual de las entradas (el orden es el de creación, sin drag-and-drop).

## 9. Preguntas abiertas

Ninguna pendiente. Las dos que existían (componente para `enfoque`, componente para `activo`) fueron resueltas por decisión directa del usuario el 2026-06-26 y están incorporadas en la sección 5. El módulo está listo para pasar a `developer-ui`.
