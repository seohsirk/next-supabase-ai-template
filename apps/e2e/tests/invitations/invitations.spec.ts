import { Page, test } from '@playwright/test';
import { InvitationsPageObject } from './invitations.po';

test.describe('Invitations', () => {
  let page: Page;
  let invitations: InvitationsPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    invitations = new InvitationsPageObject(page);

    await invitations.setup();
  });

  test('user invite users', async ({page}) => {
    await page.waitForLoadState('networkidle');

    await invitations.navigateToMembers();
    await invitations.openInviteForm();

    const invites = [
      {
        email: invitations.auth.createRandomEmail(),
        role: 'member'
      },
      {
        email: invitations.auth.createRandomEmail(),
        role: 'member'
      },
    ];

    await invitations.inviteMembers(invites);
  });
});
