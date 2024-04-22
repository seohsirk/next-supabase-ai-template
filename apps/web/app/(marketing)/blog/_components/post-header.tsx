import { Cms } from '@kit/cms';
import { If } from '@kit/ui/if';
import { cn } from '@kit/ui/utils';

import { CoverImage } from '~/(marketing)/blog/_components/cover-image';
import { DateFormatter } from '~/(marketing)/blog/_components/date-formatter';

export const PostHeader: React.FC<{
  post: Cms.ContentItem;
}> = ({ post }) => {
  const { title, publishedAt, description, image } = post;

  return (
    <div className={'flex flex-1 flex-col'}>
      <div className={cn('border-b py-8')}>
        <div className={'mx-auto flex max-w-3xl flex-col space-y-4'}>
          <h1 className={'font-heading text-3xl font-semibold xl:text-5xl'}>
            {title}
          </h1>

          <div>
            <span className={'text-muted-foreground'}>
              <DateFormatter dateString={publishedAt} />
            </span>
          </div>

          <h2
            className={'text-base text-muted-foreground xl:text-lg'}
            dangerouslySetInnerHTML={{ __html: description ?? '' }}
          ></h2>
        </div>
      </div>

      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mx-auto mt-8 flex h-[378px] w-full max-w-3xl justify-center">
            <CoverImage
              preloadImage
              className="rounded-md"
              title={title}
              src={imageUrl}
            />
          </div>
        )}
      </If>
    </div>
  );
};
