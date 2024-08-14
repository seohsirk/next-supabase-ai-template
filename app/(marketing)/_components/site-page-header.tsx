import { cn } from '@kit/ui/utils';

export function SitePageHeader({
  title,
  subtitle,
  container = true,
  className = '',
}: {
  title: string;
  subtitle: string;
  container?: boolean;
  className?: string;
}) {
  const containerClass = container ? 'container' : '';

  return (
    <div className={cn('border-b py-8 xl:py-10 2xl:py-12', className)}>
      <div
        className={cn('flex flex-col space-y-2 lg:space-y-4', containerClass)}
      >
        <h1
          className={
            'font-heading text-3xl font-medium tracking-tighter dark:text-white xl:text-5xl'
          }
        >
          {title}
        </h1>

        <h2
          className={
            'text-lg tracking-tight text-muted-foreground 2xl:text-2xl'
          }
        >
          {subtitle}
        </h2>
      </div>
    </div>
  );
}
