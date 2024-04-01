import { createCmsClient } from '@kit/cms';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { DocsCards } from '~/(marketing)/docs/_components/docs-cards';
import appConfig from '~/config/app.config';
import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata = {
  title: `Documentation - ${appConfig.name}`,
};

async function DocsPage() {
  const client = await createCmsClient();

  const docs = await client.getContentItems({
    type: 'page',
    categories: ['documentation'],
    depth: 1,
  });

  console.log(docs);

  return (
    <div className={'my-8 flex flex-col space-y-16'}>
      <SitePageHeader
        title={'Documentation'}
        subtitle={'Get started with our guides and tutorials'}
      />

      <div>
        <DocsCards pages={docs} />
      </div>
    </div>
  );
}

export default withI18n(DocsPage);
