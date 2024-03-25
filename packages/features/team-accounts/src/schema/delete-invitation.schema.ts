import { z } from 'zod';

export const DeleteInvitationSchema = z.object({
  invitationId: z.bigint(),
});
