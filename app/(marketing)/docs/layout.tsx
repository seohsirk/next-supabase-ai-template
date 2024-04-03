import { Cms, createCmsClient } from '@kit/cms';

import { DocsNavigation } from '~/(marketing)/docs/_components/docs-navigation';

async function DocsLayout({ children }: React.PropsWithChildren) {
  const cms = await createCmsClient();

  const pages = await cms.getContentItems({
    categories: ['documentation'],
  });

  return (
    <div className={'container mx-auto'}>
      <div className={'flex'}>
        <DocsNavigation pages={buildDocumentationTree(pages)} />

        <div className={'flex w-full flex-col items-center'}>{children}</div>
      </div>
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
