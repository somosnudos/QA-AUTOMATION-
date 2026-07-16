# Pipeline E2E + gate de merge

El objetivo: **el dev construye la regresión y el pipeline la exige antes de
mergear a `develop`**. Esto se logra con el workflow `e2e.yml` (plantilla en
`templates/e2e.yml`, calcada de `mono-crm`) + una regla de rama que lo vuelve
check requerido.

## Qué hace el workflow (`e2e.yml`)

Se dispara en `pull_request` a `develop`. Etapas:

1. **build** — `yarn install --frozen-lockfile` → crea `.env` desde el secret
   `ENV_FILE` → `yarn build` → sube `dist/` como artefacto.
2. **e2e** — matriz de **4 shards** en paralelo. Cada shard:
   descarga `dist/`, exporta las vars de `.env` al entorno, cachea e instala
   Playwright chromium, corre `yarn playwright test --shard=i/4` con
   `PW_EMAIL` / `PW_PASSWORD` como secrets. Sube su `blob-report`.
3. **merge-reports** — junta los 4 blobs en un reporte HTML.
4. **deploy-results** — sube el HTML a **S3** y publica la URL como *check* de
   GitHub y como comentario en el PR (con marcador para no duplicar).

> El reporter es `blob` en CI (para poder shardear y mergear) y `html` en local.
> **No** se usa monocart dentro de los repos de producto — eso es del repo
> `QA-AUTOMATION-`. Adentro de cada frontend se respeta el patrón nativo.

## Secrets que el repo necesita (Settings → Secrets → Actions)

| Secret | Para qué |
|---|---|
| `ENV_FILE` | contenido completo del `.env` de build (incluye `VITE_FIREBASE_KEY`) |
| `PW_EMAIL` | usuario de prueba E2E |
| `PW_PASSWORD` | contraseña del usuario de prueba |
| `AWS_ACCESS_KEY` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET` | subir el reporte HTML |

Estos los carga un mantenedor **una vez por repo** desde la UI de GitHub —
Claude no los ingresa. Nunca van al código.

## El gate duro (bloquea merge)

Correr el workflow no basta; hay que volverlo **check requerido**:

1. En el repo → **Settings → Branches → Branch protection rules** → rama `develop`.
2. Activar **"Require status checks to pass before merging"**.
3. Agregar como requeridos los checks del job E2E (aparecen tras la primera
   corrida; ej. `e2e (1, 4)` … `e2e (4, 4)`, o el job `merge-reports`).
4. Activar **"Require branches to be up to date before merging"**.

Con esto, un PR a `develop` **no se puede mergear** si la suite E2E falla. Eso
materializa el "puede y **debe**".

> **Nota (confirmado con devops):** el pipeline corre **todos** los tests del PR,
> sin filtrar por tag — los tags `@regression`/`@unreviewed` son la semántica de
> madurez que lee `coverage-map`, no un filtro de CI. Por eso solo se suben al PR
> tests listos para correr; lo inmaduro queda en la rama local y su hueco lo
> muestra `coverage-map`. El segundo gate es el job `coverage --strict`: exige que
> cada CA del spec tenga test graduado.

> **Adopción gradual (opcional):** para que el equipo no se frene de golpe, se
> puede arrancar el workflow sin marcarlo requerido (corre y reporta), y activar
> el gate cuando la cobertura del módulo crítico esté verde y estable. Es una
> decisión del mantenedor del repo, no del skill.

## Cómo lo dispara el skill

Cuando montás E2E en un repo virgen (ej. `wms-frontend`):

1. Copiás `templates/e2e.yml` → `.github/workflows/e2e.yml`.
2. Ajustás Node/gestor de paquetes al del repo (`wms-frontend` usa `npm` + Node
   24; `mono-crm` usa `yarn` + Node 20-22). La plantilla lo comenta.
3. Confirmás con el mantenedor los secrets y la branch protection — **eso no lo
   hace Claude**, se lo indicás en pasos claros.
4. El primer PR con el workflow deja ver los nombres exactos de los checks para
   marcarlos requeridos.
