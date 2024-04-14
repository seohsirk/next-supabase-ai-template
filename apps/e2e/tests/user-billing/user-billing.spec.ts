import { expect, Page, test } from '@playwright/test';
import { UserBillingPageObject } from './user-billing.po';

test.describe('User Billing', () => {
  let page: Page;
  let billing: UserBillingPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    billing = new UserBillingPageObject(page);

    await billing.setup();
  });

  test('user can subscribe to a plan', async () => {
    await billing.stripe.selectPlan(0);
    await billing.stripe.proceedToCheckout();

    await billing.stripe.fillForm();
    await billing.stripe.submitForm();

    await expect(billing.stripe.successStatus()).toBeVisible();
  });
});