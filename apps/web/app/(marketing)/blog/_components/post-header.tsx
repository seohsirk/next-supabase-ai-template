import type { Post } from 'contentlayer/generated';

import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';

import { CoverImage } from '~/(marketing)/blog/_components/cover-image';
import { DateFormatter } from '~/(marketing)/blog/_components/date-formatter';

export const PostHeader: React.FC<{
  post: Post;
}> = ({ post }) => {
  const { title, date, readingTime, description, image } = post;

  // NB: change this to display the post's image
  const displayImage = true;
  const preloadImage = true;

  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-4'}>
        <Heading level={1}>{title}</Heading>

        <Heading level={3}>
          <span className={'font-normal text-muted-foreground'}>
            {description}
          </span>
        </Heading>
      </div>

      <div className="flex">
        <div className="flex flex-row items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <DateFormatter dateString={date} />
          </div>

          <span>·</span>
          <span>{readingTime} minutes reading</span>
        </div>
      </div>

      <If condition={displayImage && image}>
        {(imageUrl) => (
          <div className="relative mx-auto h-[378px] w-full justify-center">
            <CoverImage
              preloadImage={preloadImage}
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
