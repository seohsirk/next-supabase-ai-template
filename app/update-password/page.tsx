import { redirect } from 'next/navigation';

import { PasswordResetForm } from '@kit/auth/password-reset';
import { AuthLayoutShell } from '@kit/auth/shared';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

async function PasswordResetPage() {
  const client = getSupabaseServerComponentClient();
  const user = await client.auth.getUser();

  // we require the user to be logged in to access this page
  if (!user.data) {
    redirect(pathsConfig.auth.passwordReset);
  }

  const redirectTo = `/${pathsConfig.auth.callback}?next=${pathsConfig.app.home}`;

  return (
    <AuthLayoutShell Logo={AppLogo}>
      <PasswordResetForm redirectTo={redirectTo} />
    </AuthLayoutShell>
  );
}

export default withI18n(PasswordResetPage);
