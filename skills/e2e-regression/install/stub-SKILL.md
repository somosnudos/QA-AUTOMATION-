---
name: e2e-regression
description: >-
  Construye y extiende la regresión E2E (Playwright) de este frontend a partir de
  una historia de Jira, siguiendo la convención de Bord (Page Object Model, auth
  por storageState, pipeline con gate de merge) y la disciplina de QA (spec-first
  + El Consejo + mentalidad escéptica). Úsalo para automatizar pruebas end-to-end,
  cubrir un módulo con regresión, o montar el pipeline E2E si el repo no lo tiene.
---

# E2E Regression (referencia al skill central)

Este es un **stub**. El método completo vive en `somosnudos/QA-AUTOMATION-`
bajo `skills/e2e-regression/` y se mantiene en un solo lugar.

## Antes de trabajar — traé el método canónico

```bash
bash scripts/sync-e2e-skill.sh
```

Eso descarga la versión vigente del skill en `.e2e-skill/` (gitignored).
**Después seguí `.e2e-skill/SKILL.md`** y sus `references/` y `templates/` como si
fueran parte de este skill. Si `.e2e-skill/` ya existe, el script lo actualiza.

## Config específica de este repo

> Completá esto la primera vez que se adopta el skill (queda versionado con el repo).

- **Gestor de paquetes / Node:** <yarn|npm> · Node <versión>
- **Puerto del preview:** <p.ej. 3001>
- **Ruta del dashboard tras login:** </nodi/dashboard | /home>
- **Módulos críticos (orden de regresión):** 1. login · 2. <…>
- **Secrets cargados en GitHub:** ENV_FILE, PW_EMAIL, PW_PASSWORD, AWS_* (sí/no)
- **Gate en `develop` activo:** (sí/no) — ver `.e2e-skill/references/ci-pipeline.md`
