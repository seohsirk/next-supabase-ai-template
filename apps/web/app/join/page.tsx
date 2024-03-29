import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { Logger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { AcceptInvitationContainer } from '@kit/team-accounts/components';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

interface Context {
  searchParams: {
    invite_token: string;
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('teams:joinTeamAccount'),
  };
};

async function JoinTeamAccountPage({ searchParams }: Context) {
  const token = searchParams.invite_token;

  // no token, redirect to 404
  if (!token) {
    notFound();
  }

  const client = getSupabaseServerComponentClient();
  const auth = await requireUser(client);

  // if the user is not logged in or there is an error
  // redirect to the sign up page with the invite token
  // so that they will get back to this page after signing up
  if (auth.error ?? !auth.data) {
    redirect(pathsConfig.auth.signUp + '?invite_token=' + token);
  }

  // the user is logged in, we can now check if the token is valid
  const invitation = await getInviteDataFromInviteToken(token);

  if (!invitation) {
    return <InviteNotFoundOrExpired />;
  }

  // we need to verify the user isn't already in the account
  const isInAccount = await isCurrentUserAlreadyInAccount(
    invitation.account.id,
  );

  if (isInAccount) {
    Logger.warn(
      {
        name: 'join-team-account',
        accountId: invitation.account.id,
        userId: auth.data.id,
      },
      'User is already in the account. Redirecting to account page.',
    );

    // if the user is already in the account redirect to the home page
    redirect(pathsConfig.app.home);
  }

  // if the user decides to sign in with a different account
  // we redirect them to the sign in page with the invite token
  const signOutNext = pathsConfig.auth.signIn + '?invite_token=' + token;

  // once the user accepts the invitation, we redirect them to the account home page
  const accountHome = pathsConfig.app.accountHome.replace(
    '[account]',
    invitation.account.slug,
  );

  return (
    <AcceptInvitationContainer
      inviteToken={token}
      invitation={invitation}
      paths={{
        signOutNext,
        accountHome,
      }}
    />
  );
}

export default withI18n(JoinTeamAccountPage);

/**
 * Verifies that the current user is not already in the account by
 * reading the document from the `accounts` table. If the user can read it
 * it means they are already in the account.
 * @param accountId
 */
async function isCurrentUserAlreadyInAccount(accountId: string) {
  const client = getSupabaseServerComponentClient();

  const { data } = await client
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .maybeSingle();

  return !!data?.id;
}

async function getInviteDataFromInviteToken(token: string) {
  // we use an admin client to be able to read the pending membership
  // without having to be logged in
  const adminClient = getSupabaseServerComponentClient({ admin: true });

  const { data: invitation, error } = await adminClient
    .from('invitations')
    .select<
      string,
      {
        id: string;
        account: {
          id: string;
          name: string;
          slug: string;
          picture_url: string;
        };
      }
    >(
      'id, expires_at, account: account_id !inner (id, name, slug, picture_url)',
    )
    .eq('invite_token', token)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (!invitation ?? error) {
    return null;
  }

  return invitation;
}

function InviteNotFoundOrExpired() {
  return (
    <div className={'flex flex-col space-y-4'}>
      <Heading level={6}>
        <Trans i18nKey={'teams:inviteNotFoundOrExpired'} />
      </Heading>

      <p className={'text-sm text-muted-foreground'}>
        <Trans i18nKey={'teams:inviteNotFoundOrExpiredDescription'} />
      </p>

      <Link href={pathsConfig.app.home}>
        <Button className={'w-full'} variant={'outline'}>
          <ArrowLeft className={'mr-2 w-4'} />
          <Trans i18nKey={'teams:backToHome'} />
        </Button>
      </Link>
    </div>
  );
}
