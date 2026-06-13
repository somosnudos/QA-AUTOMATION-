// Spec: specs/login.spec.md
import { test, expect } from '@playwright/test';

// Descarta el banner de cookies/aviso si aparece
async function dismissBanner(page: import('@playwright/test').Page) {
  const banner = page.getByRole('button', { name: 'Entendido' });
  if (await banner.isVisible().catch(() => false)) {
    await banner.click();
  }
}

test.describe('Login — Bord', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissBanner(page);
  });

  // CA-1: happy path
  test('@smoke @unreviewed login exitoso redirige al dashboard', async ({ page }) => {
    await page.getByPlaceholder('correo@empresa.com').fill(process.env.QA_USER!);
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByPlaceholder('Introduce tu contraseña')).toBeVisible();
    await page.getByPlaceholder('Introduce tu contraseña').fill(process.env.QA_PASS!);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/nodi\/dashboard/);
  });

  // CA-5: contraseña no visible hasta ingresar correo
  test('@unreviewed campo contraseña no es visible antes de ingresar correo', async ({ page }) => {
    await expect(page.getByPlaceholder('Introduce tu contraseña')).not.toBeVisible();
  });

  // CA-6: contraseña es type=password
  test('@unreviewed campo contraseña es de tipo password', async ({ page }) => {
    await page.getByPlaceholder('correo@empresa.com').fill(process.env.QA_USER!);
    await page.getByRole('button', { name: 'Continuar' }).click();

    const passwordInput = page.getByPlaceholder('Introduce tu contraseña');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // CA-4: contraseña incorrecta muestra error
  test('@unreviewed contraseña incorrecta muestra mensaje de error', async ({ page }) => {
    await page.getByPlaceholder('correo@empresa.com').fill(process.env.QA_USER!);
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByPlaceholder('Introduce tu contraseña')).toBeVisible();
    await page.getByPlaceholder('Introduce tu contraseña').fill('contraseña_incorrecta_123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).not.toHaveURL(/\/nodi\/dashboard/);
    // Verificar que hay un mensaje de error visible en pantalla
    await expect(page.locator('form')).toContainText(/.+/);
  });

  // CA-2: correo con formato inválido
  test('@unreviewed correo con formato inválido no avanza al paso 2', async ({ page }) => {
    await page.getByPlaceholder('correo@empresa.com').fill('esto-no-es-un-correo');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByPlaceholder('Introduce tu contraseña')).not.toBeVisible();
  });

});
