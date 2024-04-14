import { Page } from '@playwright/test';
import { AuthPageObject } from '../authentication/auth.po';
import { StripePageObject } from '../utils/stripe.po';

export class UserBillingPageObject {
  private readonly auth: AuthPageObject;
  public readonly stripe: StripePageObject;

  constructor(page: Page) {
    this.auth = new AuthPageObject(page);
    this.stripe = new StripePageObject(page);
  }

  async setup() {
    await this.auth.signUpFlow('/home/billing');
  }
}