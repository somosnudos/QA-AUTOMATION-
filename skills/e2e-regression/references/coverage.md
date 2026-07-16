# Cobertura — el contrato de trazabilidad

La pregunta "¿se cubren todas las aserciones y casos de uso?" se responde sola si
se respeta este contrato. La cobertura **no se declara, se deriva** cruzando dos
fuentes de verdad.

## Las dos fuentes

### 1 · El spec = denominador (los CA de Jira)
Cada módulo tiene `e2e/specs/<módulo>.spec.md` con una tabla de criterios de
aceptación. El contrato de formato:

```md
> Jira: BORD-4445 — <título>

## Criterios de aceptación
| # | Criterio | Tipo |
|---|---|---|
| CA-1 | <lo que debe cumplirse> | <categoría> |
| CA-2 | … | … |
```

- Un CA declarado = fila que arranca con `| CA-N |`.
- La línea `Jira: <KEY>` liga el módulo a su historia.
- Los CA **los define el negocio** (Jira). Son la lista completa de casos de uso.

### 2 · El test = numerador (qué CA está cubierto)
Cada test referencia el `CA-N` que cubre — en el título **o** en el comentario
inmediatamente anterior — más su tag de madurez:

```ts
// CA-1: tab "Todos" seleccionado por defecto
test('@regression tab Todos está seleccionado por defecto', async ({ page }) => { … });
```

- `@regression` o `@smoke` = **graduado** (cuenta para la cobertura).
- `@unreviewed` = existe pero no graduó (cuenta como "a medias", no como cubierto).

## La herramienta — `coverage-map`

`tools/coverage-map.mjs` cruza specs vs tests y saca, por módulo: CA totales, CA
cubiertos por test graduado, CA a medias y CA sin ningún test.

```bash
# corrida local (convención in-repo)
node e2e/tools/coverage-map.mjs

# rutas custom (p.ej. desde QA-AUTOMATION-)
node coverage-map.mjs --specs projects/soga/specs --tests projects/soga/tests --repo soga

# JSON a stdout (para pipes)
node e2e/tools/coverage-map.mjs --json

# GATE: falla (exit 1) si algún CA de un spec no tiene test graduado
node e2e/tools/coverage-map.mjs --strict
```

Salida: tabla en consola + `e2e/artifacts/coverage.json`.

Estados por módulo:
| Estado | Significado |
|---|---|
| `covered` | todos los CA del spec tienen test graduado |
| `partial` | hay tests pero faltan CA o no están graduados |
| `none` | el spec existe pero no hay tests |
| `no-spec` | hay tests sin spec (no medible — hay que escribir el spec) |

## El tablero — `coverage-dashboard`

`tools/coverage-dashboard.mjs` junta los `coverage.json` de todos los repos con
el manifiesto `tools/apps.json` (el universo de módulos por app) y genera el HTML
del mapa de cobertura.

```bash
node coverage-dashboard.mjs --manifest apps.json --out coverage-map.html \
     coverage/mono-crm.json coverage/soga.json coverage/backoffice.json
```

`apps.json` es lo único que se mantiene a mano: la lista de módulos de cada app
(sale del código del frontend). Cuando una app gana/quita un módulo, se edita ahí.

**Tablero publicado (equipo):** https://qa-cobertura-bord.pages.dev
Re-publicar tras regenerar:
```bash
mkdir -p /tmp/cov/site && cp <coverage-map.html> /tmp/cov/site/index.html
npx wrangler pages deploy /tmp/cov/site --project-name=qa-cobertura-bord --branch=main
```

## Cómo se vendoriza para CI

`coverage-map.mjs` es el **gate ejecutable**, así que se **copia dentro del repo**
(`e2e/tools/coverage-map.mjs`, versionado) — no se lee desde `.e2e-skill/` (que es
gitignored y no está en el checkout de CI). Se actualiza volviéndolo a copiar
tras un `sync-e2e-skill.sh`. El método/guía sí vive central; el gate viaja con el repo.

## Por qué esto no se puede "hacer trampa"

El denominador lo pone Jira, no el dev. No se puede declarar 100% cubriendo solo
lo fácil: si el spec tiene 13 CA y hay tests para 10, `coverage-map` marca los 3
huecos por nombre (`CA-11, CA-12, CA-13`). Con `--strict` en el pipeline, un PR
que agrega un módulo sin cubrir sus CA **no mergea**.
