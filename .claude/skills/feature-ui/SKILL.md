---
name: feature-ui
description: Orquesta el ciclo spec-driven + TDD para construir la UI de un módulo cuyo backend ya está aprobado en siger-pro-api. Usar cuando el usuario pida migrar/implementar la UI de un módulo (ej. "/feature-ui activos", "/feature-ui spf").
---

# /feature-ui — ciclo spec → TDD → review, para frontend

Equivalente de `/feature` (repo backend) pero para `seguridad-web`. Mismo principio: el spec se escribe **antes** del código, con estado `propuesto`, y el gate de cierre es automático (spec trazable + tests en verde + review aprobado), no una pausa para que el usuario opine.

## Precondición

El módulo debe estar `BE [x]` en `../seguridad/specs/MODULES_CHECKLIST.md`. Si no lo está, parar y decir que falta el backend primero — no se puede especificar ni construir una UI cuyo contrato de API no existe todavía.

## Input

El argumento del skill es el nombre del módulo, tal como aparece en `../seguridad/specs/MODULES_CHECKLIST.md` (ej. `activos`, `spf`, `vulnerabilidades`).

## Pasos

1. **Spec.** Invocar al subagente `spec-writer-ui` con el nombre del módulo. Debe producir `specs/<modulo>-ui.md` con estado `propuesto`, siguiendo la plantilla de `specs/proyectos-ui.md`, citando el contrato de `../seguridad/specs/<modulo>.md`.

2. **Gate — spec trazable, no aprobación humana.** El gate real es: ¿el spec referencia correctamente el contrato de backend y no quedan "Preguntas abiertas"? Si es así, avanzar directo al paso 3 **sin pedirle aprobación al usuario**. Solo usar `AskUserQuestion` si `spec-writer-ui` dejó preguntas abiertas reales.

3. **TDD.** Invocar al subagente `developer-ui` con el spec. Debe: escribir tests de componente primero (Jest + React Testing Library), confirmar que fallan, implementar lo mínimo para que pasen, siguiendo las convenciones ya establecidas (mobile-first, shadcn/ui, cliente de `lib/api.ts`).

4. **Review — gate de cierre.** Invocar al subagente `reviewer-ui` con el spec y el diff resultante. Si el veredicto es "No aprobado" o "Aprobado con observaciones" bloqueantes, volver al paso 3. Si es "Requiere decisión humana", recién ahí escalar con `AskUserQuestion`.

5. **Cierre.** El paso 4 ya debe haber actualizado el estado del spec a `implementado y aprobado` y marcado `FE` en `../seguridad/specs/MODULES_CHECKLIST.md`. Confirmarle al usuario que la UI del módulo quedó migrada, con un resumen de qué páginas/componentes se agregaron, y qué módulo conviene encarar a continuación según el "Orden sugerido" del checklist.

## Reglas del orquestador

- El gate de aprobación es automático (spec trazable al contrato de backend + tests en verde + review aprobado), no una pausa para que el usuario opine sobre el diseño.
- La única razón legítima para usar `AskUserQuestion` en este flujo es una pregunta abierta real o una contradicción spec-vs-backend sin resolver.
- Un módulo de UI no se considera terminado hasta que `reviewer-ui` lo apruebe explícitamente.
