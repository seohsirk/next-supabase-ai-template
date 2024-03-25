import { invariant } from '@epic-web/invariant';
import { allDocumentationPages, allPosts } from 'contentlayer/generated';
import { getServerSideSitemap } from 'next-sitemap';

import appConfig from '~/config/app.config';

const siteUrl = appConfig.url;

export async function GET() {
  const urls = getSiteUrls();
  const posts = getPostsSitemap();
  const docs = getDocsSitemap();

  return getServerSideSitemap([...urls, ...posts, ...docs]);
}

function getSiteUrls() {
  invariant(siteUrl, 'No NEXT_PUBLIC_SITE_URL found');

  const urls = ['', 'faq', 'pricing'];

  return urls.map((url) => {
    return {
      loc: new URL(siteUrl, url).href,
      lastmod: new Date().toISOString(),
    };
  });
}

function getPostsSitemap() {
  invariant(siteUrl, 'No NEXT_PUBLIC_SITE_URL found');

  return allPosts.map((post) => {
    return {
      loc: new URL(siteUrl, post.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}

function getDocsSitemap() {
  invariant(siteUrl, 'No NEXT_PUBLIC_SITE_URL found');

  return allDocumentationPages.map((page) => {
    return {
      loc: new URL(siteUrl, page.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}
