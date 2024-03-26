export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo: React.ComponentType;
}>) {
  return (
    <div
      className={
        'flex h-screen flex-col items-center justify-center space-y-4' +
        ' dark:lg:bg-background md:space-y-8 lg:space-y-12 lg:bg-gray-50' +
        ' animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-1000'
      }
    >
      {Logo && <Logo />}

      <div
        className={`bg-background dark:border-border flex w-full max-w-sm flex-col items-center space-y-4 rounded-lg border-transparent md:w-8/12 md:border md:px-8 md:py-6 md:shadow lg:w-5/12 lg:px-6 xl:w-4/12 2xl:w-3/12`}
      >
        {children}
      </div>
    </div>
  );
}
