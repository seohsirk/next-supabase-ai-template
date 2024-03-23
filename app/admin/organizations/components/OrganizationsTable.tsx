'use client';

import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisIcon } from 'lucide-react';
import { getI18n } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import pricingConfig from '@/config/pricing.config';

import { DataTable } from '@/components/app/DataTable';

import SubscriptionStatusBadge from '../../../(app)/[account]/components/organizations/SubscriptionStatusBadge';
import type { getOrganizations } from '../queries';

type Response = Awaited<ReturnType<typeof getOrganizations>>;
type Organizations = Response['organizations'];

const columns: ColumnDef<Organizations[0]>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    id: 'id',
    size: 10,
  },
  {
    header: 'UUID',
    accessorKey: 'uuid',
    id: 'uuid',
    size: 200,
  },
  {
    header: 'Name',
    accessorKey: 'name',
    id: 'name',
  },
  {
    header: 'Subscription',
    id: 'subscription',
    cell: ({ row }) => {
      const priceId = row.original?.subscription?.data?.priceId;

      const plan = pricingConfig.products.find((product) => {
        return product.plans.some((plan) => plan.stripePriceId === priceId);
      });

      if (plan) {
        const price = plan.plans.find((plan) => plan.stripePriceId === priceId);

        if (!price) {
          return 'Unknown Price';
        }

        return `${plan.name} - ${price.name}`;
      }

      return '-';
    },
  },
  {
    header: 'Subscription Status',
    id: 'subscription-status',
    cell: ({ row }) => {
      const subscription = row.original?.subscription?.data;

      if (!subscription) {
        return '-';
      }

      return <SubscriptionStatusBadge subscription={subscription} />;
    },
  },
  {
    header: 'Subscription Period',
    id: 'subscription-period',
    cell: ({ row }) => {
      const subscription = row.original?.subscription?.data;
      const i18n = getI18n();
      const language = i18n.language ?? 'en';

      if (!subscription) {
        return '-';
      }

      const canceled = subscription.cancelAtPeriodEnd;
      const date = subscription.periodEndsAt;
      const formattedDate = new Date(date).toLocaleDateString(language);

      return canceled ? (
        <span className={'text-orange-500'}>Stops on {formattedDate}</span>
      ) : (
        <span className={'text-green-500'}>Renews on {formattedDate}</span>
      );
    },
  },
  {
    header: 'Members',
    id: 'members',
    cell: ({ row }) => {
      const memberships = row.original.memberships.filter((item) => !item.code);
      const invites = row.original.memberships.length - memberships.length;
      const uid = row.original.uuid;
      const length = memberships.length;

      return (
        <Link
          data-test={'organization-members-link'}
          href={`organizations/${uid}/members`}
          className={'cursor-pointer hover:underline'}
        >
          {length} member{length === 1 ? '' : 's'}{' '}
          {invites ? `(${invites} invites)` : ''}
        </Link>
      );
    },
  },
  {
    header: '',
    id: 'actions',
    cell: ({ row }) => {
      const organization = row.original;
      const uid = organization.uuid;

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
                onClick={() => navigator.clipboard.writeText(uid)}
              >
                Copy UUID
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/admin/organizations/${uid}/members`}>
                  View Members
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  className={'text-red-500'}
                  href={`/admin/organizations/${uid}/delete`}
                >
                  Delete
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

function OrganizationsTable({
  organizations,
  pageCount,
  perPage,
  page,
}: React.PropsWithChildren<{
  organizations: Organizations;
  pageCount: number;
  perPage: number;
  page: number;
}>) {
  return (
    <DataTable
      tableProps={{
        'data-test': 'admin-organizations-table',
      }}
      pageSize={perPage}
      pageIndex={page - 1}
      pageCount={pageCount}
      columns={columns}
      data={organizations}
    />
  );
}

export default OrganizationsTable;
