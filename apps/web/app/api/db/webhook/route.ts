import { z } from 'zod';

import { DatabaseWebhookHandlerService } from '@kit/database-webhooks';

const webhooksSecret = z
  .string({
    description: `The secret used to verify the webhook signature`,
  })
  .min(1)
  .parse(process.env.SUPABASE_DB_WEBHOOK_SECRET);

const service = new DatabaseWebhookHandlerService();

const response = (status: number) => new Response(null, { status });

/**
 * @name POST
 * @description POST handler for the webhook route that handles the webhook event
 * @param request
 * @constructor
 */
export async function POST(request: Request) {
  try {
    // handle the webhook event
    await service.handleWebhook(request, webhooksSecret);

    return response(200);
  } catch {
    return response(500);
  }
}
