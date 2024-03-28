'use server';

import { redirect } from 'next/navigation';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function updateTeamAccountName(params: {
  name: string;
  slug: string;
  path: string;
}) {
  const client = getSupabaseServerComponentClient();

  const { error, data } = await client
    .from('accounts')
    .update({
      name: params.name,
      slug: params.slug,
    })
    .match({
      slug: params.slug,
    })
    .select('slug')
    .single();

  if (error) {
    throw error;
  }

  const newSlug = data.slug;

  if (newSlug) {
    const path = params.path.replace('[account]', newSlug);

    redirect(path);
  }

  return { success: true };
}
