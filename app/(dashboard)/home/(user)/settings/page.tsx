import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody } from '@kit/ui/page';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

const features = {
  enableAccountDeletion: featureFlagsConfig.enableAccountDeletion,
};

const paths = {
  callback: pathsConfig.auth.callback + `?next=${pathsConfig.app.accountHome}`,
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:settingsTab');

  return {
    title,
  };
};

function PersonalAccountSettingsPage() {
  return (
    <PageBody>
      <div className={'mx-auto flex w-full flex-1 flex-col lg:max-w-2xl'}>
        <PersonalAccountSettingsContainer features={features} paths={paths} />
      </div>
    </PageBody>
  );
}

export default withI18n(PersonalAccountSettingsPage);
