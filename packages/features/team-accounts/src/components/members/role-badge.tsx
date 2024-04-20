import { cva } from 'class-variance-authority';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

type Role = string;

const roleClassNameBuilder = cva('font-medium capitalize shadow-none', {
  variants: {
    role: {
      owner: '',
      member:
        'bg-blue-50 hover:bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:hover:bg-blue-500/10',
    },
  },
});

export const RoleBadge: React.FC<{
  role: Role;
}> = ({ role }) => {
  // @ts-expect-error: hard to type this since users can add custom roles
  const className = roleClassNameBuilder({ role });

  return (
    <Badge className={className}>
      <span data-test={'member-role-badge'}>
        <Trans i18nKey={`common:roles.${role}.label`} defaults={role} />
      </span>
    </Badge>
  );
};
