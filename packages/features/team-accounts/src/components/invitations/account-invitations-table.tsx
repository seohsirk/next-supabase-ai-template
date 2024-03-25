'use client';

import { useMemo, useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { EllipsisIcon } from 'lucide-react';

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

import { RoleBadge } from '../role-badge';
import { DeleteInvitationDialog } from './delete-invitation-dialog';
import { UpdateInvitationDialog } from './update-invitation-dialog';

type Invitations =
  Database['public']['Functions']['get_account_invitations']['Returns'];

type AccountInvitationsTableProps = {
  invitations: Invitations;

  permissions: {
    canUpdateInvitation: boolean;
    canRemoveInvitation: boolean;
  };
};

export function AccountInvitationsTable({
  invitations,
  permissions,
}: AccountInvitationsTableProps) {
  const [search, setSearch] = useState('');
  const columns = useMemo(() => getColumns(permissions), [permissions]);

  const filteredInvitations = invitations.filter((member) => {
    const searchString = search.toLowerCase();
    const email = member.email.split('@')[0]?.toLowerCase() ?? '';

    return (
      email.includes(searchString) ||
      member.role.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className={'flex flex-col space-y-2'}>
      <Input
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        placeholder={'Search Invitation'}
      />

      <DataTable columns={columns} data={filteredInvitations} />
    </div>
  );
}

function getColumns(permissions: {
  canUpdateInvitation: boolean;
  canRemoveInvitation: boolean;
}): ColumnDef<Invitations[0]>[] {
  return [
    {
      header: 'Email',
      size: 200,
      cell: ({ row }) => {
        const member = row.original;
        const email = member.email;

        return (
          <span className={'flex items-center space-x-4 text-left'}>
            <span>
              <ProfileAvatar text={email} />
            </span>

            <span>{email}</span>
          </span>
        );
      },
    },
    {
      header: 'Role',
      cell: ({ row }) => {
        const { role } = row.original;

        return <RoleBadge role={role} />;
      },
    },
    {
      header: 'Invited At',
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleDateString();
      },
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <ActionsDropdown permissions={permissions} invitation={row.original} />
      ),
    },
  ];
}

function ActionsDropdown({
  permissions,
  invitation,
}: {
  permissions: AccountInvitationsTableProps['permissions'];
  invitation: Invitations[0];
}) {
  const [isDeletingInvite, setIsDeletingInvite] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'} size={'icon'}>
            <EllipsisIcon className={'h-5 w-5'} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <If condition={permissions.canUpdateInvitation}>
            <DropdownMenuItem onClick={() => setIsUpdatingRole(true)}>
              Update Invitation
            </DropdownMenuItem>
          </If>

          <If condition={permissions.canRemoveInvitation}>
            <DropdownMenuItem onClick={() => setIsDeletingInvite(true)}>
              Remove
            </DropdownMenuItem>
          </If>
        </DropdownMenuContent>
      </DropdownMenu>

      <If condition={isDeletingInvite}>
        <DeleteInvitationDialog
          isOpen
          setIsOpen={setIsDeletingInvite}
          invitationId={invitation.id}
        />
      </If>

      <If condition={isUpdatingRole}>
        <UpdateInvitationDialog
          isOpen
          setIsOpen={setIsUpdatingRole}
          invitationId={invitation.id}
          userRole={invitation.role}
        />
      </If>
    </>
  );
}
