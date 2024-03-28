'use client';

import { useMemo, useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Database } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';

import { RemoveMemberDialog } from './remove-member-dialog';
import { RoleBadge } from './role-badge';
import { TransferOwnershipDialog } from './transfer-ownership-dialog';
import { UpdateMemberRoleDialog } from './update-member-role-dialog';

type Members =
  Database['public']['Functions']['get_account_members']['Returns'];

type AccountMembersTableProps = {
  members: Members;

  currentUserId: string;

  permissions: {
    canUpdateRole: boolean;
    canTransferOwnership: boolean;
    canRemoveFromAccount: boolean;
  };
};

export function AccountMembersTable({
  members,
  permissions,
  currentUserId,
}: AccountMembersTableProps) {
  const [search, setSearch] = useState('');
  const { t } = useTranslation('teams');
  const columns = useGetColumns(permissions, currentUserId);

  const filteredMembers = members.filter((member) => {
    const searchString = search.toLowerCase();
    const displayName = member.name ?? member.email.split('@')[0];

    return (
      displayName.includes(searchString) ||
      member.role.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className={'flex flex-col space-y-2'}>
      <Input
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        placeholder={t(`searchMembersPlaceholder`)}
      />

      <DataTable columns={columns} data={filteredMembers} />
    </div>
  );
}

function useGetColumns(
  permissions: {
    canUpdateRole: boolean;
    canTransferOwnership: boolean;
    canRemoveFromAccount: boolean;
  },
  currentUserId: string,
): ColumnDef<Members[0]>[] {
  const { t } = useTranslation('teams');

  return useMemo(
    () => [
      {
        header: t('memberName'),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;
          const displayName = member.name ?? member.email.split('@')[0];
          const isSelf = member.user_id === currentUserId;

          return (
            <span className={'flex items-center space-x-4 text-left'}>
              <span>
                <ProfileAvatar
                  displayName={displayName}
                  pictureUrl={member.picture_url}
                />
              </span>

              <span>{displayName}</span>

              <If condition={isSelf}>
                <span
                  className={
                    'bg-muted rounded-md px-2.5 py-1 text-xs font-medium'
                  }
                >
                  {t('youLabel')}
                </span>
              </If>
            </span>
          );
        },
      },
      {
        header: t('emailLabel'),
        accessorKey: 'email',
        cell: ({ row }) => {
          return row.original.email ?? '-';
        },
      },
      {
        header: t('roleLabel'),
        cell: ({ row }) => {
          const { role, primary_owner_user_id, user_id } = row.original;
          const isPrimaryOwner = primary_owner_user_id === user_id;

          return (
            <span className={'flex items-center space-x-1'}>
              <RoleBadge role={role} />

              <If condition={isPrimaryOwner}>
                <span
                  className={
                    'rounded-md bg-yellow-400 px-2.5 py-1 text-xs font-medium dark:text-black'
                  }
                >
                  {t('primaryOwnerLabel')}
                </span>
              </If>
            </span>
          );
        },
      },
      {
        header: t('joinedAtLabel'),
        cell: ({ row }) => {
          return new Date(row.original.created_at).toLocaleDateString();
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => (
          <ActionsDropdown
            permissions={permissions}
            member={row.original}
            currentUserId={currentUserId}
          />
        ),
      },
    ],
    [permissions, currentUserId, t],
  );
}

function ActionsDropdown({
  permissions,
  member,
  currentUserId,
}: {
  permissions: AccountMembersTableProps['permissions'];
  member: Members[0];
  currentUserId: string;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const isCurrentUser = member.user_id === currentUserId;
  const isPrimaryOwner = member.primary_owner_user_id === member.user_id;

  if (isCurrentUser || isPrimaryOwner) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'} size={'icon'}>
            <Ellipsis className={'h-5 w-5'} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <If condition={permissions.canUpdateRole}>
            <DropdownMenuItem onClick={() => setIsUpdatingRole(true)}>
              <Trans i18nKey={'teams:updateRole'} />
            </DropdownMenuItem>
          </If>

          <If condition={permissions.canTransferOwnership}>
            <DropdownMenuItem onClick={() => setIsTransferring(true)}>
              <Trans i18nKey={'teams:transferOwnership'} />
            </DropdownMenuItem>
          </If>

          <If condition={permissions.canRemoveFromAccount}>
            <DropdownMenuItem onClick={() => setIsRemoving(true)}>
              <Trans i18nKey={'teams:removeMember'} />
            </DropdownMenuItem>
          </If>
        </DropdownMenuContent>
      </DropdownMenu>

      <If condition={isRemoving}>
        <RemoveMemberDialog
          isOpen
          setIsOpen={setIsRemoving}
          accountId={member.id}
          userId={member.user_id}
        />
      </If>

      <If condition={isUpdatingRole}>
        <UpdateMemberRoleDialog
          isOpen
          setIsOpen={setIsUpdatingRole}
          accountId={member.id}
          userId={member.user_id}
          userRole={member.role}
        />
      </If>

      <If condition={isTransferring}>
        <TransferOwnershipDialog
          isOpen
          setIsOpen={setIsTransferring}
          targetDisplayName={member.name ?? member.email}
          accountId={member.id}
          userId={member.user_id}
        />
      </If>
    </>
  );
}
