import { z } from 'zod';

import { Database } from '@kit/supabase/database';

type Role = Database['public']['Enums']['account_role'];

export const UpdateRoleSchema = z.object({
  role: z.custom<Role>((value) => z.string().parse(value)),
});
