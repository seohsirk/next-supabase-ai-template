import { Page } from '@playwright/test';
import { Mailbox } from '../utils/mailbox';

export class AuthPageObject {
  private readonly page: Page;
  private readonly mailbox: Mailbox;

  constructor(page: Page) {
    this.page = page;
    this.mailbox = new Mailbox(page);
  }

  goToSignIn() {
    return this.page.goto('/auth/sign-in');
  }

  goToSignUp() {
    return this.page.goto('/auth/sign-up');
  }

  async signIn(params: {
    email: string,
    password: string
  }) {
    await this.page.locator('input[name="email"]').clear();

    await this.page.fill('input[name="email"]', params.email);
    await this.page.fill('input[name="password"]', params.password);
    await this.page.click('button[type="submit"]');
  }

  async signUp(params: {
    email: string,
    password: string,
    repeatPassword: string
  }) {
    await this.page.fill('input[name="email"]', params.email);
    await this.page.fill('input[name="password"]', params.password);
    await this.page.fill('input[name="repeatPassword"]', params.repeatPassword);
    await this.page.click('button[type="submit"]');
  }

  async visitConfirmEmailLink(email: string) {
    await this.page.waitForTimeout(300);

    return this.mailbox.visitMailbox(email);
  }

  createRandomEmail() {
    const value = Math.random() * 1000;

    return `${value.toFixed(0)}@makerkit.dev`;
  }
}