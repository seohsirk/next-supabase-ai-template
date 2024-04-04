import { Heading } from '@kit/ui/heading';
import { cn } from '@kit/ui/utils';

export function SitePageHeader(props: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center space-y-2.5', props.className)}
    >
      <Heading level={1}>{props.title}</Heading>

      <h2 className={'text-center text-xl text-muted-foreground xl:text-2xl'}>
        <span className={'font-normal'}>{props.subtitle}</span>
      </h2>
    </div>
  );
}
