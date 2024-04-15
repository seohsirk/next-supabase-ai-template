import { use } from 'react';

import Link from 'next/link';

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';
import { PlusCircle } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { DocumentsTable } from '~/(dashboard)/home/(user)/documents/_components/documents-table';
import { loadUserWorkspace } from '~/(dashboard)/home/_lib/load-user-workspace';
import { withI18n } from '~/lib/i18n/with-i18n';

function DocumentsPage() {
  const client = getSupabaseServerComponentClient();
  const workspace = use(loadUserWorkspace());
  const accountId = workspace.user?.id as string;

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'documents:documentsTabLabel'} />}
        description={<Trans i18nKey={'documents:documentsTabDescription'} />}
      >
        <Link href={'home/documents/new'}>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />

            <span>
              <Trans i18nKey={'documents:addDocument'} />
            </span>
          </Button>
        </Link>
      </PageHeader>

      <PageBody>
        <ServerDataLoader
          client={client}
          table={'documents'}
          select={['id', 'created_at', 'title']}
          camelCase
          where={{
            account_id: {
              eq: accountId,
            },
          }}
        >
          {({ data, page, pageCount, pageSize }) => {
            return (
              <DocumentsTable
                data={data}
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
              />
            );
          }}
        </ServerDataLoader>
      </PageBody>
    </>
  );
}

export default withI18n(DocumentsPage);
