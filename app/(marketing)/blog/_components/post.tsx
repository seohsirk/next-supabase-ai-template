import type { Cms } from '@kit/cms';
import { ContentRenderer } from '@kit/cms';

import { PostHeader } from './post-header';

export const Post: React.FC<{
  post: Cms.ContentItem;
  content: string;
}> = ({ post, content }) => {
  return (
    <div className={'mx-auto my-8 max-w-2xl'}>
      <PostHeader post={post} />

      <article className={'mx-auto flex justify-center'}>
        <ContentRenderer content={content} />
      </article>
    </div>
  );
};

export default Post;
