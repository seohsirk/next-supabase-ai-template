import { cache } from 'react';

import { notFound } from 'next/navigation';

import { ContentRenderer, createCmsClient } from '@kit/cms';
import { If } from '@kit/ui/if';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { DocsCards } from '~/(marketing)/docs/_components/docs-cards';
import { withI18n } from '~/lib/i18n/with-i18n';

import styles from '../../blog/_components/html-renderer.module.css';

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
      <div
        className={
          'relative mx-auto flex max-w-4xl grow flex-col space-y-4 px-8 py-8'
        }
      >
        <SitePageHeader
          title={page.title}
          subtitle={description}
          className={'items-start'}
        />

        <article className={styles.HTML}>
          <ContentRenderer content={page.content} />
        </article>

        <If condition={page.children}>
          <DocsCards cards={page.children ?? []} />
        </If>
      </div>
    </div>
  );
}

export default withI18n(DocumentationPage);
