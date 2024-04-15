import { Cms, createCmsClient } from '@kit/cms';

import { DocsNavigation } from '~/(marketing)/docs/_components/docs-navigation';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

async function DocsLayout({ children }: React.PropsWithChildren) {
  const cms = await createCmsClient();
  const { resolvedLanguage } = await createI18nServerInstance();

  const { items: pages } = await cms.getContentItems({
    collection: 'documentation',
    language: resolvedLanguage,
  });

  return (
    <div className={'flex'}>
      <DocsNavigation pages={buildDocumentationTree(pages)} />

      {children}
    </div>
  );
}

export default DocsLayout;

// we want to place all the children under their parent
// based on the property parentId
function buildDocumentationTree(pages: Cms.ContentItem[]) {
  const tree: Cms.ContentItem[] = [];
  const map: Record<string, Cms.ContentItem> = {};

  pages.forEach((page) => {
    map[page.id] = page;
  });

  pages.forEach((page) => {
    if (page.parentId) {
      const parent = map[page.parentId];

      if (!parent) {
        return;
      }

      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(page);

      // sort children by order
      parent.children.sort((a, b) => a.order - b.order);
    } else {
      tree.push(page);
    }
  });

  return tree.sort((a, b) => a.order - b.order);
}
