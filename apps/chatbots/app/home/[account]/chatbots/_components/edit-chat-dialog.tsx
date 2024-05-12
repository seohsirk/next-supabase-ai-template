import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { createChatbotsService } from '~/home/[account]/chatbots/_lib/server/chatbots-service';
import { Database } from '~/lib/database.types';

export function EditChatDialog(
  props: React.PropsWithChildren<{
    chatbot: Database['public']['Tables']['chatbots']['Row'];
  }>,
) {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>

      <DialogContent>
        <DialogTitle>
          <Trans i18nKey={'chatbot:editChatbotTitle'} />
        </DialogTitle>

        <form action={updateChatbotAction}>
          <div className={'flex flex-col space-y-4'}>
            <div>
              <p className={'text-sm'}>
                <Trans i18nKey={'chatbot:editChatbotSubheading'} />
              </p>
            </div>

            <input type="hidden" name={'id'} value={props.chatbot.id} />

            <Label>
              <Trans i18nKey={'chatbot:chatbotName'} />
              <Input name={'name'} defaultValue={props.chatbot.name} required />
            </Label>

            <Label>
              <Trans i18nKey={'chatbot:chatbotWebsiteUrl'} />
              <Input
                name={'url'}
                defaultValue={props.chatbot.url}
                required
                type={'url'}
              />
            </Label>

            <Label>
              <Trans i18nKey={'chatbot:chatbotWebsiteName'} />
              <Input
                name={'site_name'}
                defaultValue={props.chatbot.site_name}
                required
              />
            </Label>

            <Label>
              <Trans i18nKey={'chatbot:chatbotDescription'} />
              <Textarea
                name={'description'}
                defaultValue={props.chatbot.description ?? ''}
              />
            </Label>

            <Button>
              <Trans i18nKey={'chatbot:editChatbotSubmitButton'} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function updateChatbotAction(data: FormData) {
  'use server';

  const params = z
    .object({
      name: z.string(),
      description: z.string().nullish().default(''),
      url: z.string().url(),
      site_name: z.string().min(1),
      id: z.string().uuid(),
    })
    .parse(Object.fromEntries(data.entries()));

  const client = getSupabaseServerActionClient();
  const service = createChatbotsService(client);

  const { error } = await service.updateChatbot(params);

  revalidatePath(`/home/[account]/chatbots/[chatbot]`, 'layout');

  return {
    success: !error,
  };
}
