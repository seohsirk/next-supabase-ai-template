'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { BillingSchema } from '@kit/billing';
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
    onSubmit: (data: { planId: string }) => void;
    pending?: boolean;
  }>,
) {
  const intervals = props.config.products.reduce<string[]>((acc, item) => {
    return Array.from(
      new Set([...acc, ...item.plans.map((plan) => plan.interval)]),
    );
  }, []);

  const form = useForm({
    resolver: zodResolver(
      z
        .object({
          planId: z.string(),
          interval: z.string(),
        })
        .refine(
          (data) => {
            const planFound = props.config.products
              .flatMap((item) => item.plans)
              .some((plan) => plan.id === data.planId);

            if (!planFound) {
              return false;
            }

            return intervals.includes(data.interval);
          },
          { message: 'Invalid plan', path: ['planId'] },
        ),
    ),
    defaultValues: {
      interval: intervals[0],
      planId: '',
    },
  });

  const selectedInterval = form.watch('interval');

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
                <FormLabel>Choose your billing interval</FormLabel>

                <FormControl>
                  <RadioGroup name={field.name} value={field.value}>
                    <div className={'flex space-x-2.5'}>
                      {intervals.map((interval) => {
                        const selected = field.value === interval;

                        return (
                          <label
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
                                form.setValue('planId', '');
                                form.setValue('interval', interval);
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
                  {props.config.products.map((item) => {
                    const variant = item.plans.find(
                      (plan) => plan.interval === selectedInterval,
                    );

                    if (!variant) {
                      throw new Error('No plan found');
                    }

                    return (
                      <RadioGroupItemLabel
                        selected={field.value === variant.id}
                        key={variant.id}
                      >
                        <RadioGroupItem
                          id={variant.id}
                          value={variant.id}
                          onClick={() => {
                            form.setValue('planId', variant.id);
                          }}
                        />

                        <div
                          className={'flex w-full items-center justify-between'}
                        >
                          <Label
                            htmlFor={variant.id}
                            className={'flex flex-col justify-center space-y-2'}
                          >
                            <span className="font-bold">{item.name}</span>

                            <span className={'text-muted-foreground'}>
                              {item.description}
                            </span>
                          </Label>

                          <div className={'text-right'}>
                            <div>
                              <Price key={variant.id}>
                                <span>
                                  {formatCurrency(
                                    item.currency.toLowerCase(),
                                    variant.price,
                                  )}
                                </span>
                              </Price>
                            </div>

                            <div>
                              <span className={'text-muted-foreground'}>
                                per {variant.interval}
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
          <Button disabled={props.pending}>
            {props.pending ? (
              'Processing...'
            ) : (
              <>
                <span>Proceed to payment</span>
                <ArrowRightIcon className={'ml-2 h-4 w-4'} />
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

function formatCurrency(currencyCode: string, value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}
