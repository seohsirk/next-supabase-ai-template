import React from 'react';

import type { Post as PostType } from 'contentlayer/generated';

import { Mdx } from '@kit/ui/mdx';

import PostHeader from './post-header';

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
