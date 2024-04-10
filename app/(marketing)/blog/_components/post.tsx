import type { Cms } from '@kit/cms';
import { ContentRenderer } from '@kit/cms';

import styles from './html-renderer.module.css';
import { PostHeader } from './post-header';

export const Post: React.FC<{
  post: Cms.ContentItem;
  content: unknown;
}> = ({ post, content }) => {
  return (
    <div>
      <PostHeader post={post} />

      <div className={'mx-auto flex max-w-2xl flex-col space-y-6'}>
        <article className={styles.HTML}>
          <ContentRenderer content={content} />
        </article>
      </div>
    </div>
  );
};
