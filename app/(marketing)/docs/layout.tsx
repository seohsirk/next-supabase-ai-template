import { createCmsClient } from '@kit/cms';

import { DocsNavigation } from '~/(marketing)/docs/_components/docs-navigation';

async function DocsLayout({ children }: React.PropsWithChildren) {
  const cms = await createCmsClient();

  const pages = await cms.getContentItems({
    type: 'page',
    categories: ['documentation'],
    depth: 1,
  });

  console.log(pages);

  return (
    <div className={'container mx-auto'}>
      <div className={'flex'}>
        <DocsNavigation pages={pages} />

        <div className={'flex w-full flex-col items-center'}>{children}</div>
      </div>
    </div>
  );
}

export default DocsLayout;
