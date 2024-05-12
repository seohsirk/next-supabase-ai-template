import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

type ChatbotTable = Database['public']['Tables']['chatbots'];

export function createChatbotsService(client: SupabaseClient<Database>) {
  return new ChatbotsService(client);
}

class ChatbotsService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getChatbot(chatbotId: string) {
    const { data, error } = await this.client
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async insertChatbot(chatbot: ChatbotTable['Insert']) {
    const { error, data } = await this.client
      .from('chatbots')
      .insert(chatbot)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateChatbot(chatbot: ChatbotTable['Update']) {
    const { error } = await this.client
      .from('chatbots')
      .update(chatbot)
      .match({ id: chatbot.id });

    if (error) {
      throw error;
    }
  }

  async deleteChatbot(chatbotId: string) {
    const { error } = await this.client
      .from('chatbots')
      .delete()
      .match({ id: chatbotId });

    if (error) {
      throw error;
    }
  }

  async updateChatbotSettings(
    chatbotId: string,
    settings: ChatbotTable['Update']['settings'],
  ) {
    return this.client
      .from('chatbots')
      .update({ settings })
      .match({ id: chatbotId });
  }

  async deleteDocument(documentId: number) {
    return this.client.from('documents').delete().match({ id: documentId });
  }
}
