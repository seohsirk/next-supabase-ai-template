import { expect, Page, test } from '@playwright/test';
import { TeamAccountsPageObject } from './team-accounts.po';

test.describe('Team Accounts', () => {
  let page: Page;
  let teamAccounts: TeamAccountsPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    teamAccounts = new TeamAccountsPageObject(page);

    await teamAccounts.setup();
  });

  test('user can update their profile name', async () => {
    const {teamName, slug} = teamAccounts.createTeamName();

    await teamAccounts.goToSettings();

    await teamAccounts.updateName(teamName);

    await page.waitForURL(`http://localhost:3000/home/${slug}/settings`);

    await expect(await teamAccounts.getTeamFromSelector(slug)).toBeVisible();
  });
});

test.describe('Account Deletion', () => {
  test('user can delete their team account', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const params = teamAccounts.createTeamName();

    await teamAccounts.setup(params);
    await teamAccounts.goToSettings();

    await teamAccounts.deleteAccount(params.teamName);

    await page.waitForURL('http://localhost:3000/home');

    expect(page.url()).toEqual('http://localhost:3000/home');

    await expect(await teamAccounts.getTeamFromSelector(params.slug)).not.toBeVisible();
  });
});