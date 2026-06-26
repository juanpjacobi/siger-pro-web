# Spec: UI de Proyectos

Estado: implementado y aprobado (verificado: build + tests en verde).
Repo: `seguridad-web` (frontend). Contraparte de backend: `siger-pro-api` → `specs/proyectos.md`.

> Actualizado 2026-06-25: se introduce el concepto de "proyecto activo" en el sidebar (ver §2 y §6). El sidebar deja de ser estático: cuando la URL está dentro de `/proyectos/[id]/...`, los módulos de "Análisis" que ya existen (Mosler, Tiempos) se habilitan apuntando a ese proyecto, y el header del sidebar muestra el nombre del proyecto activo con un link para cambiarlo (vuelve a `/proyectos`). No se usa un selector global de proyecto (estado en memoria/localStorage) — el contexto vive en la URL, vía `usePathname()` + el mismo hook `useProject(id)` que ya usan las páginas (TanStack Query deduplica el fetch). Decisión tomada explícitamente para no replicar el selector global del legado, que mezclaba el estado del proyecto activo con el resto de la app.
>
> Actualizado 2026-06-26: se quita la navegación secundaria (fila de tabs) de `/proyectos/[id]/layout.tsx` — quedaba redundante con el sidebar, que ya lista los módulos del proyecto activo y escala mejor a los ~20 módulos del checklist (una fila de tabs horizontal no escala igual). `layout.tsx` ahora solo pone el header del proyecto (nombre/cliente/tipo/ubicación + botón Editar); la navegación entre módulos vive únicamente en el sidebar. De paso se corrigió el cálculo de `isActive` del sidebar (antes usaba `startsWith` sin límite de borde, por lo que un módulo podía quedar marcado activo en una ruta hermana; ahora exige coincidencia exacta o el siguiente carácter `/`).

## 1. Propósito

Proyecto es la entidad raíz de todo el sistema. Esta UI reemplaza el form inline que vivía en `/proyectos` (correcto cuando el modelo era un stub de 2 campos, ya no escala a los ~18 campos reales del legado) por un flujo de alta/edición en páginas separadas, dejando la lista limpia.

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos` | Lista de proyectos (solo lectura) + botón "Nuevo" |
| `/proyectos/nuevo` | Form completo de alta. Al guardar, redirige a `/proyectos/:id` |
| `/proyectos/:id` | Resumen del proyecto: header (nombre/cliente/tipo/ubicación + botón "Editar") + cards de acceso a sus módulos (Mosler, Tiempos Adversario) |
| `/proyectos/:id/mosler`, `/proyectos/:id/tiempos` | Módulos del proyecto, como rutas propias (ya no son tabs en una sola página, ver `mosler-tiempos-ui.md`) — comparten `layout.tsx` con el header del proyecto; la navegación entre módulos es solo el sidebar (ver nota 2026-06-26) |
| `/proyectos/:id/editar` | Mismo form que "nuevo", precargado con los datos del proyecto. Al guardar, redirige a `/proyectos/:id` |

## 3. Contrato de API consumido

- `GET /projects/:id` (nuevo) — usado por el header de detalle y por la página de edición.
- `PATCH /projects/:id` (nuevo) — usado por la edición.
- `POST /projects` — body ahora acepta los 18 campos de `specs/proyectos.md` sección 2, no solo `nombre`/`cliente`.
- `GET /catalogs/proyecto_tipo` — puebla el select "Tipo de objetivo".

## 4. Componente compartido

`ProjectForm` (`src/components/ProjectForm.tsx`) se usa tanto en alta como en edición — recibe `initial?: Project` (si está presente, precarga los campos) y `onSubmit`. Mismo patrón que `MoslerForm`/`AdversaryTimeForm`.

Único campo requerido: `nombre` (igual que el backend). El resto son opcionales, mobile-first (`grid-cols-1` en mobile, `sm:grid-cols-2` para los campos cortos; los campos de texto largo —alcance, exclusiones, normativa, criterioAceptacion, obs— ocupan el ancho completo siempre, son `Textarea`).

## 5. Criterios de aceptación (testeables)

1. `ProjectForm` no permite submit si falta `nombre` — muestra error y no llama a `onSubmit`.
2. `ProjectForm`, al enviar con todos los campos completos, llama a `onSubmit` con el body esperado (tipos numéricos para superficie/perimetro/lotes/habitantes/accesos, no strings).
3. `ProjectForm` con `initial` precarga todos los campos, incluida la fecha en formato `YYYY-MM-DD` para el `<input type="date">`.
4. `npm run build` compila sin errores.

## 6. Sidebar contextual ("proyecto activo")

`src/components/app-sidebar.tsx` deriva el proyecto activo de la URL actual (`usePathname()` con regex `^/proyectos/([^/]+)`, excluyendo `/proyectos/nuevo`), no de un estado global:

- Sin proyecto activo: los ítems de módulos por-proyecto (hoy Mosler/Tiempos, después el resto del checklist) quedan deshabilitados (`disabled`, sin `href`).
- Con proyecto activo: esos ítems apuntan a `/proyectos/<id>/<modulo>`, y el header del sidebar muestra el nombre del proyecto (vía `useProject(id)`, mismo hook que usan las páginas — cache compartida, no se duplica el fetch) con un link "Cambiar" que vuelve a `/proyectos`.
- Los grupos "Relevamiento"/"Resultados" siguen deshabilitados independientemente del proyecto activo hasta que esos módulos existan — no es un problema de contexto, es que la página todavía no está construida.

Cada módulo nuevo que se agregue al checklist debe registrar su entrada en `buildNavGroups()` con `href: projectScoped("/<modulo>")` en vez de un `href` fijo, para mantener este comportamiento.

## 7. Fuera de alcance de este spec

Validación de formato de campos numéricos más allá de "es un número" (rangos, etc.) — no la pide el legado tampoco. Confirmación antes de navegar fuera del form con cambios sin guardar (UX deseable, no crítico ahora).
