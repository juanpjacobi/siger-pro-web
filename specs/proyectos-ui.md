# Spec: UI de Proyectos

Estado: implementado y aprobado (verificado: build + tests en verde).
Repo: `seguridad-web` (frontend). Contraparte de backend: `siger-pro-api` → `specs/proyectos.md`.

## 1. Propósito

Proyecto es la entidad raíz de todo el sistema. Esta UI reemplaza el form inline que vivía en `/proyectos` (correcto cuando el modelo era un stub de 2 campos, ya no escala a los ~18 campos reales del legado) por un flujo de alta/edición en páginas separadas, dejando la lista limpia.

## 2. Páginas y rutas

| Ruta | Qué muestra |
|---|---|
| `/proyectos` | Lista de proyectos (solo lectura) + botón "Nuevo" |
| `/proyectos/nuevo` | Form completo de alta. Al guardar, redirige a `/proyectos/:id` |
| `/proyectos/:id` | Detalle: header con nombre/cliente/tipo/ubicación + botón "Editar", debajo los tabs de Mosler/Tiempos Adversario (sin cambios respecto al spec anterior) |
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

## 6. Fuera de alcance de este spec

Validación de formato de campos numéricos más allá de "es un número" (rangos, etc.) — no la pide el legado tampoco. Confirmación antes de navegar fuera del form con cambios sin guardar (UX deseable, no crítico ahora).
