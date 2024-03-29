import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import Script from 'next/script';

import { allPosts } from 'contentlayer/generated';

import Post from '~/(marketing)/blog/_components/post';
import appConfig from '~/config/app.config';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const { title, date, description, image, slug } = post;
  const url = [appConfig.url, 'blog', slug].join('/');

  return Promise.resolve({
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: date,
      url,
      images: image
        ? [
            {
              url: image,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  });
}

function BlogPost({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className={'container mx-auto'}>
      <Script id={'ld-json'} type="application/ld+json">
        {JSON.stringify(post.structuredData)}
      </Script>

      <Post post={post} content={post.body.code} />
    </div>
  );
}

export default withI18n(BlogPost);
