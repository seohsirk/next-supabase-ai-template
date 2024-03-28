import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

function UserHomePage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:homeTabLabel'} defaults={'Home'} />}
        description={
          <Trans
            i18nKey={'common:homeTabDescription'}
            defaults={'Welcome to your Home Page'}
          />
        }
      />

      <PageBody></PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
