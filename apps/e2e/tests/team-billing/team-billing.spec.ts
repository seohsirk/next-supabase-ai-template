import { expect, Page, test } from '@playwright/test';
import { TeamBillingPageObject } from './team-billing.po';
import exp from 'node:constants';

test.describe('Team Billing', () => {
  let page: Page;
  let po: TeamBillingPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    po = new TeamBillingPageObject(page);

    await po.setup();
    await po.teamAccounts.goToBilling();
  });

  test('a team can subscribe to a plan', async () => {
    await po.billing.selectPlan(0);
    await po.billing.proceedToCheckout();

    await po.billing.stripe.fillForm();
    await po.billing.stripe.submitForm();

    await expect(po.billing.successStatus()).toBeVisible();
    await po.billing.returnToHome();

    await po.teamAccounts.goToBilling();

    await expect(await po.billing.getStatus()).toContainText('Active');
    await expect(po.billing.manageBillingButton()).toBeVisible();
  });
});