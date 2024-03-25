import { cache } from 'react';

import { notFound } from 'next/navigation';

import { allDocumentationPages } from 'contentlayer/generated';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { If } from '@kit/ui/if';
import { Mdx } from '@kit/ui/mdx';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { DocsCards } from '~/(marketing)/docs/_components/docs-cards';
import { DocumentationPageLink } from '~/(marketing)/docs/_components/documentation-page-link';
import { getDocumentationPageTree } from '~/(marketing)/docs/_lib/get-documentation-page-tree';
import { withI18n } from '~/lib/i18n/with-i18n';

const getPageBySlug = cache((slug: string) => {
  return allDocumentationPages.find((post) => post.resolvedPath === slug);
});

interface PageParams {
  params: {
    slug: string[];
  };
}

export const generateMetadata = ({ params }: PageParams) => {
  const page = getPageBySlug(params.slug.join('/'));

  if (!page) {
    notFound();
  }

  const { title, description } = page;

  return {
    title,
    description,
  };
};

function DocumentationPage({ params }: PageParams) {
  const page = getPageBySlug(params.slug.join('/'));

  if (!page) {
    notFound();
  }

  const { nextPage, previousPage, children } =
    getDocumentationPageTree(page.resolvedPath) ?? {};

  const description = page?.description ?? '';

  return (
    <div className={'container mx-auto'}>
      <div className={'relative flex grow flex-col space-y-4 px-8 py-8'}>
        <SitePageHeader
          title={page.title}
          subtitle={description}
          className={'items-start'}
        />

        <Mdx code={page.body.code} />

        <If condition={children}>
          <DocsCards pages={children ?? []} />
        </If>

        <div
          className={
            'flex flex-col justify-between space-y-4 md:flex-row md:space-x-8' +
            ' md:space-y-0'
          }
        >
          <div className={'w-full'}>
            <If condition={previousPage}>
              {(page) => (
                <DocumentationPageLink
                  page={page}
                  before={<ChevronLeft className={'w-4'} />}
                />
              )}
            </If>
          </div>

          <div className={'w-full'}>
            <If condition={nextPage}>
              {(page) => (
                <DocumentationPageLink
                  page={page}
                  after={<ChevronRight className={'w-4'} />}
                />
              )}
            </If>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(DocumentationPage);
