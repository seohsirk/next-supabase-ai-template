import { cn } from '@kit/ui/utils';

export function SitePageHeader(props: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn('border-b py-8 xl:py-12 2xl:py-14', props.className)}>
      <div className={'container flex flex-col space-y-4'}>
        <h1 className={'font-base text-3xl xl:text-5xl'}>{props.title}</h1>

        <h2
          className={
            'text-base text-secondary-foreground xl:text-lg 2xl:text-xl'
          }
        >
          <span className={'font-normal'}>{props.subtitle}</span>
        </h2>
      </div>
    </div>
  );
}
