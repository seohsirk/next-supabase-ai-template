'use client';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import {
  EmptyState,
  EmptyStateButton,
  EmptyStateHeading,
  EmptyStateText,
} from '@kit/ui/empty-state';
import { DataTable } from '@kit/ui/enhanced-data-table';

import { Database } from '~/lib/database.types';

export function ModelsTable(props: {
  page: number;
  pageSize: number;
  pageCount: number;

  data: Array<{
    name: string;
    uuid: string;
    status: Database['public']['Tables']['avatars_models']['Row']['status'];
    accountId: string;
    createdAt: string;
  }>;
}) {
  if (props.data.length === 0) {
    return (
      <EmptyState>
        <EmptyStateHeading>Train a model with your pictures</EmptyStateHeading>
        <EmptyStateText>
          You haven&apos;t created any models yet. Click the button below to
          create a new model.
        </EmptyStateText>
        <EmptyStateButton size={'lg'} asChild>
          <Link href={`/home/models/new`}>
            Train a Model from your pictures
          </Link>
        </EmptyStateButton>
      </EmptyState>
    );
  }

  return (
    <DataTable
      data={props.data}
      pageSize={props.pageSize}
      pageCount={props.pageCount}
      pageIndex={props.page - 1}
      columns={[
        {
          header: 'Name',
          cell: ({ row }) => {
            return (
              <Link
                className={'hover:underline'}
                href={`/home/models/${row.original.uuid}`}
              >
                {row.original.name}
              </Link>
            );
          },
        },
        {
          header: 'Status',
          cell: ({ row }) => {
            const status = row.original.status;

            switch (status) {
              case 'pending':
                return (
                  <Badge className={'inline-flex'} variant={'info'}>
                    Pending
                  </Badge>
                );

              case 'success':
                return (
                  <Badge className={'inline-flex'} variant={'success'}>
                    Success
                  </Badge>
                );

              case 'failed':
                return (
                  <Badge className={'inline-flex'} variant={'destructive'}>
                    Failed
                  </Badge>
                );
            }
          },
        },
      ]}
    />
  );
}
