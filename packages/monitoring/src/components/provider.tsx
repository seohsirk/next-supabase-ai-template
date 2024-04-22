'use client';

import { lazy } from 'react';

import { getMonitoringProvider } from '../get-monitoring-provider';
import { InstrumentationProvider } from '../monitoring-providers.enum';

const BaselimeProvider = lazy(async () => {
  const { BaselimeProvider } = await import('@kit/baselime/provider');

  return {
    default: BaselimeProvider,
  };
});

type Config = {
  provider: InstrumentationProvider;
  providerToken: string;
};

export function MonitoringProvider(
  props: React.PropsWithChildren<{ config?: Config }>,
) {
  const provider = getMonitoringProvider();

  if (!props.config) {
    return <>{props.children}</>;
  }

  switch (provider) {
    case InstrumentationProvider.Baselime:
      return (
        <BaselimeProvider apiKey={props.config?.providerToken} enableWebVitals>
          {props.children}
        </BaselimeProvider>
      );

    // sentry does not require a provider
    case InstrumentationProvider.Sentry:
      return <>{props.children}</>;

    default:
      return <>{props.children}</>;
  }
}
