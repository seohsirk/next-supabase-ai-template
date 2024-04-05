import { z } from 'zod';

import { LineItemSchema } from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

export function LineItemDetails(
  props: React.PropsWithChildren<{
    lineItems: z.infer<typeof LineItemSchema>[];
    currency: string;
    selectedInterval?: string | undefined;
  }>,
) {
  const className =
    'flex items-center justify-between text-sm border-b border-dashed pb-2 last:border-transparent';

  return (
    <div className={'flex flex-col space-y-2'}>
      {props.lineItems.map((item) => {
        switch (item.type) {
          case 'base':
            return (
              <div key={item.id} className={className}>
                <span className={'flex space-x-2'}>
                  <span>
                    <Trans i18nKey={'billing:basePlan'} />
                  </span>

                  <span>/</span>

                  <span>
                    <If
                      condition={props.selectedInterval}
                      fallback={<Trans i18nKey={'billing:lifetime'} />}
                    >
                      <Trans
                        i18nKey={`billing:billingInterval.${props.selectedInterval}`}
                      />
                    </If>
                  </span>
                </span>

                <span className={'font-semibold'}>
                  {formatCurrency(props?.currency.toLowerCase(), item.cost)}
                </span>
              </div>
            );

          case 'per-seat':
            return (
              <div key={item.id} className={className}>
                <span>
                  <Trans i18nKey={'billing:perTeamMember'} />
                </span>

                <span className={'font-semibold'}>
                  {formatCurrency(props.currency.toLowerCase(), item.cost)}
                </span>
              </div>
            );

          case 'metered':
            return (
              <div key={item.id} className={className}>
                <span className={'flex items-center space-x-2'}>
                  <span>
                    <Trans
                      i18nKey={'billing:perUnit'}
                      values={{
                        unit: item.unit,
                      }}
                    />
                  </span>

                  {item.included ? (
                    <span>
                      <Trans
                        i18nKey={'billing:perUnitIncluded'}
                        values={{
                          included: item.included,
                        }}
                      />
                    </span>
                  ) : (
                    ''
                  )}
                </span>

                <span className={'font-semibold'}>
                  {formatCurrency(props?.currency.toLowerCase(), item.cost)}
                </span>
              </div>
            );
        }
      })}
    </div>
  );
}
