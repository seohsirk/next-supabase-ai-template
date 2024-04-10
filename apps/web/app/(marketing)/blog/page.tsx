import { createCmsClient } from '@kit/cms';

import { GridList } from '~/(marketing)/_components/grid-list';
import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { PostPreview } from '~/(marketing)/blog/_components/post-preview';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:blog'),
    description: t('marketing:blogSubtitle'),
  };
};

async function BlogPage({ searchParams }: { searchParams: { page: string } }) {
  const { t } = await createI18nServerInstance();
  const cms = await createCmsClient();

  const page = searchParams.page ? parseInt(searchParams.page) : 0;
  const limit = 10;
  const offset = page * limit;

  const { items: posts, total } = await cms.getContentItems({
    collection: 'posts',
    limit,
    offset,
  });

  return (
    <div className={'flex flex-col space-y-12'}>
      <SitePageHeader
        title={t('marketing:blog')}
        subtitle={t('marketing:blogSubtitle')}
      />

      <div className={'container mx-auto'}>
        <GridList>
          {posts.map((post, idx) => {
            return <PostPreview key={idx} post={post} />;
          })}
        </GridList>
      </div>
    </div>
  );
}

export default withI18n(BlogPage);
