import type { DocumentationPage } from 'contentlayer/generated';
import { allDocumentationPages } from 'contentlayer/generated';

import DocsNavigation from './components/docs-navigation';
import { buildDocumentationTree } from './utils/build-documentation-tree';

function DocsLayout({ children }: React.PropsWithChildren) {
  const tree = buildDocumentationTree(allDocumentationPages);

  return (
    <div className={'container mx-auto'}>
      <div className={'flex'}>
        <DocsNavigation tree={tree} />

        <div className={'flex w-full flex-col items-center'}>{children}</div>
      </div>
    </div>
  );
}

export default DocsLayout;
