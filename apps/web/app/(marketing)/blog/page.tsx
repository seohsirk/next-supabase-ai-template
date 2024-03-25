import type { Metadata } from 'next';

import { allPosts } from 'contentlayer/generated';

import { GridList } from '~/(marketing)/_components/grid-list';
import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { PostPreview } from '~/(marketing)/blog/_components/post-preview';
import appConfig from '~/config/app.config';
import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: `Blog - ${appConfig.name}`,
  description: `Tutorials, Guides and Updates from our team`,
};

function BlogPage() {
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
