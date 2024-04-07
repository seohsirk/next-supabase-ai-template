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

async function BlogPage() {
  const { t } = await createI18nServerInstance();
  const cms = await createCmsClient();

  const posts = await cms.getContentItems({
    categories: ['blog'],
  });

  return (
    <div className={'container mx-auto'}>
      <div className={'flex flex-col space-y-16'}>
        <SitePageHeader
          title={t('marketing:blog')}
          subtitle={t('marketing:blogSubtitle')}
        />

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
