import { ChatOpenAI } from '@langchain/openai';
import { formatDocumentsAsString } from 'langchain/util/document';
import { RunnableSequence } from '@langchain/core/runnables';
import { LLMResult } from '@langchain/core/outputs';
import { ConsoleCallbackHandler } from '@langchain/core/tracers/console';

import { PromptTemplate } from '@langchain/core/prompts';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DocumentCompressorPipeline } from 'langchain/retrievers/document_compressors';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { EmbeddingsFilter } from "langchain/retrievers/document_compressors/embeddings_filter";

import { SupabaseClient } from '@supabase/supabase-js';
import { encode } from 'gpt-tokenizer';

import getVectorStore from '~/lib/ai/vector-store';
import { Database } from '~/database.types';
import getLogger from '~/core/logger';
import getEmbeddingsModel from '~/lib/ai/embeddings-model';

const LLM_MODEL_NAME = process.env.LLM_MODEL_NAME || 'gpt-turbo-3.5';
const LLM_BASE_URL = process.env.LLM_BASE_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;

const MAX_DOCUMENTS_CONTEXT = 3;

type ChatHistory = Array<{
  content: string;
  role: 'user' | 'assistant';
}>;

export default async function runConversationChain(params: {
  adminClient: SupabaseClient<Database>;
  conversationId: number;
  organizationId: number;
  documentId: string;
  chatHistory: ChatHistory;
}) {
  const { adminClient, chatHistory, documentId } = params;
  const question = chatHistory[chatHistory.length - 1].content;

  chatHistory.pop();

  const callbacks: Array<BaseCallbackHandler> = [
    new StreamEndCallbackHandler(
      adminClient,
      params.organizationId,
      params.conversationId,
      question,
    ),
    new ConsoleCallbackHandler(),
  ];

  const model = createModel({
    streaming: true,
    temperature: 0,
    callbacks,
  });

  const retriever = await getVectorStoreRetriever(adminClient, documentId);

  const chain = RunnableSequence.from([
    {
      question: (input: { question: string; chatHistory?: ChatHistory }) =>
        input.question,
    },
    {
      question: (previousStepResult: {
        question: string;
        chatHistory?: ChatHistory;
      }) => previousStepResult.question,
      chatHistory: (previousStepResult: {
        question: string;
        chatHistory?: ChatHistory;
      }) => serializeChatHistory(previousStepResult.chatHistory ?? []),
      context: async (previousStepResult: {
        question: string;
        chatHistory?: string;
      }) => {
        const relevantDocs = await retriever.getRelevantDocuments(
          previousStepResult.question,
        );

        return formatDocumentsAsString(relevantDocs);
      },
    },
    getQuestionPrompt(),
    model,
    new StringOutputParser(),
  ]);

  return chain.stream({
    question,
    chatHistory,
  });
}

async function insertConversationMessages(params: {
  conversationId: number;
  organizationId: number;
  client: SupabaseClient<Database>;
  text: string;
  previousMessage: string;
}) {
  const table = params.client.from('messages');

  if (!params.conversationId) {
    getLogger().warn(
      {
        conversationReferenceId: params.conversationId,
      },
      `Conversation not found. Can't insert messages.`,
    );

    return {
      error: new Error(`Conversation not found. Can't insert messages.`),
    };
  }

  return table.insert([
    {
      conversation_id: params.conversationId,
      organization_id: params.organizationId,
      text: params.previousMessage,
      sender: 'user' as const,
    },
    {
      conversation_id: params.conversationId,
      organization_id: params.organizationId,
      text: params.text,
      sender: 'assistant' as const,
    },
  ]);
}

