import { cva } from 'class-variance-authority';

import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

type Role = Database['public']['Enums']['account_role'];

const roleClassNameBuilder = cva('font-medium capitalize', {
  variants: {
    role: {
      owner: 'bg-primary',
      member: 'bg-blue-50 text-blue-500 hover:bg-blue-50',
    },
  },
});

export const RoleBadge: React.FC<{
  role: Role;
}> = ({ role }) => {
  const className = roleClassNameBuilder({ role });

  return (
    <Badge className={className}>
      <span data-test={'member-role-badge'}>
        <Trans i18nKey={`common.roles.${role}`} defaults={role} />
      </span>
    </Badge>
  );
};
