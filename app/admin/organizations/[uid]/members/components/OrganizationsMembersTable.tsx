'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVerticalIcon } from 'lucide-react';

import type UserData from '@kit/session/types/user-data';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import type Membership from '@/lib/organizations/types/membership';

import { DataTable } from '@/components/app/DataTable';

import RoleBadge from '../../../../../(app)/[account]/account/organization/components/RoleBadge';

type Data = {
  id: Membership['id'];
  role: Membership['role'];
  user: {
    id: UserData['id'];
    displayName: UserData['displayName'];
  };
};

const columns: ColumnDef<Data>[] = [
  {
    header: 'Membership ID',
    id: 'id',
    accessorKey: 'id',
  },
  {
    header: 'User ID',
    id: 'user-id',
    cell: ({ row }) => {
      const userId = row.original.user.id;

      return (
        <Link className={'hover:underline'} href={`/admin/users/${userId}`}>
          {userId}
        </Link>
      );
    },
  },
  {
    header: 'Name',
    id: 'name',
    accessorKey: 'user.displayName',
  },
  {
    header: 'Role',
    cell: ({ row }) => {
      return (
        <div className={'inline-flex'}>
          <RoleBadge role={row.original.role} />
        </div>
      );
    },
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
      const membership = row.original;
      const userId = membership.user.id;

      return (
        <div className={'flex'}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={'icon'}>
                <span className="sr-only">Open menu</span>
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${userId}`}>View User</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${userId}/impersonate`}>
                  Impersonate User
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

function OrganizationsMembersTable({
  memberships,
  page,
  perPage,
  pageCount,
}: React.PropsWithChildren<{
  memberships: Data[];
  page: number;
  perPage: number;
  pageCount: number;
}>) {
  const data = memberships.filter((membership) => {
    return membership.user;
  });

  const router = useRouter();
  const path = usePathname();

  return (
    <DataTable
      tableProps={{
        'data-test': 'admin-organization-members-table',
      }}
      onPaginationChange={({ pageIndex }) => {
        const { pathname } = new URL(path, window.location.origin);
        const page = pageIndex + 1;

        router.push(pathname + '?page=' + page);
      }}
      pageCount={pageCount}
      pageIndex={page - 1}
      pageSize={perPage}
      columns={columns}
      data={data}
    />
  );
}

export default OrganizationsMembersTable;
