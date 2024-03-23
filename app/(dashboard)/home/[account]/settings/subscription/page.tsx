import Heading from '@/components/ui/heading';

import { withI18n } from '@packages/i18n/with-i18n';

import Trans from '@/components/app/Trans';

import PlansStatusAlertContainer from './components/plan-status-alert-container';
import PlansContainer from './components/plans-container';

export const metadata = {
  title: 'Subscription',
};

const SubscriptionSettingsPage = () => {
  return (
    <div className={'flex w-full flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1 px-2'}>
        <Heading level={4}>
          <Trans i18nKey={'common:subscriptionSettingsTabLabel'} />
        </Heading>

        <span className={'text-gray-500 dark:text-gray-400'}>
          <Trans i18nKey={'subscription:subscriptionTabSubheading'} />
        </span>
      </div>

      <PlansStatusAlertContainer />

      <PlansContainer />
    </div>
  );
};

export default withI18n(SubscriptionSettingsPage);
