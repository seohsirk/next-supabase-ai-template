import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Heading } from '@kit/ui/heading';
import { PageBody, PageHeader } from '@kit/ui/page';

import { AdminMembersTable } from './admin-members-table';
import { AdminMembershipsTable } from './admin-memberships-table';

type Db = Database['public']['Tables'];
type Account = Db['accounts']['Row'];
type Membership = Db['accounts_memberships']['Row'];

export function AdminAccountPage(props: {
  account: Account & { memberships: Membership[] };
}) {
  if (props.account.is_personal_account) {
    return <PersonalAccountPage account={props.account} />;
  }

  return <TeamAccountPage account={props.account} />;
}

async function PersonalAccountPage(props: { account: Account }) {
  const memberships = await getMemberships(props.account.id);

  return (
    <>
      <PageHeader
        title={props.account.name}
        description={`Manage ${props.account.name}'s account details and settings.`}
      />

      <PageBody>
        <div className={'divider-divider-x flex flex-col space-y-4'}>
          <Heading level={4}>Memberships</Heading>

          <div>
            <AdminMembershipsTable memberships={memberships} />
          </div>
        </div>
      </PageBody>
    </>
  );
}

async function TeamAccountPage(props: {
  account: Account & { memberships: Membership[] };
}) {
  const members = await getMembers(props.account.slug ?? '');

  return (
    <>
      <PageHeader
        title={props.account.name}
        description={`Manage ${props.account.name}'s account details and settings.`}
      />

      <PageBody>
        <AdminMembersTable members={members} />
      </PageBody>
    </>
  );
}

async function getMemberships(userId: string) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const memberships = await client
    .from('accounts_memberships')
    .select<
      string,
      Membership & {
        account: {
          id: string;
          name: string;
        };
      }
    >('*, account: account_id !inner (id, name)')
    .eq('user_id', userId);

  if (memberships.error) {
    throw memberships.error;
  }

  return memberships.data;
}

async function getMembers(accountSlug: string) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const members = await client.rpc('get_account_members', {
    account_slug: accountSlug,
  });

  if (members.error) {
    throw members.error;
  }

  return members.data;
}
