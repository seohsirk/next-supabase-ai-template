import { cache } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { createChatbotsService } from '~/home/[account]/chatbots/_lib/server/chatbots-service';

/**
 * @name loadChatbot
 * @description Loads a chatbot from the database
 */
export const loadChatbot = cache((chatbotId: string) => {
  const client = getSupabaseServerComponentClient();
  const service = createChatbotsService(client);

  return service.getChatbot(chatbotId);
});
