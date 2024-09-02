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

export function AvatarsGenerationsTable(props: {
  linkPrefix?: string;

  page: number;
  pageSize: number;
  pageCount: number;

  data: Array<{
    name: string;
    uuid: string;
    status: Database['public']['Tables']['avatars_generations']['Row']['status'];
    accountId: string;
    createdAt: string;
  }>;
}) {
  if (props.data.length === 0) {
    return (
      <EmptyState>
        <EmptyStateHeading>Generate your Avatars</EmptyStateHeading>

        <EmptyStateText>
          You haven&apos;t generated any avatars yet.
        </EmptyStateText>

        <EmptyStateButton size={'lg'} asChild>
          <Link href={`/home/avatars/generate`}>
            Generate your first Avatar
          </Link>
        </EmptyStateButton>
      </EmptyState>
    );
  }

  const linkPrefix = props.linkPrefix ?? 'avatars';

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
            const canView = row.original.status === 'success';

            if (canView) {
              return (
                <Link
                  className={'hover:underline'}
                  href={`${linkPrefix}/${row.original.uuid}`}
                >
                  {row.original.name}
                </Link>
              );
            }

            return row.original.name;
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
