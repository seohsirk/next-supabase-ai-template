import Link from 'next/link';

import { PasswordResetRequestContainer } from '@kit/auth/password-reset';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:passwordResetLabel'),
  };
};

function PasswordResetPage() {
  const redirectPath = `${pathsConfig.auth.callback}?next=${pathsConfig.auth.passwordUpdate}`;

  return (
    <>
      <Heading level={5}>
        <Trans i18nKey={'auth:passwordResetLabel'} />
      </Heading>

      <div className={'flex flex-col space-y-4'}>
        <PasswordResetRequestContainer redirectPath={redirectPath} />

        <div className={'flex justify-center text-xs'}>
          <Link href={pathsConfig.auth.signIn}>
            <Button variant={'link'} size={'sm'}>
              <Trans i18nKey={'auth:passwordRecoveredQuestion'} />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default withI18n(PasswordResetPage);
