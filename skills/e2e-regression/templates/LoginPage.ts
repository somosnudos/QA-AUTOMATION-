// Plantilla de Page Object. Un archivo por pantalla en e2e/pages/.
// Los selectores viven acá; el test lee como prosa de negocio.
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly loginButton: Locator;
  readonly emailErrorText: Locator;

  constructor(page: Page) {
    this.page = page;
    // Preferí getByRole/getByLabel; acá se usan clases porque así lo expone la app.
    this.emailInput = page.locator('.emailInput input');
    this.passwordInput = page.locator('.passwordField input');
    this.continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue")');
    this.loginButton = page.locator('button:has-text("Iniciar sesión"), button:has-text("Log in")');
    this.emailErrorText = page.locator('.emailInput .errorText');
  }

  async goto() {
    await this.page.goto('/login');
  }

  // pressSequentially: los inputs controlados por React ignoran fill().
  async fillEmail(email: string) {
    await this.emailInput.pressSequentially(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.pressSequentially(password);
  }

  async clickContinue(options?: { delay?: number }) {
    await this.continueButton.click(options);
  }

  async clickLogin() {
    await this.loginButton.click();
  }
}
