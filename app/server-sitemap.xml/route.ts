import { invariant } from '@epic-web/invariant';
import { allDocumentationPages, allPosts } from 'contentlayer/generated';
import { getServerSideSitemap } from 'next-sitemap';

import appConfig from '~/config/app.config';

invariant(appConfig.url, 'No NEXT_PUBLIC_SITE_URL environment variable found');

export async function GET() {
  const urls = getSiteUrls();
  const posts = getPostsSitemap();
  const docs = getDocsSitemap();

  return getServerSideSitemap([...urls, ...posts, ...docs]);
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

function getPostsSitemap() {
  return allPosts.map((post) => {
    return {
      loc: new URL(post.url, appConfig.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}

function getDocsSitemap() {
  return allDocumentationPages.map((page) => {
    return {
      loc: new URL(page.url, appConfig.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}
