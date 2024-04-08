import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';

import { AccountsTable } from '@kit/admin/components/accounts-table';
import { AdminGuard } from '@kit/admin/components/admin-guard';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody, PageHeader } from '@kit/ui/page';

interface SearchParams {
  page?: string;
  account_type?: 'all' | 'team' | 'personal';
}

function AccountsPage({ searchParams }: { searchParams: SearchParams }) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const filters = getFilters(searchParams);

  return (
    <>
      <PageHeader
        title={'Accounts'}
        description={`Manage your accounts, view their details, and more.`}
      />

      <PageBody>
        <ServerDataLoader
          table={'accounts'}
          client={client}
          page={page}
          where={filters}
        >
          {({ data, page, pageSize, pageCount }) => {
            return (
              <AccountsTable
                page={page}
                pageSize={pageSize}
                pageCount={pageCount}
                data={data}
                filters={{
                  type: searchParams.account_type ?? 'all',
                }}
              />
            );
          }}
        </ServerDataLoader>
      </PageBody>
    </>
  );
}

function getFilters(params: SearchParams) {
  const filters: {
    [key: string]: {
      eq: boolean;
    };
  } = {};

  if (params.account_type && params.account_type !== 'all') {
    filters.is_personal_account = {
      eq: params.account_type === 'personal',
    };
  }

  return filters;
}

export default AdminGuard(AccountsPage);
