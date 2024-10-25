import { cache } from 'react';

import { notFound } from 'next/navigation';

import { ContentRenderer, createCmsClient } from '@kit/cms';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';

import { withI18n } from '~/lib/i18n/with-i18n';

import { SitePageHeader } from '../../_components/site-page-header';
import styles from '../../blog/_components/html-renderer.module.css';
import { DocsCards } from '../_components/docs-cards';

const getPageBySlug = cache(pageLoader);

interface DocumentationPageProps {
  params: Promise<{ slug: string[] }>;
}

async function pageLoader(slug: string) {
  const client = await createCmsClient();

  return client.getContentItemBySlug({ slug, collection: 'documentation' });
}

export const generateMetadata = async ({ params }: DocumentationPageProps) => {
  const slug = (await params).slug.join('/');
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const { title, description } = page;

  return {
    title,
    description,
  };
};

async function DocumentationPage({ params }: DocumentationPageProps) {
  const slug = (await params).slug.join('/');
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const description = page?.description ?? '';

  return (
    <div className={'flex flex-1 flex-col'}>
      <SitePageHeader
        className={'lg:px-8'}
        container={false}
        title={page.title}
        subtitle={description}
      />

      <div className={'flex flex-col space-y-4 py-6 lg:px-8'}>
        <article className={styles.HTML}>
          <ContentRenderer content={page.content} />
        </article>

        <If condition={page.children.length > 0}>
          <Separator />

          <DocsCards cards={page.children ?? []} />
        </If>
      </div>
    </div>
  );
}

export default withI18n(DocumentationPage);
