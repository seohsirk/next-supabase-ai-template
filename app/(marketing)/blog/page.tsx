import { createCmsClient } from '@kit/cms';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { BlogPagination } from './_components/blog-pagination';
import { PostPreview } from './_components/post-preview';

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
    <>
      <SitePageHeader
        title={t('marketing:blog')}
        subtitle={t('marketing:blogSubtitle')}
      />

      <div className={'container flex flex-col space-y-6 py-12'}>
        <If
          condition={posts.length > 0}
          fallback={<Trans i18nKey="marketing:noPosts" />}
        >
          <PostsGridList>
            {posts.map((post, idx) => {
              return <PostPreview key={idx} post={post} />;
            })}
          </PostsGridList>

          <div>
            <BlogPagination
              currentPage={page}
              canGoToNextPage={offset + limit < total}
              canGoToPreviousPage={page > 0}
            />
          </div>
        </If>
      </div>
    </>
  );
}

export default withI18n(BlogPage);

function PostsGridList({ children }: React.PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3 lg:gap-x-12">
      {children}
    </div>
  );
}
