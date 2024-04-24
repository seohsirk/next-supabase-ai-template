import { DatabaseWebhookHandlerService } from '@kit/database-webhooks';

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
    await service.handleWebhook(request);

    return response(200);
  } catch {
    return response(500);
  }
}
