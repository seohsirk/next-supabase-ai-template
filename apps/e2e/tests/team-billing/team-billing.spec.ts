import { expect, Page, test } from '@playwright/test';
import { TeamBillingPageObject } from './team-billing.po';

test.describe('Team Billing', () => {
  let page: Page;
  let billing: TeamBillingPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    billing = new TeamBillingPageObject(page);

    await billing.setup();
  });

  test('a team can subscribe to a plan', async () => {
    await billing.stripe.selectPlan(0);
    await billing.stripe.proceedToCheckout();

    await billing.stripe.fillForm();
    await billing.stripe.submitForm();

    await expect(billing.stripe.successStatus()).toBeVisible();
  });
});