import { use } from 'react';

import Link from 'next/link';

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';
import { PlusCircle } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { UserAccountHeader } from '~/(dashboard)/home/(user)/_components/user-account-header';
import { loadUserWorkspace } from '~/(dashboard)/home/(user)/_lib/server/load-user-workspace';
import { DocumentsTable } from '~/(dashboard)/home/(user)/documents/_components/documents-table';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

function UserHomePage() {
  const workspace = use(loadUserWorkspace());
  const client = getSupabaseServerComponentClient();
  const accountId = workspace.user.id;

  return (
    <>
      <UserAccountHeader
        title={<Trans i18nKey={'documents:documentsTabLabel'} />}
        description={<Trans i18nKey={'documents:documentsTabDescription'} />}
      >
        <Button asChild>
          <Link href={'home/documents/new'}>
            <PlusCircle className="mr-2 h-5 w-5" />

            <span>
              <Trans i18nKey={'documents:addDocument'} />
            </span>
          </Link>
        </Button>
      </UserAccountHeader>

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

export default withI18n(UserHomePage);
