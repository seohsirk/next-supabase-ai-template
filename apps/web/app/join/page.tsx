import { notFound } from 'next/navigation';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

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

  if (!data) {
    notFound();
  }

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
    </>
  );
}

export default withI18n(JoinTeamAccountPage);

async function getInviteDataFromInviteToken(token: string) {
  // we use an admin client to be able to read the pending membership
  // without having to be logged in
  const adminClient = getSupabaseServerComponentClient({ admin: true });

  const { data: invitation, error } = await adminClient
    .from('invitations')
    .select('*')
    .eq('invite_token', token)
    .single();

  if (!invitation ?? error) {
    return null;
  }

  return invitation;
}
