import { Page } from '@playwright/test';
import { StripePageObject } from '../utils/stripe.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

export class TeamBillingPageObject {
  private readonly teamAccounts: TeamAccountsPageObject;
  public readonly stripe: StripePageObject;

  constructor(page: Page) {
    this.teamAccounts = new TeamAccountsPageObject(page);
    this.stripe = new StripePageObject(page);
  }

  async setup() {
    await this.teamAccounts.setup();
    await this.teamAccounts.goToBilling();
  }
}