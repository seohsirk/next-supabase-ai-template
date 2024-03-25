import { z } from 'zod';

import { Database } from '@kit/supabase/database';

type Role = Database['public']['Enums']['account_role'];

export const UpdateInvitationSchema = z.object({
  id: z.bigint(),
  role: z.custom<Role>(() => z.string().min(1)),
});
