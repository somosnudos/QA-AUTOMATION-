// Spec: specs/proximo-a-llegar.spec.md
// Jira: BORD-4445
import { test, expect, type Page } from '@playwright/test';

// Login de WMS: dos pasos (correo → Continuar → contraseña → Iniciar sesión).
// El modal de seguridad "Entendido" puede aparecer al cargar O tras Continuar.
async function login(page: Page) {
  await page.goto('/auth/login');

  const emailInput    = page.getByPlaceholder('correo@bord.co');
  const lockoutBtn    = page.getByRole('button', { name: 'Entendido' });
  const continuar     = page.getByRole('button', { name: 'Continuar' });
  // Usamos type=password porque el placeholder puede variar entre envs
  const passwordInput = page.locator('input[type="password"]');

  await expect(emailInput.or(lockoutBtn)).toBeVisible({ timeout: 15000 });
  if (await lockoutBtn.isVisible()) await lockoutBtn.click();

  // Paso 1: correo — pressSequentially dispara onChange de React carácter a carácter
  await emailInput.click();
  await emailInput.pressSequentially(process.env.QA_USER!, { delay: 30 });
  await expect(continuar).toBeEnabled({ timeout: 5000 });
  await continuar.click();

  // Paso 2: contraseña (puede aparecer lockout aquí también)
  const passwordOrLockout = passwordInput.or(lockoutBtn);
  await expect(passwordOrLockout).toBeVisible({ timeout: 10000 });
  if (await lockoutBtn.isVisible()) {
    await lockoutBtn.click();
    await emailInput.fill(process.env.QA_USER!);
    await expect(continuar).toBeEnabled({ timeout: 5000 });
    await continuar.click();
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
  }

  await passwordInput.fill(process.env.QA_PASS!);
  await page.getByRole('button', { name: /iniciar sesión|ingresar|entrar/i }).click();
  // Éxito = ya no estamos en la página de login
  await expect(page).not.toHaveURL(/auth\/login/i, { timeout: 15000 });
}

test.describe('Próximo a llegar — Módulo de entrada (BORD-4445)', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    // El módulo "Próximo a llegar" está detrás de un feature flag en localStorage.
    // Se debe activar manualmente hasta que el flag sea habilitado por defecto.
    await page.evaluate(() => localStorage.setItem('isOnlyDevsLogistics', 'true'));
    await page.goto('/incoming');
    await expect(page.getByRole('tab', { name: /todos/i }).or(
      page.getByText(/todos/i).first()
    )).toBeVisible({ timeout: 15000 });
  });

  // CA-1: tab "Todos" seleccionado por defecto — YAML confirma aria-selected="true"
  test('@unreviewed tab Todos está seleccionado por defecto al cargar', async ({ page }) => {
    const todosTab = page.getByRole('tab', { name: /todos/i });
    await expect(todosTab).toBeVisible();
    await expect(todosTab).toHaveAttribute('aria-selected', 'true');
  });

  // CA-2: los tres tabs presentes — Figma especifica "Órdenes" CON tilde
  // BUG conocido: la app muestra "Ordenes" sin tilde → este test debe FALLAR hasta que el dev corrija
  test('@unreviewed los tres tabs Todos Servicios Órdenes están presentes', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /todos/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /servicios/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /^Órdenes/i })).toBeVisible();
  });

  // CA-3: buscador — placeholder real: "Busca por ID, cliente, modelo, serial..."
  test('@unreviewed el buscador está presente en el header', async ({ page }) => {
    await expect(page.getByPlaceholder(/busca por/i)).toBeVisible();
  });

  // CA-4: filtros — YAML confirma: Bodega, Empresa, Tipo de entrada
  // Nota: spec decía "Cliente y Proveedor"; la app usa "Empresa"; sin filtro Proveedor (ver problemas.md)
  test('@unreviewed filtros Bodega Empresa y Tipo de entrada están disponibles', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^bodega/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^empresa/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^tipo de entrada/i })).toBeVisible();
  });

  // CA-5: filtro País NO visible para usuario no-admin — YAML confirma que no aparece
  test('@unreviewed el filtro País no es visible para usuario no-admin', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^país$/i })).not.toBeVisible();
  });

  // CA-6: clic en tab Servicios lo activa
  test('@unreviewed clic en tab Servicios lo deja activo', async ({ page }) => {
    const serviciosTab = page.getByRole('tab', { name: /servicios/i });
    await serviciosTab.click();
    await expect(serviciosTab).toHaveAttribute('aria-selected', 'true');
  });

  // CA-7: clic en tab Órdenes lo activa — usa /órdenes/ para que falle si hay typo
  test('@unreviewed clic en tab Órdenes lo deja activo', async ({ page }) => {
    const ordenesTab = page.getByRole('tab', { name: /^Órdenes/i });
    await ordenesTab.click();
    await expect(ordenesTab).toHaveAttribute('aria-selected', 'true');
  });

  // CA-8: volver a Todos desde otro tab
  test('@unreviewed clic en Todos desde otro tab vuelve a la vista completa', async ({ page }) => {
    await page.getByRole('tab', { name: /servicios/i }).click();
    const todosTab = page.getByRole('tab', { name: /todos/i });
    await todosTab.click();
    await expect(todosTab).toHaveAttribute('aria-selected', 'true');
  });

  // CA-9: estado vacío al buscar texto sin resultados
  test('@unreviewed búsqueda sin resultados muestra estado vacío', async ({ page }) => {
    await page.getByPlaceholder(/busca por/i).fill('ZZZNORESULTS99999XYZ');
    await expect(page.getByText(/no hay resultados/i)).toBeVisible({ timeout: 10000 });
  });

  // CA-13: no hay botones de acción — vista solo informativa
  test('@unreviewed no hay botones de cambio de estado en la vista', async ({ page }) => {
    await expect(page.getByRole('button', { name: /almacenado|cambiar estado|confirmar/i })).not.toBeVisible();
  });

});
