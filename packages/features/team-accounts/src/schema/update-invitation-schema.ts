import { z } from 'zod';

type Role = string;

export const UpdateInvitationSchema = z.object({
  invitationId: z.number(),
  role: z.custom<Role>(() => z.string().min(1)),
});
