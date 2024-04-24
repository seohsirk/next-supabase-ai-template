import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';


import { UploadDocumentForm } from '../_components/upload-document-form';
import { withI18n } from '~/lib/i18n/with-i18n';


function NewDocumentPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'documents:addDocument'} />}
        description={<Trans i18nKey={'documents:addDocumentDescription'} />}
      />

      <PageBody>
        <UploadDocumentForm />
      </PageBody>
    </>
  );
}

export default withI18n(NewDocumentPage);
