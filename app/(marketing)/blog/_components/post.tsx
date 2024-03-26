import dynamic from 'next/dynamic';

import type { Post as PostType } from 'contentlayer/generated';

import { PostHeader } from './post-header';

const Mdx = dynamic(() =>
  import('@kit/ui/mdx').then((mod) => ({ default: mod.Mdx })),
);

export const Post: React.FC<{
  post: PostType;
  content: string;
}> = ({ post, content }) => {
  return (
    <div className={'mx-auto my-8 max-w-2xl'}>
      <PostHeader post={post} />

      <article className={'mx-auto flex justify-center'}>
        <Mdx code={content} />
      </article>
    </div>
  );
};

export default Post;
