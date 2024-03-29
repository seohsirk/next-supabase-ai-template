import { z } from 'zod';

export const UpdateRoleSchema = z.object({
  role: z.string().min(1),
});
