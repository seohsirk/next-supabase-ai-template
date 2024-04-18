import 'server-only';

import { getLogger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import { RecordChange, Tables } from '../record-change.type';
import { DatabaseWebhookRouterService } from './database-webhook-router.service';
import { getDatabaseWebhookVerifier } from './verifier';

export class DatabaseWebhookHandlerService {
  private readonly namespace = 'database-webhook-handler';

  async handleWebhook(request: Request) {
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
    const verifier = await getDatabaseWebhookVerifier();

    await verifier.verifySignatureOrThrow(request);

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
}
