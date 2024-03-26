import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';

export function CurrentPlanBadge(
  props: React.PropsWithoutRef<{
    status: Database['public']['Enums']['subscription_status'];
  }>,
) {
  let variant: 'success' | 'warning' | 'destructive';
  let text: string;

  switch (props.status) {
    case 'active':
      variant = 'success';
      text = 'Active';
      break;
    case 'trialing':
      variant = 'success';
      text = 'Trialing';
      break;
    case 'past_due':
      variant = 'destructive';
      text = 'Past due';
      break;
    case 'canceled':
      variant = 'destructive';
      text = 'Canceled';
      break;
    case 'unpaid':
      variant = 'destructive';
      text = 'Unpaid';
      break;
    case 'incomplete':
      variant = 'warning';
      text = 'Incomplete';
      break;
    case 'incomplete_expired':
      variant = 'destructive';
      text = 'Incomplete expired';
      break;
    case 'paused':
      variant = 'warning';
      text = 'Paused';
      break;
  }

  return <Badge variant={variant}>{text}</Badge>;
}
