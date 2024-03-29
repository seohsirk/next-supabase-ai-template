'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { UpdateTeamNameSchema } from '../../schema/update-team-name.schema';

export async function updateTeamAccountName(
  params: z.infer<typeof UpdateTeamNameSchema>,
) {
  const client = getSupabaseServerComponentClient();
  const { name, slug, path } = UpdateTeamNameSchema.parse(params);

  const { error, data } = await client
    .from('accounts')
    .update({
      name,
      slug,
    })
    .match({
      slug,
    })
    .select('slug')
    .single();

  if (error) {
    throw error;
  }

  const newSlug = data.slug;

  if (newSlug) {
    const nextPath = path.replace('[account]', newSlug);

    redirect(nextPath);
  }

  return { success: true };
}
