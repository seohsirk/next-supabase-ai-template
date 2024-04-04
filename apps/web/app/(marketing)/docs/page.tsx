import { createCmsClient } from '@kit/cms';
import { PageBody } from '@kit/ui/page';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { DocsCards } from '~/(marketing)/docs/_components/docs-cards';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:documentation'),
  };
};

async function DocsPage() {
  const client = await createCmsClient();
  const { t } = await createI18nServerInstance();

  const docs = await client.getContentItems({
    categories: ['documentation'],
  });

  // Filter out any docs that have a parentId, as these are children of other docs
  const cards = docs.filter((item) => !item.parentId);

  return (
    <div className={'flex flex-1 flex-col'}>
      <PageBody className={'mt-8'}>
        <div className={'flex flex-col items-center space-y-16'}>
          <SitePageHeader
            title={t('marketing:documentation')}
            subtitle={t('marketing:documentationSubtitle')}
          />

          <DocsCards cards={cards} />
        </div>
      </PageBody>
    </div>
  );
}

export default withI18n(DocsPage);
