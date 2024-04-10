import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { createCmsClient } from '@kit/cms';

import { withI18n } from '~/lib/i18n/with-i18n';

import { Post } from '../../blog/_components/post';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const cms = await createCmsClient();
  const post = await cms.getContentItemById(params.slug);

  if (!post) {
    notFound();
  }

  const { title, publishedAt, description, image } = post;

  return Promise.resolve({
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: publishedAt.toDateString(),
      url: post.url,
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

async function BlogPost({ params }: { params: { slug: string } }) {
  const cms = await createCmsClient();
  const post = await cms.getContentItemById(params.slug);

  if (!post) {
    notFound();
  }

  return <Post post={post} content={post.content} />;
}

export default withI18n(BlogPost);
