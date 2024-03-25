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

      <Heading level={2} className={'text-muted-foreground'}>
        <span className={'font-normal'}>{props.subtitle}</span>
      </Heading>
    </div>
  );
}
