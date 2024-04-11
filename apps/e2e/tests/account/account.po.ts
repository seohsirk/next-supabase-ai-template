import { Page } from '@playwright/test';
import { AuthPageObject } from '../authentication/auth.po';

export class AccountPageObject {
  private readonly page: Page;
  public auth: AuthPageObject;

  constructor(page: Page) {
    this.page = page;
    this.auth = new AuthPageObject(page);
  }

  async setup() {
    return this.auth.signUpFlow('/home/settings');
  }

  async updateProfileName(name: string) {
    await this.page.locator('[data-test="update-account-name-form"] input').fill(name);
    await this.page.locator('[data-test="update-account-name-form"] button').click();
  }

  async updateProfileEmail(email: string) {
    await this.page.locator('[data-test="account-email-form-email-input"]').fill(email);
    await this.page.locator('[data-test="account-email-form-repeat-email-input"]').fill(email);
    await this.page.locator('[data-test="account-email-form"] button').click();
  }

  getProfileName() {
    return this.page.locator('[data-test="account-dropdown-display-name"]');
  }

  getProfileEmail() {
    return this.page.locator('[data-test="account-dropdown-email"]');
  }
}