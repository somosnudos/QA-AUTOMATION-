// Spec: e2e/specs/<módulo>.spec.md
// Jira: <KEY>
// Ejemplo de test de módulo. Nace con @unreviewed hasta pasar El Consejo.
import { expect, test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';

const EMAIL = process.env.PW_EMAIL ?? '';
const PASSWORD = process.env.PW_PASSWORD ?? '';

// --- Ejemplo A: test de módulo (arranca YA logueado por storageState) -------
test.describe('<Módulo> — <KEY>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/<ruta-del-módulo>');
    // Ancla de carga: esperá un elemento estable del módulo, nunca un timeout.
    await expect(page.getByRole('heading', { name: /<título>/i })).toBeVisible();
  });

  // CA-1: <criterio de aceptación del spec>
  test('@unreviewed <qué valida>', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /todos/i })).toHaveAttribute('aria-selected', 'true');
  });
});

// --- Ejemplo B: el flujo de login (arranca DESLOGUEADO a propósito) ----------
test.describe('Login — <KEY>', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('@unreviewed muestra el input de correo al cargar', async () => {
    await expect(loginPage.emailInput).toBeVisible();
  });

  test('@unreviewed deshabilita Continuar con correo inválido', async () => {
    await loginPage.fillEmail('noesuncorreo');
    await expect(loginPage.continueButton).toBeDisabled();
  });

  test('@unreviewed redirige al dashboard con login válido', async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'PW_EMAIL / PW_PASSWORD no seteados');
    await loginPage.fillEmail(EMAIL);
    await loginPage.clickContinue({ delay: 3_000 });
    await expect(loginPage.passwordInput).toBeVisible();
    await loginPage.fillPassword(PASSWORD);
    await loginPage.clickLogin();
    await expect(page).toHaveURL(/\/(nodi\/dashboard|home)/);
  });
});
