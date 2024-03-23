import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import pathsConfig from '~/config/paths.config';

import { Logger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;

  const authCode = searchParams.get('code');
  const inviteCode = searchParams.get('inviteCode');
  const error = searchParams.get('error');
  const nextUrl = searchParams.get('next') ?? pathsConfig.app.home;

  let userId: string | undefined = undefined;

  if (authCode) {
    const client = getSupabaseRouteHandlerClient();

    try {
      const { error, data } =
        await client.auth.exchangeCodeForSession(authCode);

      // if we have an error, we redirect to the error page
      if (error) {
        return onError({ error: error.message });
      }

      userId = data.user.id;
    } catch (error) {
      Logger.error(
        {
          error,
        },
        `An error occurred while exchanging code for session`,
      );

      const message = error instanceof Error ? error.message : error;

      return onError({ error: message as string });
    }

    if (inviteCode && userId) {
      try {
        Logger.info(
          {
            userId,
            inviteCode,
          },
          `Attempting to accept user invite...`,
        );

        // if we have an invite code, we accept the invite
        await acceptInviteFromEmailLink({ inviteCode, userId });
      } catch (error) {
        Logger.error(
          {
            userId,
            inviteCode,
            error,
          },
          `An error occurred while accepting user invite`,
        );

        const message = error instanceof Error ? error.message : error;

        return onError({ error: message as string });
      }
    }
  }

  if (error) {
    return onError({ error });
  }

  return redirect(nextUrl);
}

/**
 * @name acceptInviteFromEmailLink
 * @description If we find an invite code, we try to accept the invite
 * received from the email link method
 * @param params
 */
async function acceptInviteFromEmailLink(params: {
  inviteCode: string;
  userId: string | undefined;
}) {
  if (!params.userId) {
    Logger.error(params, `Attempted to accept invite, but no user id provided`);

    return;
  }

  Logger.info(params, `Found invite code. Accepting invite...`);

  await acceptInviteToOrganization(
    getSupabaseRouteHandlerClient({
      admin: true,
    }),
    {
      code: params.inviteCode,
      userId: params.userId,
    },
  );

  Logger.info(params, `Invite successfully accepted`);
}

function onError({ error }: { error: string }) {
  const errorMessage = getAuthErrorMessage(error);

  Logger.error(
    {
      error,
    },
    `An error occurred while signing user in`,
  );

  const redirectUrl = `/auth/callback/error?error=${errorMessage}`;

  return redirect(redirectUrl);
}

/**
 * Checks if the given error message indicates a verifier error.
 * We check for this specific error because it's highly likely that the
 * user is trying to sign in using a different browser than the one they
 * used to request the sign in link. This is a common mistake, so we
 * want to provide a helpful error message.
 */
function isVerifierError(error: string) {
  return error.includes('both auth code and code verifier should be non-empty');
}

function getAuthErrorMessage(error: string) {
  return isVerifierError(error)
    ? `auth:errors.codeVerifierMismatch`
    : `auth:authenticationErrorAlertBody`;
}
