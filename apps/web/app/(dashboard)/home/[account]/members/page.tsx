import { PlusCircledIcon } from '@radix-ui/react-icons';
import { loadOrganizationWorkspace } from '~/(dashboard)/home/[account]/(lib)/load-workspace';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

interface Params {
  params: {
    account: string;
  };
}

async function loadAccountMembers(account: string) {
  const client = getSupabaseServerComponentClient();

  const { data, error } = await client.rpc('get_account_members', {
    account_slug: account,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}

async function loadInvitations(account: string) {
  const client = getSupabaseServerComponentClient();

  const { data, error } = await client.rpc('get_account_invitations', {
    account_slug: account,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}

async function OrganizationAccountMembersPage({ params }: Params) {
  const slug = params.account;

  const [{ account, user }, members, invitations] = await Promise.all([
    loadOrganizationWorkspace(slug),
    loadAccountMembers(slug),
    loadInvitations(slug),
  ]);

  const canManageRoles = account.permissions.includes('roles.manage');
  const isPrimaryOwner = account.primary_owner_user_id === user.id;

  const permissions = {
    canUpdateRole: canManageRoles,
    canRemoveFromAccount: canManageRoles,
    canTransferOwnership: isPrimaryOwner,
  };

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:membersTabLabel'} />}
        description={<Trans i18nKey={'common:membersTabDescription'} />}
      />

      <PageBody>
        <div
          className={'mx-auto flex w-full max-w-3xl flex-col space-y-4 pb-32'}
        >
          <Card>
            <CardHeader className={'flex flex-row justify-between'}>
              <div className={'flex flex-col space-y-1.5'}>
                <CardTitle>
                  <Trans i18nKey={'common:membersTabLabel'} />
                </CardTitle>

                <CardDescription>
                  Here you can manage the members of your organization.
                </CardDescription>
              </div>

              <InviteMembersDialogContainer account={account.slug}>
                <Button size={'sm'}>
                  <PlusCircledIcon className={'mr-2 w-4'} />
                  <span>Add Member</span>
                </Button>
              </InviteMembersDialogContainer>
            </CardHeader>

            <CardContent>
              <AccountMembersTable
                currentUserId={user.id}
                permissions={permissions}
                members={members}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={'flex flex-row justify-between'}>
              <div className={'flex flex-col space-y-1.5'}>
                <CardTitle>Pending Invitations</CardTitle>

                <CardDescription>
                  Here you can manage the pending invitations to your
                  organization.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <AccountInvitationsTable
                permissions={{
                  canUpdateInvitation: canManageRoles,
                  canRemoveInvitation: canManageRoles,
                }}
                invitations={invitations}
              />
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(OrganizationAccountMembersPage);
