'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Database } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { DataTable } from '@kit/ui/enhanced-data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@kit/ui/select';

type Account = Database['public']['Tables']['accounts']['Row'];

const FiltersSchema = z.object({
  type: z.enum(['all', 'team', 'personal']),
});

export function AccountsTable(
  props: React.PropsWithChildren<{
    data: Account[];
    pageCount: number;
    pageSize: number;
    page: number;
    filters: {
      type: 'all' | 'team' | 'personal';
    };
  }>,
) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <AccountsTableFilters filters={props.filters} />

      <DataTable
        pageSize={props.pageSize}
        pageIndex={props.page - 1}
        pageCount={props.pageCount}
        data={props.data}
        columns={getColumns()}
      />
    </div>
  );
}

function AccountsTableFilters(props: {
  filters: z.infer<typeof FiltersSchema>;
}) {
  const form = useForm({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      type: props.filters?.type ?? 'all',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const router = useRouter();
  const pathName = usePathname();

  const onSubmit = ({ type }: z.infer<typeof FiltersSchema>) => {
    const params = new URLSearchParams({
      account_type: type,
    });

    const url = `${pathName}?${params.toString()}`;

    router.push(url);
  };

  return (
    <div className={'flex space-x-4'}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data))}>
        <Select
          value={form.watch('type')}
          onValueChange={(value) => {
            form.setValue(
              'type',
              value as z.infer<typeof FiltersSchema>['type'],
              {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              },
            );

            return onSubmit(form.getValues());
          }}
        >
          <SelectTrigger>
            <span>Account Type</span>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={'all'}>All</SelectItem>
            <SelectItem value={'team'}>Team</SelectItem>
            <SelectItem value={'personal'}>Personal</SelectItem>
          </SelectContent>
        </Select>
      </form>
    </div>
  );
}

function getColumns(): ColumnDef<Account>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        return row.original.is_personal_account ? 'Personal' : 'Team';
      },
    },
    {
      id: 'created_at',
      header: 'Created At',
      accessorKey: 'created_at',
    },
    {
      id: 'updated_at',
      header: 'Updated At',
      accessorKey: 'updated_at',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'ghost'}>
                <EllipsisVertical className={'h-4'} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={'end'}>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem>
                  <Link href={`/accounts/${row.original.id}`}>View</Link>
                </DropdownMenuItem>

                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
