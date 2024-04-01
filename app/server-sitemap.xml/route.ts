import { invariant } from '@epic-web/invariant';
import { getServerSideSitemap } from 'next-sitemap';

import { createCmsClient } from '@kit/cms';

import appConfig from '~/config/app.config';

invariant(appConfig.url, 'No NEXT_PUBLIC_SITE_URL environment variable found');

export async function GET() {
  const urls = getSiteUrls();
  const client = await createCmsClient();
  const contentItems = await client.getContentItems();

  return getServerSideSitemap([
    ...urls,
    ...contentItems.map((item) => {
      return {
        loc: new URL(item.url, appConfig.url).href,
        lastmod: new Date().toISOString(),
      };
    }),
  ]);
}

function getSiteUrls() {
  const urls = ['/', 'faq', 'pricing'];

  return urls.map((url) => {
    return {
      loc: new URL(url, appConfig.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}
