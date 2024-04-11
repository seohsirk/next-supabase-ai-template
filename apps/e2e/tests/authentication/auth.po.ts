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
    return this.page.goto('/auth/sign-in', {
      waitUntil: 'networkidle',
    });
  }

  goToSignUp() {
    return this.page.goto('/auth/sign-up', {
      waitUntil: 'networkidle',
    });
  }

  async signOut() {
    await this.page.click('[data-test="account-dropdown-trigger"]');
    await this.page.click('[data-test="account-dropdown-sign-out"]');
  }

  async signIn(params: {
    email: string,
    password: string
  }) {
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

    await this.mailbox.visitMailbox(email);
  }

  createRandomEmail() {
    const value = Math.random() * 1000;

    return `${value.toFixed(0)}@makerkit.dev`;
  }

  async signUpFlow(path: string) {
    const email = this.createRandomEmail();

    await this.page.goto(`/auth/sign-up?next=${path}`, {
      waitUntil: 'networkidle',
    });

    await this.signUp({
      email,
      password: 'password',
      repeatPassword: 'password',
    });

    await this.visitConfirmEmailLink(email);
  }
}