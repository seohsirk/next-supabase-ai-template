import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { UploadDocumentForm } from '../_components/upload-document-form';

function NewDocumentPage() {
  const { id } = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'documents:addDocument'} />}
        description={<Trans i18nKey={'documents:addDocumentDescription'} />}
      />

      <PageBody>
        <UploadDocumentForm accountId={id} />
      </PageBody>
    </>
  );
}

export default withI18n(NewDocumentPage);
