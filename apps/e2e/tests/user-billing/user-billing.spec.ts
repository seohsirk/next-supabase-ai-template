import { expect, Page, test } from '@playwright/test';
import { UserBillingPageObject } from './user-billing.po';

test.describe('User Billing', () => {
  let page: Page;
  let po: UserBillingPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    po = new UserBillingPageObject(page);

    await po.setup();
  });

  test('user can subscribe to a plan', async ({page}) => {
    await po.billing.selectPlan(0);
    await po.billing.proceedToCheckout();

    await po.billing.stripe.fillForm();
    await po.billing.stripe.submitForm();

    await expect(po.billing.successStatus()).toBeVisible();
    await po.billing.returnToHome();

    await page.locator('a', {
      hasText: 'Billing',
    }).click();

    await expect(await po.billing.getStatus()).toContainText('active');
    await expect(po.billing.manageBillingButton()).toBeVisible();
  });
});