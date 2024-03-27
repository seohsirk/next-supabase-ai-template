import { z } from 'zod';

import { ProductSchema, isRecurringPlan } from './create-billing-schema';

export function getLineItemsFromPlanId(
  product: z.infer<typeof ProductSchema>,
  planId: string,
) {
  const plan = product.plans.find((plan) => plan.id === planId);

  if (!plan) {
    throw new Error('Plan not found');
  }

  const lineItems = [];

  let trialDays = undefined;

  if (isRecurringPlan(plan)) {
    const lineItem: {
      id: string;
      quantity: number;
      usageType?: 'metered' | 'licensed';
    } = {
      id: plan.id,
      quantity: 1,
    };

    trialDays = plan.trialDays;

    if (plan.recurring.usageType) {
      lineItem.usageType = plan.recurring.usageType;
    }

    lineItems.push(lineItem);

    if (plan.recurring.addOns) {
      for (const addOn of plan.recurring.addOns) {
        lineItems.push({
          id: addOn.id,
          quantity: 1,
        });
      }
    }
  }

  return {
    lineItems,
    trialDays,
  };
}
