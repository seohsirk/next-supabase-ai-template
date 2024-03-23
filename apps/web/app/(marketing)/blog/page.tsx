import type { Metadata } from 'next';

import { allPosts } from 'contentlayer/generated';
import PostPreview from '~/(marketing)/blog/components/post-preview';
import { SitePageHeader } from '~/(marketing)/components/site-page-header';
import appConfig from '~/config/app.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import { GridList } from '../components/grid-list';

export const metadata: Metadata = {
  title: `Blog - ${appConfig.name}`,
  description: `Tutorials, Guides and Updates from our team`,
};

async function BlogPage() {
  const livePosts = allPosts.filter((post) => {
    const isProduction = appConfig.production;

    return isProduction ? post.live : true;
  });

  return (
    <div className={'container mx-auto'}>
      <div className={'my-8 flex flex-col space-y-16'}>
        <SitePageHeader
          title={'Blog'}
          subtitle={'Tutorials, Guides and Updates from our team'}
        />

        <GridList>
          {livePosts.map((post, idx) => {
            return <PostPreview key={idx} post={post} />;
          })}
        </GridList>
      </div>
    </div>
  );
}

export default withI18n(BlogPage);
