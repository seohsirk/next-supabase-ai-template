'use client';

import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisIcon } from 'lucide-react';
import { getI18n } from 'react-i18next';

import type UserData from '@kit/session/types/user-data';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';

import { DataTable } from '@/components/app/DataTable';
import If from '@/components/app/If';

type UserRow = {
  id: string;
  email: string | undefined;
  phone: string | undefined;
  createdAt: string;
  updatedAt: string | undefined;
  lastSignInAt: string | undefined;
  banDuration: string | undefined;
  data: UserData;
};

const columns: ColumnDef<UserRow>[] = [
  {
    header: '',
    id: 'avatar',
    size: 10,
    cell: ({ row }) => {
      const user = row.original;
      const data = user.data;
      const displayName = data?.displayName;
      const photoUrl = data?.photoUrl;
      const displayText = displayName ?? user.email ?? user.phone ?? '';

      return (
        <Tooltip>
          <TooltipTrigger>
            <Avatar>
              {photoUrl ? <AvatarImage src={photoUrl} /> : null}
              <AvatarFallback>{displayText[0]}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>

          <TooltipContent>{displayText}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    header: 'ID',
    id: 'id',
    size: 30,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <Link className={'hover:underline'} href={`/admin/users/${id}`}>
          {id}
        </Link>
      );
    },
  },
  {
    header: 'Email',
    id: 'email',
    cell: ({ row }) => {
      const email = row.original.email;

      return (
        <span title={email} className={'block max-w-full truncate'}>
          {email}
        </span>
      );
    },
  },
  {
    header: 'Name',
    size: 50,
    id: 'displayName',
    cell: ({ row }) => {
      return row.original.data?.displayName ?? '';
    },
  },
  {
    header: 'Created at',
    id: 'createdAt',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const i18n = getI18n();
      const language = i18n.language ?? 'en';
      const createdAtLabel = date.toLocaleDateString(language);

      return <span>{createdAtLabel}</span>;
    },
  },
  {
    header: 'Last sign in',
    id: 'lastSignInAt',
    cell: ({ row }) => {
      const lastSignInAt = row.original.lastSignInAt;

      if (!lastSignInAt) {
        return <span>-</span>;
      }

      const date = new Date(lastSignInAt);
      return <span suppressHydrationWarning>{date.toLocaleString()}</span>;
    },
  },
  {
    header: 'Status',
    id: 'status',
    cell: ({ row }) => {
      const banDuration = row.original.banDuration;

      if (!banDuration || banDuration === 'none') {
        return (
          <Badge className={'inline-flex'} color={'success'}>
            Active
          </Badge>
        );
      }

      return (
        <Badge className={'inline-flex'} color={'error'}>
          Banned
        </Badge>
      );
    },
  },
  {
    header: '',
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const banDuration = row.original.banDuration;
      const isBanned = banDuration && banDuration !== 'none';

      return (
        <div className={'flex justify-end'}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={'icon'}>
                <span className="sr-only">Open menu</span>
                <EllipsisIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy user ID
              </DropdownMenuItem>

              <If condition={!isBanned}>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user.id}/impersonate`}>
                    Impersonate User
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    className={
                      'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5'
                    }
                    href={`/admin/users/${user.id}/ban`}
                  >
                    Ban User
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    className={
                      'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5'
                    }
                    href={`/admin/users/${user.id}/delete`}
                  >
                    Delete User
                  </Link>
                </DropdownMenuItem>
              </If>

              <If condition={isBanned}>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user.id}/reactivate`}>
                    Reactivate User
                  </Link>
                </DropdownMenuItem>
              </If>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

function UsersTable({
  users,
  page,
  pageCount,
  perPage,
}: React.PropsWithChildren<{
  users: UserRow[];
  pageCount: number;
  page: number;
  perPage: number;
}>) {
  return (
    <DataTable
      tableProps={{
        'data-test': 'admin-users-table',
      }}
      pageIndex={page - 1}
      pageSize={perPage}
      pageCount={pageCount}
      data={users}
      columns={columns}
    />
  );
}

export default UsersTable;
