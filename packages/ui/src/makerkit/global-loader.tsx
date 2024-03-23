import { LoadingOverlay } from './loading-overlay';
import { TopLoadingBarIndicator } from './top-loading-bar-indicator';
import { Trans } from './trans';

export function GlobalLoader({
  children,
  displayLogo = false,
  fullPage = false,
}: React.PropsWithChildren<{
  displayLogo?: boolean;
  fullPage?: boolean;
}>) {
  const Text = children ?? <Trans i18nKey={'common:loading'} />;

  return (
    <>
      <TopLoadingBarIndicator />

      <div className={'flex flex-1 flex-col items-center justify-center py-48'}>
        <LoadingOverlay displayLogo={displayLogo} fullPage={fullPage}>
          {Text}
        </LoadingOverlay>
      </div>
    </>
  );
}
