import { Page } from '@playwright/test';
import { StripePageObject } from './stripe.po';

export class BillingPageObject {
  public readonly stripe: StripePageObject;

  constructor(
    private readonly page: Page,
  ) {
    this.stripe = new StripePageObject(page);
  }

  plans() {
    return this.page.locator('[data-test-plan]');
  }

  selectPlan(index: number = 0) {
    const plans = this.plans();

    return plans.nth(index).click();
  }

  manageBillingButton() {
    return this.page.locator('manage-billing-redirect-button');
  }

  successStatus() {
    return this.page.locator('[data-test="payment-return-success"]');
  }

  async returnToHome() {
    await this.page.waitForTimeout(500);
    await this.successStatus().locator('button').click();
  }

  proceedToCheckout() {
    return this.page.click('[data-test="checkout-submit-button"]');
  }

  async getStatus() {
    return this.page.locator('[data-test="current-plan-card-status-badge"]');
  }
}