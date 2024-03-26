import { Database } from '@kit/supabase/database';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';

export function CurrentPlanAlert(
  props: React.PropsWithoutRef<{
    status: Database['public']['Enums']['subscription_status'];
  }>,
) {
  let variant: 'success' | 'warning' | 'destructive';
  let text: string;
  let title: string;

  switch (props.status) {
    case 'active':
      variant = 'success';
      title = 'Active';
      text = 'Your subscription is active';
      break;
    case 'trialing':
      variant = 'success';
      title = 'Trial';
      text = 'You are currently on a trial';
      break;
    case 'past_due':
      variant = 'destructive';
      title = 'Past Due';
      text = 'Your subscription payment is past due';
      break;
    case 'canceled':
      variant = 'destructive';
      title = 'Canceled';
      text = 'You have canceled your subscription';
      break;
    case 'unpaid':
      variant = 'destructive';
      title = 'Unpaid';
      text = 'Your subscription payment is unpaid';
      break;
    case 'incomplete':
      variant = 'warning';
      title = 'Incomplete';
      text = 'We are processing your subscription payment';
      break;
    case 'incomplete_expired':
      variant = 'destructive';
      title = 'Incomplete Expired';
      text = 'Your subscription payment has expired';
      break;
    case 'paused':
      variant = 'warning';
      title = 'Paused';
      text = 'Your subscription is paused';
      break;
  }

  return (
    <Alert variant={variant}>
      <AlertTitle>{title}</AlertTitle>

      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}
