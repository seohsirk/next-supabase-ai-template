import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import type { SupabaseClient } from '@supabase/supabase-js';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import ExistingUserInviteForm from '~/join/_components/ExistingUserInviteForm';
import NewUserInviteForm from '~/join/_components/NewUserInviteForm';
import { withI18n } from '~/lib/i18n/with-i18n';

interface Context {
  searchParams: {
    invite_token: string;
  };
}

export const metadata = {
  title: `Join Organization`,
};

async function JoinTeamAccountPage({ searchParams }: Context) {
  const token = searchParams.invite_token;
  const data = await getInviteDataFromInviteToken(token);

  if (!data.membership) {
    notFound();
  }

  const organization = data.membership.organization;

  return (
    <>
      <Heading level={4}>
        <Trans
          i18nKey={'auth:joinOrganizationHeading'}
          values={{
            organization: organization.name,
          }}
        />
      </Heading>

      <div>
        <p className={'text-center'}>
          <Trans
            i18nKey={'auth:joinOrganizationSubHeading'}
            values={{
              organization: organization.name,
            }}
            components={{ b: <b /> }}
          />
        </p>

        <p className={'text-center'}>
          <If condition={!data.session}>
            <Trans i18nKey={'auth:signUpToAcceptInvite'} />
          </If>
        </p>
      </div>

      <If
        condition={data.session}
        fallback={<NewUserInviteForm code={token} />}
      >
        {(session) => <ExistingUserInviteForm code={token} session={session} />}
      </If>
    </>
  );
}

export default withI18n(JoinTeamAccountPage);

async function getInviteDataFromInviteToken(code: string) {
  const client = getSupabaseServerComponentClient();

  // we use an admin client to be able to read the pending membership
  // without having to be logged in
  const adminClient = getSupabaseServerComponentClient({ admin: true });

  const { data: membership, error } = await getInvite(adminClient, code);

  // if the invite wasn't found, it's 404
  if (error) {
    Logger.warn(
      {
        code,
        error,
      },
      `User navigated to invite page, but it wasn't found. Redirecting to home page...`,
    );

    notFound();
  }

  const { data: userSession } = await client.auth.getSession();
  const session = userSession?.session;
  const csrfToken = headers().get('x-csrf-token');

  return {
    csrfToken,
    session,
    membership,
    code,
  };
}

function getInvite(adminClient: SupabaseClient<Database>, code: string) {
  return getMembershipByInviteCode<{
    id: number;
    code: string;
    organization: {
      name: string;
      id: number;
    };
  }>(adminClient, {
    code,
    query: `
      id,
      code,
      organization: organization_id (
        name,
        id
      )
    `,
  });
}
