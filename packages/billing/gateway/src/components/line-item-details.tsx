import { Plus, PlusCircle } from 'lucide-react';
import { z } from 'zod';

import { LineItemSchema } from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

const className =
  'flex text-secondary-foreground items-center justify-between text-sm';

export function LineItemDetails(
  props: React.PropsWithChildren<{
    lineItems: z.infer<typeof LineItemSchema>[];
    currency: string;
    selectedInterval?: string | undefined;
  }>,
) {
  return (
    <div className={'flex flex-col space-y-1 px-1'}>
      {props.lineItems.map((item) => {
        // If the item has a description, we render it as a simple text
        // and pass the item as values to the translation so we can use
        // the item properties in the translation.
        if (item.description) {
          return (
            <div key={item.id} className={className}>
              <span className={'flex items-center space-x-1.5'}>
                <Plus className={'w-4'} />

                <Trans
                  i18nKey={item.description}
                  values={item}
                  defaults={item.description}
                />
              </span>
            </div>
          );
        }

        switch (item.type) {
          case 'base':
            return (
              <div key={item.id} className={className}>
                <span className={'flex items-center space-x-1'}>
                  <span className={'flex items-center space-x-1.5'}>
                    <PlusCircle className={'w-4'} />

                    <span>
                      <Trans i18nKey={'billing:basePlan'} />
                    </span>
                  </span>

                  <span>-</span>

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
                <span className={'flex items-center space-x-1.5'}>
                  <PlusCircle className={'w-4'} />

                  <span>
                    <Trans i18nKey={'billing:perTeamMember'} />
                  </span>
                </span>

                <span className={'font-semibold'}>
                  {formatCurrency(props.currency.toLowerCase(), item.cost)}
                </span>
              </div>
            );

          case 'metered':
            return (
              <div key={item.id} className={className}>
                <span className={'flex items-center space-x-1'}>
                  <span className={'flex items-center space-x-1.5'}>
                    <PlusCircle className={'w-4'} />

                    <span>
                      <Trans
                        i18nKey={'billing:perUnit'}
                        values={{
                          unit: item.unit,
                        }}
                      />
                    </span>
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
