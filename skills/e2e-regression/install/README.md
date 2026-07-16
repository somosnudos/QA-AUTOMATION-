# Adoptar el skill e2e-regression en un repo frontend

Guía para el mantenedor. Onboarda un frontend de Bord a la regresión E2E.
Modelo: **central + referencia** — el método vive en `somosnudos/QA-AUTOMATION-`;
el repo lo referencia con un stub y lo trae con un script.

## Paso a paso

1. **Copiar el stub y el script al repo:**
   ```bash
   mkdir -p .claude/skills/e2e-regression scripts
   # desde una copia de QA-AUTOMATION-:
   cp skills/e2e-regression/install/stub-SKILL.md    .claude/skills/e2e-regression/SKILL.md
   cp skills/e2e-regression/install/sync-e2e-skill.sh scripts/sync-e2e-skill.sh
   chmod +x scripts/sync-e2e-skill.sh
   ```
   Completá el bloque "Config específica de este repo" del stub.

2. **Traer el método canónico:**
   ```bash
   bash scripts/sync-e2e-skill.sh    # deja el skill en .e2e-skill/ (gitignored)
   ```

3. **Si el repo NO tiene E2E** (ej. `wms-frontend`): abrí Claude Code en el repo
   e invocá el skill. Va a scaffoldear desde `.e2e-skill/templates/`:
   `playwright.config.ts`, `e2e/fixtures/global.setup.ts`, `e2e/pages/`,
   `.github/workflows/e2e.yml`, scripts en `package.json`, y las carpetas
   `e2e/tests|specs`. Ajustá lo marcado `AJUSTAR` (yarn/npm, Node, puerto).
   Agregá `e2e/.auth/` y `e2e/artifacts/` al `.gitignore`.

   **Vendorizá el gate de cobertura** (debe viajar con el repo para que CI lo
   corra; `.e2e-skill/` es gitignored y no está en el checkout de CI):
   ```bash
   mkdir -p e2e/tools
   cp .e2e-skill/tools/coverage-map.mjs e2e/tools/coverage-map.mjs
   ```
   El `e2e.yml` corre `node e2e/tools/coverage-map.mjs --strict` como job aparte.

4. **Cargar los secrets** (Settings → Secrets → Actions), una sola vez:
   `ENV_FILE`, `PW_EMAIL`, `PW_PASSWORD`, `AWS_ACCESS_KEY`,
   `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`.
   (Ver `.e2e-skill/references/ci-pipeline.md`.)

5. **Activar el gate** (Settings → Branches → `develop`): "Require status checks
   to pass" + marcar los checks del job E2E como requeridos tras la primera
   corrida. Esto vuelve la regresión obligatoria para mergear.

6. **Construir la regresión** módulo por módulo con el skill (login primero),
   siguiendo el bucle spec → test → El Consejo → graduar.

## Actualizar el método en todos los repos

El método se edita **solo** en `somosnudos/QA-AUTOMATION-/skills/e2e-regression/`.
Cada repo toma la versión nueva corriendo de nuevo `bash scripts/sync-e2e-skill.sh`
(opcionalmente fijando un tag: `bash scripts/sync-e2e-skill.sh v1.2.0`).
