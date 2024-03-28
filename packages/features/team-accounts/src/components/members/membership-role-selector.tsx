import { Database } from '@kit/supabase/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

type Role = Database['public']['Enums']['account_role'];

export const MembershipRoleSelector: React.FC<{
  value: Role;
  currentUserRole?: Role;
  onChange: (role: Role) => unknown;
}> = ({ value, currentUserRole, onChange }) => {
  const rolesList: Role[] = ['owner', 'member'];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-test={'role-selector-trigger'}>
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {rolesList.map((role) => {
          return (
            <SelectItem
              key={role}
              data-test={`role-item-${role}`}
              disabled={currentUserRole && currentUserRole === role}
              value={role}
            >
              <span className={'text-sm capitalize'}>
                <Trans i18nKey={`common.roles.${role}`} defaults={role} />
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
