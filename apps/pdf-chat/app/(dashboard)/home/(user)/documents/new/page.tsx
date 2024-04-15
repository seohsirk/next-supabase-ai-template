import { PageBody, PageHeader } from '~/core/ui/Page';

import Trans from '~/core/ui/Trans';
import UploadDocumentForm from '../components/UploadDocumentForm';
import { withI18n } from '~/i18n/with-i18n';

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
