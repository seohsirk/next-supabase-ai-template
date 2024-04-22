import { BaselimeRum } from '@baselime/react-rum';

export function BaselimeProvider({
  children,
  apiKey,
  enableWebVitals,
  ErrorPage,
}: React.PropsWithChildren<{
  apiKey: string;
  enableWebVitals?: boolean;
  ErrorPage?: React.ReactElement;
}>) {
  return (
    <BaselimeRum
      apiKey={apiKey}
      enableWebVitals={enableWebVitals}
      fallback={ErrorPage ?? null}
    >
      {children}
    </BaselimeRum>
  );
}
