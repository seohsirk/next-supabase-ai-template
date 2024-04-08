import { cn } from '@kit/ui/utils';

export function SitePageHeader(props: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center space-y-4', props.className)}
    >
      <h1 className={'text-center text-3xl font-semibold xl:text-4xl'}>
        {props.title}
      </h1>

      <h2 className={'text-center text-xl text-muted-foreground xl:text-2xl'}>
        <span className={'font-normal'}>{props.subtitle}</span>
      </h2>
    </div>
  );
}
