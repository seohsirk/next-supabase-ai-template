import type { User } from '@supabase/supabase-js';

import { SiteHeaderAccountSection } from '~/(marketing)/_components/site-header-account-section';
import { SiteNavigation } from '~/(marketing)/_components/site-navigation';
import { AppLogo } from '~/components/app-logo';

export function SiteHeader(props: { user?: User | null }) {
  return (
    <div>
      <div className={'container mx-auto'}>
        <div className="flex h-16 items-center justify-between">
          <div className={'flex w-6/12 items-center space-x-8'}>
            <AppLogo />

            <SiteNavigation />
          </div>

          <div className={'flex flex-1 items-center justify-end space-x-1'}>
            <SiteHeaderAccountSection user={props.user ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
