import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody } from '@kit/ui/page';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

const features = {
  enableAccountDeletion: featureFlagsConfig.enableAccountDeletion,
};

const paths = {
  callback: pathsConfig.auth.callback + `?next=${pathsConfig.app.accountHome}`,
};

function PersonalAccountSettingsPage() {
  return (
    <PageBody>
      <div
        className={
          'container mx-auto flex max-w-2xl flex-1 flex-col items-center'
        }
      >
        <PersonalAccountSettingsContainer features={features} paths={paths} />
      </div>
    </PageBody>
  );
}

export default withI18n(PersonalAccountSettingsPage);
