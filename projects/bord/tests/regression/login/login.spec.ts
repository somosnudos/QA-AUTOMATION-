// Spec: specs/login.spec.md
import { test, expect, type Page } from '@playwright/test';

// El modal "Por seguridad, hemos cerrado tu sesión" puede aparecer en dos momentos:
// 1. Al cargar /login (cuando hay sesión activa previa detectada por el servidor).
// 2. Tras hacer clic en "Continuar" (cuando el servidor valida el email contra sesiones activas).
// Esta función unifica el manejo de ambos casos sin generar pasos rojos en el reporte.

async function dismissLockout(page: Page) {
  const lockoutBtn = page.getByRole('button', { name: 'Entendido' });
  if (await lockoutBtn.isVisible()) await lockoutBtn.click();
}

// Navega al paso 2 (campo contraseña), manejando el lockout si aparece tras "Continuar".
async function goToPasswordStep(page: Page, email: string) {
  const passwordInput = page.getByPlaceholder('Introduce tu contraseña');
  const lockoutBtn    = page.getByRole('button', { name: 'Entendido' });

  await page.getByPlaceholder('correo@empresa.com').fill(email);
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Espera a que aparezca el campo contraseña O el modal de lockout
  await expect(passwordInput.or(lockoutBtn)).toBeVisible({ timeout: 10000 });

  if (await lockoutBtn.isVisible()) {
    await lockoutBtn.click();
    // Tras el lockout la app vuelve al paso 1; reintentamos Continuar una vez
    await page.getByPlaceholder('correo@empresa.com').fill(email);
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
  }
}

test.describe('Login — Bord', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Caso 1: lockout detectado al cargar la página
    const emailInput = page.getByPlaceholder('correo@empresa.com');
    const lockoutBtn = page.getByRole('button', { name: 'Entendido' });
    await expect(emailInput.or(lockoutBtn)).toBeVisible({ timeout: 10000 });
    await dismissLockout(page);
  });

  // CA-1: happy path
  test('@smoke @regression login exitoso redirige al dashboard', async ({ page }) => {
    await goToPasswordStep(page, process.env.QA_USER!);
    await page.getByPlaceholder('Introduce tu contraseña').fill(process.env.QA_PASS!);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/nodi\/dashboard/);
  });

  // CA-5: contraseña no visible hasta ingresar correo
  test('@regression campo contraseña no es visible antes de ingresar correo', async ({ page }) => {
    await expect(page.getByPlaceholder('Introduce tu contraseña')).not.toBeVisible();
  });

  // CA-6: contraseña es type=password
  test('@regression campo contraseña es de tipo password', async ({ page }) => {
    await goToPasswordStep(page, process.env.QA_USER!);
    const passwordInput = page.getByPlaceholder('Introduce tu contraseña');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // CA-4: contraseña incorrecta muestra error
  test('@regression contraseña incorrecta muestra mensaje de error', async ({ page }) => {
    await goToPasswordStep(page, process.env.QA_USER!);
    await page.getByPlaceholder('Introduce tu contraseña').fill('contraseña_incorrecta_123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).not.toHaveURL(/\/nodi\/dashboard/);
    await expect(page.locator('body')).toContainText(/contraseña|incorrecta|error/i);
  });

  // CA-2: correo con formato inválido — el botón "Continuar" queda deshabilitado
  // Comportamiento real: la app deshabilita el botón en lugar de mostrar un mensaje de error
  test('@regression correo con formato inválido deshabilita el botón Continuar', async ({ page }) => {
    await page.getByPlaceholder('correo@empresa.com').fill('esto-no-es-un-correo');

    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await expect(page.getByPlaceholder('Introduce tu contraseña')).not.toBeVisible();
  });

  // CA-7: dashboard muestra todos los elementos estructurales tras login exitoso
  // Valida menú, datos de usuario, widgets de KPIs y acciones rápidas.
  // Los números de los KPIs son dinámicos — solo se validan los títulos.
  test('@smoke @regression dashboard muestra menú navegación, KPIs y acciones rápidas', async ({ page }) => {
    await goToPasswordStep(page, process.env.QA_USER!);
    await page.getByPlaceholder('Introduce tu contraseña').fill(process.env.QA_PASS!);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/nodi\/dashboard/);

    // Menú lateral de navegación
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Empleados' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Inventario' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Órdenes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Servicios logísticos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cotizaciones' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Facturación' })).toBeVisible();

    // Datos del usuario autenticado — el nombre varía por ambiente, se lee de QA_USER_NAME en .env
    await expect(page.getByText(process.env.QA_USER_NAME!, { exact: false })).toBeVisible();

    // Widget de herramientas — exact:true evita ambigüedad con el tooltip oculto del card
    await expect(page.getByText('Herramientas almacenadas', { exact: true })).toBeVisible();

    // Acciones rápidas
    await expect(page.getByText('Solicita servicios logísticos en un clic')).toBeVisible();
    await expect(page.getByText('Offboarding')).toBeVisible();
    await expect(page.getByText('Onboarding')).toBeVisible();
    await expect(page.getByText('Mover entre ubicaciones')).toBeVisible();

    // Sección de tracking — se valida por los filtros de estado (presentes en todos los ambientes)
    await expect(page.getByRole('button', { name: /Por confirmar/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Requieren atención/ })).toBeVisible();
  });

});
