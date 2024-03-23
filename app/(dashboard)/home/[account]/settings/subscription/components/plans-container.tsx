'use client';

import useCurrentOrganization from '@/lib/organizations/hooks/use-current-organization';

import If from '@/components/app/If';
import Trans from '@/components/app/Trans';

import BillingPortalRedirectButton from './billing-redirect-button';
import PlanSelectionForm from './plan-selection-form';
import SubscriptionCard from './subscription-card';

const PlansContainer: React.FC = () => {
  const organization = useCurrentOrganization();

  if (!organization) {
    return null;
  }

  const customerId = organization.subscription?.customerId;
  const subscription = organization.subscription?.data;

  if (!subscription) {
    return (
      <PlanSelectionForm customerId={customerId} organization={organization} />
    );
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <div>
        <div
          className={'w-full divide-y rounded-xl border lg:w-9/12 xl:w-6/12'}
        >
          <div className={'p-6'}>
            <SubscriptionCard subscription={subscription} />
          </div>

          <If condition={customerId}>
            <div className={'flex justify-end p-6'}>
              <div className={'flex flex-col items-end space-y-2'}>
                <BillingPortalRedirectButton customerId={customerId as string}>
                  <Trans i18nKey={'subscription:manageBilling'} />
                </BillingPortalRedirectButton>

                <span className={'text-xs text-gray-500 dark:text-gray-400'}>
                  <Trans i18nKey={'subscription:manageBillingDescription'} />
                </span>
              </div>
            </div>
          </If>
        </div>
      </div>
    </div>
  );
};

export default PlansContainer;
