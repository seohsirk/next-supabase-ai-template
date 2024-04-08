import 'server-only';

import { getLogger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import { RecordChange, Tables } from '../record-change.type';
import { DatabaseWebhookRouterService } from './database-webhook-router.service';

export class DatabaseWebhookHandlerService {
  private readonly namespace = 'database-webhook-handler';

  async handleWebhook(request: Request, webhooksSecret: string) {
    const logger = await getLogger();

    const json = await request.clone().json();
    const { table, type } = json as RecordChange<keyof Tables>;

    logger.info(
      {
        name: this.namespace,
        table,
        type,
      },
      'Received webhook from DB. Processing...',
    );

    // check if the signature is valid
    this.assertSignatureIsAuthentic(request, webhooksSecret);

    // all good, handle the webhook

    // create a client with admin access since we are handling webhooks
    // and no user is authenticated
    const client = getSupabaseRouteHandlerClient({
      admin: true,
    });

    // handle the webhook
    const service = new DatabaseWebhookRouterService(client);

    try {
      // handle the webhook event based on the table
      await service.handleWebhook(json);

      logger.info(
        {
          name: this.namespace,
          table,
          type,
        },
        'Webhook processed successfully',
      );
    } catch (error) {
      logger.error(
        {
          name: this.namespace,
          table,
          type,
          error,
        },
        'Failed to process webhook',
      );

      throw error;
    }
  }

  private assertSignatureIsAuthentic(request: Request, webhooksSecret: string) {
    const header = request.headers.get('X-Supabase-Event-Signature');

    if (header !== webhooksSecret) {
      throw new Error('Invalid signature');
    }
  }
}
