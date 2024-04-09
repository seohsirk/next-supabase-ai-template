import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { Cms } from '@kit/cms';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { CoverImage } from '~/(marketing)/blog/_components/cover-image';
import { DateFormatter } from '~/(marketing)/blog/_components/date-formatter';

export const PostHeader: React.FC<{
  post: Cms.ContentItem;
}> = ({ post }) => {
  const { title, publishedAt, description, image } = post;

  return (
    <div className={'flex flex-col'}>
      <div className={cn('border-b py-8')}>
        <div className={'container flex flex-col space-y-4'}>
          <h1 className={'text-3xl font-semibold xl:text-5xl'}>{title}</h1>

          <h2 className={'text-base text-secondary-foreground xl:text-lg'}>
            <span
              className={'font-normal'}
              dangerouslySetInnerHTML={{ __html: description ?? '' }}
            />
          </h2>

          <DateFormatter dateString={publishedAt.toISOString()} />
        </div>
      </div>

      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mx-auto mt-8 flex h-[378px] w-full max-w-2xl justify-center">
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
