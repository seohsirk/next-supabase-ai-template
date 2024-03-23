import { z } from 'zod';

export const CreateOrganizationAccountSchema = z.object({
  name: z.string().min(2).max(50),
});
