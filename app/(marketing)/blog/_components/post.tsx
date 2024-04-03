import type { Cms } from '@kit/cms';
import { ContentRenderer } from '@kit/cms';

import styles from './html-renderer.module.css';
import { PostHeader } from './post-header';

export const Post: React.FC<{
  post: Cms.ContentItem;
  content: string;
}> = ({ post, content }) => {
  return (
    <div className={'mx-auto my-8 flex max-w-2xl flex-col space-y-6'}>
      <PostHeader post={post} />

      <article className={styles.HTML}>
        <ContentRenderer content={content} />
      </article>
    </div>
  );
};

export default Post;
