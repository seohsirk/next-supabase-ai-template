import { expect, Page, test } from '@playwright/test';
import { AccountPageObject } from './account.po';

test.describe('Account Settings', () => {
  let page: Page;
  let account: AccountPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    account = new AccountPageObject(page);

    await account.setup();
  })

  test('user can update their profile name', async () => {
    const name = 'John Doe';

    await account.updateProfileName(name);

    await page.waitForResponse((resp) => {
      return resp.url().includes('accounts');
    });

    await expect(account.getProfileName()).toHaveText(name);
  });

  test('user can update their email', async () => {
    const email = account.auth.createRandomEmail();

    await account.updateProfileEmail(email);

    const req = await page.waitForResponse((resp) => {
      return resp.url().includes('auth/v1/user');
    });

    expect(req.status()).toBe(200);
  });
});