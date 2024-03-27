'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  BillingSchema,
  RecurringPlanSchema,
  getPlanIntervals,
  getProductPlanPairFromId,
} from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Label } from '@kit/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '@kit/ui/radio-group';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

export function PlanPicker(
  props: React.PropsWithChildren<{
    config: z.infer<typeof BillingSchema>;
    onSubmit: (data: { planId: string; productId: string }) => void;
    pending?: boolean;
  }>,
) {
  const intervals = useMemo(
    () => getPlanIntervals(props.config),
    [props.config],
  );

  const form = useForm({
    reValidateMode: 'onChange',
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          planId: z.string().min(1),
          interval: z.string().min(1),
        })
        .refine(
          (data) => {
            const { product, plan } = getProductPlanPairFromId(
              props.config,
              data.planId,
            );

            return product && plan;
          },
          { message: `Please pick a plan to continue`, path: ['planId'] },
        ),
    ),
    defaultValues: {
      interval: intervals[0],
      planId: '',
      productId: '',
    },
  });

  const { interval: selectedInterval } = form.watch();

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4'}
        onSubmit={form.handleSubmit(props.onSubmit)}
      >
        <FormField
          name={'interval'}
          render={({ field }) => {
            return (
              <FormItem className={'rounded-md border p-4'}>
                <FormLabel htmlFor={'plan-picker-id'}>
                  Choose your billing interval
                </FormLabel>

                <FormControl id={'plan-picker-id'}>
                  <RadioGroup name={field.name} value={field.value}>
                    <div className={'flex space-x-2.5'}>
                      {intervals.map((interval) => {
                        const selected = field.value === interval;

                        return (
                          <label
                            htmlFor={interval}
                            key={interval}
                            className={cn(
                              'hover:bg-muted flex items-center space-x-2 rounded-md border border-transparent px-4 py-2',
                              {
                                ['border-border']: selected,
                                ['hover:bg-muted']: !selected,
                              },
                            )}
                          >
                            <RadioGroupItem
                              id={interval}
                              value={interval}
                              onClick={() => {
                                form.setValue('planId', '', {
                                  shouldValidate: true,
                                });

                                form.setValue('interval', interval, {
                                  shouldValidate: true,
                                });
                              }}
                            />

                            <span className={'text-sm font-bold'}>
                              <Trans
                                i18nKey={`common:billingInterval.${interval}`}
                              />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          name={'planId'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pick your preferred plan</FormLabel>

              <FormControl>
                <RadioGroup name={field.name}>
                  {props.config.products.map((product) => {
                    const plan =
                      product.paymentType === 'one-time'
                        ? product.plans[0]
                        : product.plans.find((item) => {
                            if (
                              'recurring' in item &&
                              (item as z.infer<typeof RecurringPlanSchema>)
                                .recurring.interval === selectedInterval
                            ) {
                              return item;
                            }
                          });

                    if (!plan) {
                      throw new Error('Plan not found');
                    }

                    return (
                      <RadioGroupItemLabel
                        selected={field.value === plan.id}
                        key={plan.id}
                      >
                        <RadioGroupItem
                          id={plan.id}
                          value={plan.id}
                          onClick={() => {
                            form.setValue('planId', plan.id, {
                              shouldValidate: true,
                            });

                            form.setValue('productId', product.id, {
                              shouldValidate: true,
                            });
                          }}
                        />

                        <div
                          className={'flex w-full items-center justify-between'}
                        >
                          <Label
                            htmlFor={plan.id}
                            className={'flex flex-col justify-center space-y-2'}
                          >
                            <span className="font-bold">{product.name}</span>

                            <span className={'text-muted-foreground'}>
                              {product.description}
                            </span>
                          </Label>

                          <div className={'text-right'}>
                            <div>
                              <Price key={plan.id}>
                                <span>
                                  {formatCurrency(
                                    product.currency.toLowerCase(),
                                    plan.price,
                                  )}
                                </span>
                              </Price>
                            </div>

                            <div>
                              <span className={'text-muted-foreground'}>
                                per {selectedInterval}
                              </span>
                            </div>
                          </div>
                        </div>
                      </RadioGroupItemLabel>
                    );
                  })}
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button disabled={props.pending ?? !form.formState.isValid}>
            {props.pending ? (
              'Processing...'
            ) : (
              <>
                <span>Proceed to payment</span>
                <ArrowRight className={'ml-2 h-4 w-4'} />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function Price(props: React.PropsWithChildren) {
  return (
    <span
      className={
        'animate-in slide-in-from-left-4 fade-in text-xl font-bold duration-500'
      }
    >
      {props.children}
    </span>
  );
}
