import { Logger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import { RecordChange, Tables } from '../record-change.type';
import { DatabaseWebhookRouterService } from './database-webhook-router.service';

export class DatabaseWebhookHandlerService {
  private readonly namespace = 'database-webhook-handler';

  async handleWebhook(request: Request, webhooksSecret: string) {
    Logger.info(
      {
        name: this.namespace,
      },
      'Received webhook from DB. Processing...',
    );

    // check if the signature is valid
    this.assertSignatureIsAuthentic(request, webhooksSecret);

    const json = await request.json();

    await this.handleWebhookBody(json);
  }

  private handleWebhookBody(body: RecordChange<keyof Tables>) {
    const client = getSupabaseRouteHandlerClient({
      admin: true,
    });

    const service = new DatabaseWebhookRouterService(client);

    return service.handleWebhook(body);
  }

  private assertSignatureIsAuthentic(request: Request, webhooksSecret: string) {
    const header = request.headers.get('X-Supabase-Event-Signature');

    if (header !== webhooksSecret) {
      throw new Error('Invalid signature');
    }
  }
}