class StreamEndCallbackHandler extends BaseCallbackHandler {
  name = 'handle-stream-end';

  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly organizationId: number,
    private readonly conversationId: number,
    private readonly previousMessage: string,
  ) {
    super();
  }

  async handleLLMEnd(output: LLMResult) {
    const logger = getLogger();

    logger.info(
      {
        conversationId: this.conversationId,
      },
      `[handleLLMEnd] Inserting messages...`,
    );

    const generations = output.generations;

    const text = generations.reduce((acc, generationsList) => {
      return (
        acc +
        generationsList.reduce((innerAcc, generation) => {
          return innerAcc + `\n` + generation.text;
        }, '')
      );
    }, '');

    // we need to calculate the tokens usage
    // langchain doesn't provide this information (at least not consistently)
    const queryTokens = encode(this.previousMessage).length;
    const replyTokens = encode(text).length;
    const totalTokens = queryTokens + replyTokens;

    return await Promise.allSettled([
      this.handleInsertMessages(text),
      this.handleTokensUsage(totalTokens),
    ]);
  }

  private async handleInsertMessages(text: string) {
    const logger = getLogger();

    logger.info({
      conversationId: this.conversationId,
    }, `Inserting messages...`);

    const response = await insertConversationMessages({
      client: this.client,
      organizationId: this.organizationId,
      conversationId: this.conversationId,
      previousMessage: this.previousMessage,
      text,
    });

    if (response.error) {
      logger.error(
        {
          conversationId: this.conversationId,
          error: response.error,
        },
        `Error inserting messages.`,
      );
    } else {
      logger.info(
        {
          conversationId: this.conversationId,
        },
        `Successfully inserted messages.`,
      );
    }
  }

  private async handleTokensUsage(totalTokens: number) {
    const logger = getLogger();

    logger.info({
      conversationId: this.conversationId,
    }, `Reporting tokens usage...`);

    // we need to calculate the tokens usage and report it
    const { data: remainingTokens } = await this.client.rpc('get_remaining_tokens', {
      conversation_id: this.conversationId,
    });

    const tokens = (remainingTokens ?? 0) - totalTokens;

    const response = await this.client
      .from('organization_usage')
      .update({
        tokens_quota: tokens,
      })
      .match({
        organization_id: this.organizationId,
      });

    if (response.error) {
      console.error(response.error);

      logger.error(
        {
          conversationId: this.conversationId,
          error: response.error,
          tokens,
        },
        `Error reporting tokens usage.`,
      );
    } else {
      logger.info(
        {
          conversationId: this.conversationId,
          tokens,
        },
        `Successfully reported tokens usage.`,
      );
    }
  }
}

async function getVectorStoreRetriever(
  client: SupabaseClient<Database>,
  documentId: string,
) {
  const chunkSize = 200;
  const chunkOverlap = 0;
  const similarityThreshold = 0.5;
  const maxDocuments = 5;

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const embeddingsFilter = new EmbeddingsFilter({
    embeddings: getEmbeddingsModel(),
    similarityThreshold: similarityThreshold,
    k: maxDocuments,
  });

  const compressorPipeline = new DocumentCompressorPipeline({
    transformers: [textSplitter, embeddingsFilter],
  });

  const vectorStore = await getVectorStore(client);

  const retriever = vectorStore.asRetriever(MAX_DOCUMENTS_CONTEXT, (filter) => {
    return filter.eq('metadata -> document_id::uuid', `"${documentId}"`);
  });

  return new ContextualCompressionRetriever({
    baseCompressor: compressorPipeline,
    baseRetriever: retriever,
  });
}

function getQuestionPrompt() {
  return PromptTemplate.fromTemplate(
    `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
      ----------------
      CHAT HISTORY: {chatHistory}
      ----------------
      CONTEXT: {context}
      ----------------
      QUESTION: {question}
      ----------------
      Helpful Answer:`,
  );
}

function serializeChatHistory(chatHistory: ChatHistory) {
  return (chatHistory ?? []).reduce((acc, message) => {
    return acc + `\n` + message.role + `:` + message.content + `\n`;
  }, '');
}

function createModel(props: {
  callbacks?: BaseCallbackHandler[];
  streaming?: boolean;
  temperature?: number;
}) {
  return new ChatOpenAI({
    modelName: LLM_MODEL_NAME,
    temperature: props.temperature ?? 0,
    streaming: props.streaming ?? true,
    maxTokens: 200,
    openAIApiKey: LLM_API_KEY,
    configuration: {
      baseURL: LLM_BASE_URL,
    },
    callbacks: props.callbacks ?? [],
  });
}
