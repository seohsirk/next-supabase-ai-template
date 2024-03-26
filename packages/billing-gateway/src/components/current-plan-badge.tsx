import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

export function CurrentPlanBadge(
  props: React.PropsWithoutRef<{
    status: Database['public']['Enums']['subscription_status'];
  }>,
) {
  let variant: 'success' | 'warning' | 'destructive';
  const text = `billing:status.${props.status}.badge`;

  switch (props.status) {
    case 'active':
      variant = 'success';
      break;
    case 'trialing':
      variant = 'success';
      break;
    case 'past_due':
      variant = 'destructive';
      break;
    case 'canceled':
      variant = 'destructive';
      break;
    case 'unpaid':
      variant = 'destructive';
      break;
    case 'incomplete':
      variant = 'warning';
      break;
    case 'incomplete_expired':
      variant = 'destructive';
      break;
    case 'paused':
      variant = 'warning';
      break;
  }

  return (
    <Badge variant={variant}>
      <Trans i18nKey={text} />
    </Badge>
  );
}
