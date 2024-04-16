import { cn } from '../utils';

export function Page(
  props: React.PropsWithChildren<{
    sidebar?: React.ReactNode;
    contentContainerClassName?: string;
    className?: string;
  }>,
) {
  return (
    <div className={cn('flex', props.className)}>
      <div className={'hidden lg:block'}>{props.sidebar}</div>

      <div
        className={
          props.contentContainerClassName ??
          'mx-auto flex h-screen w-full flex-col overflow-y-auto'
        }
      >
        {props.children}
      </div>
    </div>
  );
}

export function PageBody(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  const className = cn('w-full px-4 flex flex-col flex-1', props.className);

  return <div className={className}>{props.children}</div>;
}

export function PageHeader({
  children,
  title,
  description,
  mobileNavigation,
}: React.PropsWithChildren<{
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  mobileNavigation?: React.ReactNode;
}>) {
  return (
    <div className={'flex items-start justify-between p-4'}>
      <div
        className={
          'flex items-center space-x-4 lg:flex-col lg:items-start lg:space-x-0'
        }
      >
        <div className={'flex items-center lg:hidden'}>{mobileNavigation}</div>

        <h1>
          <span className={'flex items-center space-x-0.5 lg:space-x-2'}>
            <span
              className={'font-heading text-xl font-semibold dark:text-white'}
            >
              {title}
            </span>
          </span>
        </h1>

        <h2 className={'hidden lg:block'}>
          <span className={'text-base font-normal text-muted-foreground'}>
            {description}
          </span>
        </h2>
      </div>

      {children}
    </div>
  );
}
