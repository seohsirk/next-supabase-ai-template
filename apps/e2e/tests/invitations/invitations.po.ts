import { Page } from '@playwright/test';
import { AuthPageObject } from '../authentication/auth.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

export class InvitationsPageObject {
  private readonly page: Page;
  public auth: AuthPageObject;
  public teamAccounts: TeamAccountsPageObject;

  constructor(page: Page) {
    this.page = page;
    this.auth = new AuthPageObject(page);
    this.teamAccounts = new TeamAccountsPageObject(page);
  }

  async setup() {
    await this.teamAccounts.setup();
  }

  public async inviteMembers(invites: Array<{
    email: string;
    role: string;
  }>) {
    const form = this.getInviteForm();

    for (let index = 0; index < invites.length; index++) {
      const invite = invites[index];

      if (!invite) {
        continue;
      }

      const nth = index + 1;

      await this.page.fill(`[data-test="invite-member-form-item"]:nth-child(${nth}) [data-test="invite-email-input"]`, invite.email);
      await this.page.click(`[data-test="invite-member-form-item"]:nth-child(${nth}) [data-test="role-selector-trigger"]`);
      await this.page.click(`[data-test="role-option-${invite.role}"]`);

      if (index < invites.length - 1) {
        await form.locator('[data-test="add-new-invite-button"]').click();
      }
    }

    await form.locator('button[type="submit"]').click();
  }

  public navigateToMembers() {
    return this.page.locator('a', {
      hasText: 'Members',
    }).click();
  }

   async openInviteForm() {
    await this.page.locator('[data-test="invite-members-form-trigger"]').click();
  }

  private getInviteForm() {
    return this.page.locator('[data-test="invite-members-form"]');
  }
}