# Convención E2E in-repo (referencia: `mono-crm`)

Esta es la convención **que ya vive en los frontends de Bord**. Cuando trabajás
en un repo que ya tiene E2E, calcala. Cuando montás uno nuevo, las plantillas de
`templates/` la reproducen.

## Estructura de carpetas

```
<repo>/
├── playwright.config.ts            # config en la raíz
├── e2e/
│   ├── fixtures/
│   │   └── global.setup.ts         # login UNA vez → storageState
│   ├── pages/                      # Page Object Model — un archivo por pantalla
│   │   ├── LoginPage.ts
│   │   └── <Módulo>Page.ts
│   ├── tests/                      # specs de Playwright, organizados por módulo
│   │   ├── auth/
│   │   │   └── login-email-password.spec.ts
│   │   └── <módulo>/
│   │       └── <módulo>.spec.ts
│   ├── specs/                      # spec-first: el QUÉ en lenguaje claro
│   │   ├── <módulo>.spec.md        # criterios de aceptación (desde Jira)
│   │   └── <módulo>.council.md     # veredicto de El Consejo
│   ├── .auth/                      # storageState generado — GITIGNORED
│   │   └── user.json
│   └── artifacts/                  # reportes y resultados — GITIGNORED
│       ├── test-results/
│       ├── blob-report/
│       └── playwright-report/
```

`e2e/.auth/` y `e2e/artifacts/` **van al `.gitignore`** — nunca se commitean.

## Page Object Model (obligatorio)

Los selectores **no** se escriben en el test; viven en un Page Object. El test
lee como prosa de negocio; el POM absorbe los cambios de UI.

```ts
// e2e/pages/LoginPage.ts
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('correo@empresa.com');
    this.continueButton = page.getByRole('button', { name: /Continuar|Continue/ });
  }

  async goto() { await this.page.goto('/login'); }
  async fillEmail(email: string) { await this.emailInput.pressSequentially(email); }
  async clickContinue(opts?: { delay?: number }) { await this.continueButton.click(opts); }
}
```

> **Nota React:** varios inputs de Bord están controlados por React y no reaccionan
> a `fill()`. Usá `pressSequentially()` para disparar el `onChange` carácter a
> carácter (así lo hace `LoginPage` de `mono-crm`).

## Auth por `storageState` (login una sola vez)

`e2e/fixtures/global.setup.ts` se autentica **una vez** antes de toda la corrida
y guarda la sesión en `e2e/.auth/user.json`. `playwright.config.ts` la inyecta
vía `use.storageState`, así **cada test de módulo arranca ya logueado** — rápido
y sin repetir el formulario.

- Bord usa **Firebase**: el setup pega a `identitytoolkit.googleapis.com` con
  `PW_EMAIL` / `PW_PASSWORD` / `VITE_FIREBASE_KEY` y arma el `sessionLogin` en
  `localStorage`. La plantilla `templates/global.setup.ts` trae esto listo.
- El **único** test que maneja el formulario de login es
  `e2e/tests/auth/*.spec.ts`, que además hace `test.use({ storageState: { cookies: [], origins: [] } })`
  para arrancar deslogueado y probar el flujo real.

## Locators — reglas de oro

1. Preferencia: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId`.
2. Nunca CSS/XPath frágil ni texto que cambie entre ambientes.
3. Datos que varían por ambiente (nombre del usuario, contadores) → leerlos de
   `process.env` o validar el patrón, no el valor exacto.
4. Para "A o B" sin `TimeoutError`, usá `.or()`:
   `expect(passwordInput.or(lockoutButton)).toBeVisible()`.

## Tags de madurez

> **Importante:** los tags NO filtran el pipeline. El CI de la empresa corre
> **todos** los tests del PR, sin `--grep` (convención de devops). Los tags son
> la **semántica de madurez que lee `coverage-map`**: un CA cuenta como cubierto
> solo si su test está graduado. Consecuencia práctica: **no subas al PR un test
> que no esté listo para correr en CI** — un `@unreviewed` a medio construir va
> a correr igual y puede poner el pipeline en rojo. Lo no listo se queda en tu
> rama local; el hueco de cobertura lo muestra `coverage-map`.

| Tag | Significado |
|---|---|
| `@unreviewed` | recién construido; no pasó El Consejo. Cuenta como "a medias" en coverage-map. |
| `@regression` | pasó El Consejo + 3 corridas estables. Cuenta como CA cubierto. |
| `@smoke` | subconjunto crítico (login, happy path del módulo estrella). |

## Scripts de `package.json` (calcados de `mono-crm`)

```json
{
  "pw": "yarn build && playwright test",
  "pw:dev": "PW_DEV=1 playwright test",
  "pwu": "yarn build && playwright test --ui",
  "pw:debug": "playwright test --debug=inspector"
}
```

- `pw` construye y corre contra `vite preview` (lo que corre en CI).
- `pw:dev` corre contra el dev server (`PW_DEV=1`) para iterar rápido.
- El `webServer` de `playwright.config.ts` levanta el server solo; no lo arranques
  a mano.

## Comandos del día a día

| Quiero… | Comando |
|---|---|
| Correr toda la regresión | `yarn pw` |
| Correr un módulo | `yarn pw e2e/tests/<módulo>` |
| Solo smoke (local) | `yarn pw --grep @smoke` |
| Solo lo graduado (local) | `yarn pw --grep @regression` |
| Iterar con UI | `yarn pwu:dev` |
| Depurar un test | `yarn pw:debug` |

Los `--grep` son atajos **locales** para iterar; en CI corre todo.
