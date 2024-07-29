'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';

export const revalidatePostPageOnSaveAction = enhanceAction(
  () => {
    revalidatePath('/home/posts/[id]', 'page');
  },
  {
    auth: true,
    schema: undefined,
  },
);
