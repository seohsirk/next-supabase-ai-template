import { z } from 'zod';

import { DatabaseWebhookHandlerService } from '@kit/database-webhooks';

const webhooksSecret = z
  .string({
    description: `The secret used to verify the webhook signature`,
  })
  .min(1)
  .parse(process.env.SUPABASE_DB_WEBHOOK_SECRET);

export async function POST(request: Request) {
  const service = new DatabaseWebhookHandlerService();

  await service.handleWebhook(request, webhooksSecret);

  return new Response(null, {
    status: 200,
  });
}
