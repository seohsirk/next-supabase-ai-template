import { allDocumentationPages } from 'contentlayer/generated';

import appConfig from '~/config/app.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import { SitePageHeader } from '../components/site-page-header';
import { DocsCards } from './components/docs-cards';
import { buildDocumentationTree } from './utils/build-documentation-tree';

export const metadata = {
  title: `Documentation - ${appConfig.name}`,
};

function DocsPage() {
  const tree = buildDocumentationTree(allDocumentationPages);

  return (
    <div className={'my-8 flex flex-col space-y-16'}>
      <SitePageHeader
        title={'Documentation'}
        subtitle={'Get started with our guides and tutorials'}
      />

      <div>
        <DocsCards pages={tree ?? []} />
      </div>
    </div>
  );
}

export default withI18n(DocsPage);
