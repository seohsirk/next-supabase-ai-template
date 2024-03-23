'use client';

import Link from 'next/link';

import { EllipsisVerticalIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import If from '@/components/app/If';

function UserActionsDropdown({
  uid,
  isBanned,
}: React.PropsWithChildren<{
  uid: string;
  isBanned: boolean;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'}>
          <span className={'flex items-center space-x-2.5'}>
            <span>Manage User</span>

            <EllipsisVerticalIcon className={'w-4'} />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${uid}/impersonate`}>Impersonate</Link>
        </DropdownMenuItem>

        <If condition={!isBanned}>
          <DropdownMenuItem asChild>
            <Link
              className={'text-orange-500'}
              href={`/admin/users/${uid}/ban`}
            >
              Ban
            </Link>
          </DropdownMenuItem>
        </If>

        <If condition={isBanned}>
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${uid}/reactivate`}>Reactivate</Link>
          </DropdownMenuItem>
        </If>

        <DropdownMenuItem asChild>
          <Link className={'text-red-500'} href={`/admin/users/${uid}/delete`}>
            Delete
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserActionsDropdown;
