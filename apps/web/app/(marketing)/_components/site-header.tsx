import type { User } from '@supabase/supabase-js';

import { ModeToggle } from '@kit/ui/mode-toggle';

import { SiteHeaderAccountSection } from '~/(marketing)/_components/site-header-account-section';
import { SiteNavigation } from '~/(marketing)/_components/site-navigation';
import { AppLogo } from '~/components/app-logo';

export function SiteHeader(props: { user?: User | null }) {
  return (
    <div className={'container mx-auto'}>
      <div className="flex h-16 items-center justify-between">
        <div className={'w-4/12'}>
          <AppLogo />
        </div>

        <div className={'hidden w-4/12 justify-center lg:flex'}>
          <SiteNavigation />
        </div>

        <div className={'flex flex-1 items-center justify-end space-x-2'}>
          <ModeToggle />

          <SiteHeaderAccountSection user={props.user ?? null} />
        </div>
      </div>
    </div>
  );
}
