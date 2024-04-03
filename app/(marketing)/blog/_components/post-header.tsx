import { Cms } from '@kit/cms';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';

import { CoverImage } from '~/(marketing)/blog/_components/cover-image';
import { DateFormatter } from '~/(marketing)/blog/_components/date-formatter';

export const PostHeader: React.FC<{
  post: Cms.ContentItem;
}> = ({ post }) => {
  const { title, publishedAt, description, image } = post;

  return (
    <div className={'flex flex-col space-y-8'}>
      <div className={'flex flex-col space-y-2'}>
        <Heading level={1}>{title}</Heading>

        <Heading level={3}>
          <p
            className={'font-normal text-muted-foreground'}
            dangerouslySetInnerHTML={{ __html: description ?? '' }}
          />
        </Heading>

        <div className="flex flex-row items-center space-x-2 text-muted-foreground">
          <div className={'text-sm'}>
            <DateFormatter dateString={publishedAt.toISOString()} />
          </div>
        </div>
      </div>

      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mx-auto h-[378px] w-full justify-center">
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
