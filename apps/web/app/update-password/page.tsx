import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import { AuthLayoutShell } from '@kit/auth/shared';
import PasswordResetForm from '@kit/auth/src/components/password-reset-form';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

async function PasswordResetPage() {
  const client = getSupabaseServerComponentClient();
  const user = await client.auth.getUser();

  // we require the user to be logged in to access this page
  if (!user.data) {
    redirect(pathsConfig.auth.passwordReset);
  }

  return (
    <AuthLayoutShell>
      <PasswordResetForm />
    </AuthLayoutShell>
  );
}

export default withI18n(PasswordResetPage);
