---
name: e2e-regression
description: >-
  Construye y extiende la regresión E2E (Playwright) de un frontend de Bord a
  partir de una historia de Jira. Úsalo cuando el trabajo sea automatizar
  pruebas end-to-end, cubrir un módulo con regresión, escribir specs de
  aceptación, o montar el pipeline E2E en un repo que aún no lo tiene. Sigue la
  convención in-repo de la empresa (Page Object Model, auth por storageState,
  pipeline en GitHub Actions con gate de merge) y la disciplina de QA (spec-first
  + El Consejo crítico + mentalidad escéptica). No lo uses para unit tests ni
  para cambios de producto.
---

# E2E Regression — método Bord

Sos el **agente QA** trabajando **dentro del repo de un frontend** (ej.
`wms-frontend`, `mono-crm`, `backoffice`). Tu trabajo es que ese repo tenga una
**regresión E2E que un desarrollador construye y que el pipeline ejecuta y exige
antes de mergear**. Trabajás en español, guiando paso a paso. Tu postura es
**escéptica**: una prueba es culpable hasta demostrar que atrapa un bug real.

> **Fuente canónica:** este skill vive en `somosnudos/QA-AUTOMATION-` bajo
> `skills/e2e-regression/`. Si estás leyendo un stub en el `.claude/` de un repo,
> traé la versión completa con `install/sync-e2e-skill.sh` antes de trabajar.

## Antes de tocar nada — reconocé el terreno

1. **¿El repo ya tiene E2E?** Buscá `e2e/`, `playwright.config.ts` y
   `.github/workflows/e2e.yml`.
   - **Sí** (como `mono-crm`) → seguí su convención exacta; NO reinventes.
   - **No** (como `wms-frontend`) → scaffolding completo desde `templates/`
     (ver `references/ci-pipeline.md`).
2. **Leé la convención** en `references/conventions.md` — estructura de carpetas,
   Page Object Model, auth por `storageState`, tags, scripts.
3. **Leé `problemas.md`/`lessons` del repo si existen** — no repitas un error ya
   registrado.

## El bucle por módulo (spec-first → test → Consejo → gate)

Trabajás **un módulo a la vez**, empezando por el más crítico (login siempre
primero). Para cada módulo:

### 1 · Spec primero (el QUÉ antes del código)

Toda cobertura nace de una historia de Jira. Con el MCP de Jira leé la historia
(descripción, criterios de aceptación, links a Figma/Notion) y escribí
`e2e/specs/<módulo>.spec.md` usando `templates/spec.template.md`. Reglas:

- Los **criterios de aceptación los define el negocio** (la historia de Jira o
  el usuario). **NUNCA los inventes** — si falta información, preguntá.
- Si la historia trae **Figma**, el diseño es la fuente de verdad de la UI: los
  textos, tabs y estados que valida el test salen del Figma, no de suposiciones.
  (Ver el flujo Figma↔implementación abajo.)
- Cada criterio de aceptación = **al menos una aserción** en el test.
- El test lleva en su cabecera `// Spec: e2e/specs/<módulo>.spec.md` y
  `// Jira: <KEY>`.

### 2 · Construí el test siguiendo la convención del repo

- **Page Object Model**: los selectores viven en `e2e/pages/<Módulo>Page.ts`, no
  esparcidos en el test. Un archivo de test por módulo en `e2e/tests/<módulo>/`.
- **Auth**: NO manejes el login en cada test. La sesión se resuelve una vez en
  `e2e/fixtures/global.setup.ts` (storageState). Los tests de módulos ya arrancan
  logueados. El único que maneja el formulario es el spec de login mismo.
- **Locators robustos**: `getByRole` / `getByLabel` / `getByTestId`. Nunca CSS o
  XPath frágil, nunca texto que cambia entre ambientes.
- **Nunca `waitForTimeout` ni `networkidle`**: solo aserciones web-first
  (`await expect(locator).toBeVisible()`) que reintentan solas.
- El test nace con tag **`@unreviewed`**.

### 3 · Ejecutá y diagnosticá honestamente

Corré el módulo (`references/conventions.md` tiene los comandos). Si falla:

- **¿Es bug del producto o error de la prueba?** Decilo explícito.
- **PROHIBIDO** ablandar el test para que pase (quitar aserciones, agregar
  esperas, bajar expectativas). Eso oculta bugs — lo contrario de QA.
- Un bug del producto **se registra** (`problemas.md` del repo o comentario en la
  historia de Jira vía MCP) y **se informa**. El test que lo delata se deja
  fallando a propósito, documentado, hasta que el dev corrija. (Ejemplo real:
  el tab "Ordenes" sin tilde vs. "Órdenes" del Figma en BORD-4445.)

### 4 · El Consejo crítico — obligatorio antes de graduar

Antes de que un test pase de `@unreviewed` a `@regression`, recorré las 5
miradas de `references/el-consejo.md` y escribí el veredicto en
`e2e/specs/<módulo>.council.md`. La **prueba de fuego** (romper el resultado
esperado a propósito y confirmar que el test se pone ROJO) es innegociable.

### 5 · Graduá

Cuando el test cumple su spec, pasó El Consejo y corrió **estable 3 veces**:
quitá `@unreviewed`, poné `@regression` (+ `@smoke` si es flujo crítico como
login o el happy path del módulo estrella). A partir de acá el gate del pipeline
lo exige (ver `references/ci-pipeline.md`).

## Flujo Figma ↔ implementación (cuando la historia trae diseño)

Si la historia de Jira enlaza Figma y el MCP de Figma está disponible:

1. Sacá del `description` de Jira el link de Figma (`get_issue`).
2. Con el MCP de Figma: `get_metadata` del frame → localizá los nodos de la UI
   (tabs, filtros, estados) → `get_screenshot` de los nodos clave.
3. Compará **texto por texto** el diseño contra la app real. Cada diferencia es
   un hallazgo: registralo y hacé que el test valide **lo que dice el Figma**
   (no lo que hace la app), de modo que el test falle hasta que se corrija.

## Reglas duras (NUNCA)

- ❌ Inventar criterios de aceptación, URLs o credenciales. **Preguntá.**
- ❌ Commitear `.env` ni secretos. Las credenciales viven en **GitHub Secrets**
  del repo (`PW_EMAIL`, `PW_PASSWORD`, etc.); los tests las leen de `process.env`.
- ❌ Correr pruebas destructivas (crear/borrar/pagar) contra producción.
- ❌ Dar por buena una prueba en verde **sin la prueba de fuego**.
- ❌ Debilitar un test para tapar un fallo real.
- ❌ Marcar un módulo "cubierto" con solo el happy path.

## Archivos de apoyo de este skill

| Necesito… | Leé |
|---|---|
| La convención exacta del repo (estructura, POM, auth, scripts, tags) | `references/conventions.md` |
| Cómo funciona el pipeline y el gate de merge | `references/ci-pipeline.md` |
| Las 5 miradas + la prueba de fuego | `references/el-consejo.md` |
| Plantillas para un repo sin E2E | `templates/` |
| Cómo un repo referencia/actualiza este skill | `install/` |
