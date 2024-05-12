'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { ChatbotSettings } from '~/components/chatbot/lib/types';
import { CreateChatbotFormSchema } from '~/home/[account]/chatbots/[chatbot]/_lib/schema/create-chatbot.schema';
import { DesignChatbotSchema } from '~/home/[account]/chatbots/[chatbot]/_lib/schema/design-chatbot.schema';
import { createChatbotsService } from '~/home/[account]/chatbots/_lib/server/chatbots-service';

interface SitemapFilters {
  allow: string[];
  disallow: string[];
}

export const createChatbotAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerActionClient();
    const service = createChatbotsService(client);

    const chatbot = await service.insertChatbot({
      ...data,
      site_name: data.siteName,
      account_id: data.accountId,
    });

    redirect(`chatbots/${chatbot.id}/documents`);
  },
  {
    schema: CreateChatbotFormSchema,
  },
);

export const getSitemapLinksAction = enhanceAction(
  async (params: { chatbotId: string; filters: SitemapFilters }) => {
    const client = getSupabaseServerActionClient();
    const logger = await getLogger();
    const { default: Crawler } = await import('~/lib/chatbots/crawler');
    const crawler = new Crawler();

    logger.info(
      {
        chatbotId: params.chatbotId,
      },
      `Getting sitemap links...`,
    );

    const service = createChatbotsService(client);

    const chatbot = await service.getChatbot(params.chatbotId);
    const sites = await crawler.getSitemapLinks(chatbot.url);
    const links = crawler.filterLinks(sites, params.filters);

    logger.info(
      {
        numberOfPages: links.length,
      },
      `Sitemap links retrieved successfully.`,
    );

    return {
      numberOfPages: sites.length,
      numberOfFilteredPages: links.length,
    };
  },
);

export const createChatbotCrawlingJobAction = enhanceAction(
  async (body: { chatbotId: string; filters: SitemapFilters }) => {
    const { QStashTaskQueue } = await import('@makerkit/qstash');

    const queue = new QStashTaskQueue<typeof body>({
      url: process.env.CHATBOTS_TASK_QUEUE_URL,
    });

    await queue.create({
      body,
    });

    revalidatePath(`/home/[account]/chatbots/[chatbot]/training`, `page`);

    return redirect(`training`);
  },
);

export const deleteDocumentAction = enhanceAction(async (data: FormData) => {
  const client = getSupabaseServerActionClient();
  const logger = await getLogger();

  const documentId = z.coerce.number().parse(data.get('documentId'));

  logger.info(
    {
      documentId,
    },
    `Deleting document...`,
  );

  const service = createChatbotsService(client);

  const response = await service.deleteDocument(documentId);

  if (response.error) {
    logger.error(
      {
        documentId,
        error: response.error,
      },
      `Failed to delete document.`,
    );

    throw new Error(`Failed to delete document.`);
  }

  logger.info(
    {
      documentId,
    },
    `Document deleted successfully.`,
  );

  revalidatePath(`/home/[account]/chatbots/[chatbot]/documents`, `page`);
});

export const saveChatbotSettingsAction = async (
  prevState:
    | {
        success: boolean;
      }
    | undefined,
  data: z.infer<typeof DesignChatbotSchema>,
) => {
  const { chatbotId, ...body } = DesignChatbotSchema.parse(data);

  const client = getSupabaseServerActionClient();
  const logger = await getLogger();

  const settings: ChatbotSettings = {
    title: body.title,
    position: body.position,
    branding: {
      textColor: body.textColor,
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
    },
  };

  logger.info(
    {
      chatbotId,
    },
    `Updating chatbot settings...`,
  );

  const service = createChatbotsService(client);

  const { error } = await service.updateChatbotSettings(chatbotId, settings);

  if (error) {
    logger.error(
      {
        chatbotId,
        error,
      },
      `Failed to update chatbot settings.`,
    );

    return {
      success: false,
    };
  }

  logger.info(
    {
      chatbotId,
    },
    `Chatbot settings updated successfully.`,
  );

  revalidatePath(`/home/[account]/chatbots/[chatbot]/design`, `page`);

  return {
    success: true,
  };
};
