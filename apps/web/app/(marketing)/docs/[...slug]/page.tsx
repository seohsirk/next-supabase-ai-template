import { cache } from 'react';

import { notFound } from 'next/navigation';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ContentRenderer, createCmsClient } from '@kit/cms';
import { If } from '@kit/ui/if';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { DocsCards } from '~/(marketing)/docs/_components/docs-cards';
import { DocumentationPageLink } from '~/(marketing)/docs/_components/documentation-page-link';
import { withI18n } from '~/lib/i18n/with-i18n';

const getPageBySlug = cache(async (slug: string) => {
  const client = await createCmsClient();

  return client.getContentItemById(slug);
});

interface PageParams {
  params: {
    slug: string[];
  };
}

export const generateMetadata = async ({ params }: PageParams) => {
  const page = await getPageBySlug(params.slug.join('/'));

  if (!page) {
    notFound();
  }

  const { title, description } = page;

  return {
    title,
    description,
  };
};

async function DocumentationPage({ params }: PageParams) {
  const page = await getPageBySlug(params.slug.join('/'));

  if (!page) {
    notFound();
  }

  const description = page?.description ?? '';

  return (
    <div className={'container mx-auto'}>
      <div className={'relative flex grow flex-col space-y-4 px-8 py-8'}>
        <SitePageHeader
          title={page.title}
          subtitle={description}
          className={'items-start'}
        />

        <ContentRenderer content={page.content} />

        <If condition={page.children}>
          <DocsCards pages={page.children ?? []} />
        </If>
      </div>
    </div>
  );
}

export default withI18n(DocumentationPage);
