# Spec — <módulo>

- **Jira:** <KEY> — <título de la historia>
- **Figma:** <link, si aplica>
- **Ruta en la app:** /<ruta>
- **Rol(es):** <admin / usuario / …>
- **Particularidades:** <feature flags, datos de prueba, permisos por rol>

## Descripción

<Qué hace el módulo, en lenguaje claro. Sale de la historia de Jira, no se
inventa. Si es solo informativo o permite acciones, decilo.>

## Criterios de aceptación

> Cada criterio = al menos una aserción en el test. Los define el negocio
> (Jira / usuario), nunca el agente.

| # | Criterio de aceptación | Test que lo cubre |
|---|---|---|
| CA-1 | <lo que debe cumplirse> | `@unreviewed <título>` |
| CA-2 | <…> | |
| CA-3 | <…> | |

## Caminos negativos y bordes (para El Consejo 🔴)

- <input inválido, estado vacío, sin permiso, doble clic, sesión vencida…>

## Fuera de alcance

- <lo que este spec explícitamente NO cubre>
