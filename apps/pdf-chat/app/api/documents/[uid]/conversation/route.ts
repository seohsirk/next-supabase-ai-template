import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { SupabaseClient } from '@supabase/supabase-js';

import { StreamingTextResponse } from 'ai';
import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import { createConversationTitle } from '~/lib/ai/create-conversation-title';
import { runConversationChain } from '~/lib/ai/run-conversation-chain';
import { Database } from '~/lib/database.types';

export const runtime = 'edge';

interface Params {
  uid: string;
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Params;
  },
) {
  const logger = await getLogger();
  const { messages, create } = getBodySchema().parse(await request.json());
  const conversationId = headers().get('x-conversation-id');

  const client = getSupabaseRouteHandlerClient();
  const session = await client.auth.getSession();

  if (!session.data.session) {
    return new Response(`Missing session`, {
      status: 401,
    });
  }

  if (!conversationId) {
    return new Response(`Missing conversation ID`, {
      status: 401,
    });
  }

  let conversation: {
    id: number;
    account_id: string;
  };

  // if the client wants to create a new conversation, we create it
  if (create) {
    try {
      const input = messages[messages.length - 1]?.content ?? '';

      conversation = await createConversation({
        input,
        documentId: params.uid,
        client,
        conversationId,
      });
    } catch (error) {
      logger.error({ error }, `Error creating conversation`);

      return new Response(`Error creating conversation`, {
        status: 500,
      });
    }
  } else {
    const { error, data } = await client
      .from('conversations')
      .select('id, account_id')
      .eq('reference_id', conversationId)
      .single();

    if (error) {
      logger.error(`Error fetching conversation`, error);

      return new Response(`Error fetching conversation`, {
        status: 500,
      });
    }

    conversation = data;
  }

  const { data: remainingTokens } = await client.rpc('get_remaining_tokens');

  // set a minimum number of tokens left to respond to a message
  // so we can safely assume that the user won't run out of tokens mid-conversation
  const minimumTokensRequired = 1000;

  if (!remainingTokens || remainingTokens < minimumTokensRequired) {
    logger.info(
      {
        conversationId,
        remainingTokens,
        minimumTokensRequired,
      },
      `Not enough tokens to respond to message`,
    );

    return new Response(`User does not have enough tokens`, {
      status: 402,
    });
  }

  const adminClient = getSupabaseRouteHandlerClient({
    admin: true,
  });

  const stream = await runConversationChain({
    client,
    adminClient,
    conversationId: conversation.id,
    accountId: conversation.account_id,
    documentId: params.uid,
    chatHistory: messages,
  });

  // if the AI can generate a response, we return a streaming response
  logger.info(
    {
      conversationId,
    },
    `Stream generated. Sending response...`,
  );

  return new StreamingTextResponse(stream);
}

function getBodySchema() {
  return z.object({
    create: z.boolean(),
    messages: z.array(
      z.object({
        content: z.string(),
        role: z.enum(['user', 'assistant'] as const),
      }),
    ),
  });
}

async function createConversation(params: {
  client: SupabaseClient<Database>;
  input: string;
  documentId: string;
  conversationId: string;
}) {
  const logger = await getLogger();
  const { input, documentId, client } = params;
  const title = await createConversationTitle(input);
  const auth = await requireUser(client);

  if (!auth?.data) {
    throw new Error(`Unauthorized`);
  }

  logger.info(
    {
      title,
    },
    `Conversation title successfully generated`,
  );

  const accountId = auth.data.id;

  logger.info(
    {
      accountId,
      documentId,
      title,
    },
    `Inserting conversation into database...`,
  );

  const { error, data } = await client
    .from('conversations')
    .insert({
      name: title,
      document_id: params.documentId,
      account_id: accountId,
      reference_id: params.conversationId,
    })
    .select('id, account_id')
    .single();

  if (error) {
    throw error;
  }

  logger.info(
    {
      conversationId: data.id,
    },
    `Conversation successfully inserted into database`,
  );

  return data;
}
