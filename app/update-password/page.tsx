import { redirect } from 'next/navigation';

import { PasswordResetForm } from '@kit/auth/password-reset';
import { AuthLayoutShell } from '@kit/auth/shared';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

async function PasswordResetPage() {
  const client = getSupabaseServerComponentClient();
  const auth = await requireAuth(client);

  // we require the user to be logged in to access this page
  if (auth.error) {
    redirect(auth.redirectTo);
  }

  return (
    <AuthLayoutShell Logo={AppLogo}>
      <PasswordResetForm redirectTo={pathsConfig.app.home} />
    </AuthLayoutShell>
  );
}

export default withI18n(PasswordResetPage);
