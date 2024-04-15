'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isWithinTokenLimit } from 'gpt-tokenizer';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import parsePdf from '~/lib/ai/parse-pdf';
import getVectorStore from '~/lib/ai/vector-store';
import { Database } from '~/lib/database.types';

const schema = z.object({
  path: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
});

const DOCUMENT_CHUNK_SIZE = process.env.DOCUMENT_CHUNK_SIZE
  ? Number(process.env.DOCUMENT_CHUNK_SIZE)
  : 1500;

export const addDocument = async (params: { path: string; title: string }) => {
  const logger = await getLogger();
  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (!auth?.data) {
    throw new Error(`Unauthorized`);
  }

  logger.info(params, `Uploading document...`);

  const { path, title } = schema.parse(params);

  const storageDocument = await client.storage.from('documents').download(path);

  if (storageDocument.error) {
    throw storageDocument.error;
  }

  const documentData = await storageDocument.data.arrayBuffer();
  const text = (await parsePdf(documentData)) as string;
  const accountId = auth.data.id;

  const { data } = await client
    .from('credits_usage')
    .select('tokens_quota')
    .eq('account_id', accountId)
    .single();

  const remainingTokens = data?.tokens_quota ?? 0;

  if (!remainingTokens) {
    logger.info(
      {
        remainingTokens,
        accountId,
      },
      `No tokens left to index this document`,
    );

    throw new Error(`You can't index more documents`);
  }

  const tokensCount = isWithinTokenLimit(text, remainingTokens);

  if (tokensCount === false) {
    logger.info(
      {
        remainingTokens,
        tokensCount,
        accountId,
      },
      `Not enough tokens to index this document`,
    );

    throw new Error(`You don't have enough tokens to index this document`);
  }

  if (tokensCount === 0) {
    logger.info(
      {
        remainingTokens,
        tokensCount,
        accountId,
      },
      `Document is empty. Likely parsing error.`,
    );

    throw new Error(`Document is empty`);
  }

  const adminClient = getSupabaseServerActionClient({
    admin: true,
  });

  // we create a vector store using the admin client
  // because RLS is enabled on the documents table without policies
  // so we can always check if the user can index documents or not
  const vectorStore = await getVectorStore(adminClient);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: DOCUMENT_CHUNK_SIZE,
    chunkOverlap: 0,
  });

  const splittedDocs = await splitter.splitText(text);

  logger.info(
    {
      title,
      accountId,
    },
    `Inserting document into database...`,
  );

  const documentResponse = await adminClient
    .from('documents')
    .insert({
      title,
      content: text,
      account_id: accountId,
    })
    .select('id')
    .single();

  if (documentResponse.error) {
    throw documentResponse.error;
  }

  logger.info(
    {
      title,
      accountId,
      documentId: documentResponse.data.id,
    },
    `Document inserted into database`,
  );

  logger.info(
    {
      title,
      accountId,
      documentId: documentResponse.data.id,
    },
    `Inserting document embeddings...`,
  );

  const documentEmbeddings = splittedDocs.map((item) => {
    return {
      pageContent: item,
      metadata: {
        name: title,
        account_id: accountId,
        document_id: documentResponse.data.id,
      },
    };
  });

  const docs = await vectorStore.addDocuments(documentEmbeddings);

  logger.info(
    {
      id: docs[0],
    },
    `Document uploaded successfully`,
  );

  logger.info(`Updating organization usage...`);

  const { error } = await adminClient
    .from('credits_usage')
    .update({ tokens_quota: remainingTokens - tokensCount })
    .eq('account_id', accountId);

  if (error) {
    logger.error(
      {
        error,
        accountId,
      },
      `Failed to update account usage`,
    );
  } else {
    logger.info(
      {
        accountId,
      },
      `Account usage updated successfully`,
    );
  }

  try {
    logger.info(
      {
        accountId,
        id: docs[0],
        storagePath: path,
      },
      `Removing document from storage after successful indexing`,
    );

    await client.storage.from('documents').remove([path]);
  } catch (e) {
    logger.error(
      {
        error: e,
        documentId: docs[0],
        storagePath: path,
        accountId,
      },
      `Failed to remove document from storage`,
    );
  }

  logger.info({}, `Redirecting to document page...`);

  return redirect('/home/documents');
};

export const deleteDocument = async (documentId: string) => {
  const client = getSupabaseServerActionClient();

  const { error } = await client
    .from('documents')
    .delete()
    .match({ id: documentId });

  if (error) {
    throw error;
  }

  revalidatePath(`/home/documents`, 'page');

  return {
    success: true,
  };
};

export const deleteConversation = async (referenceId: string) => {
  const client = getSupabaseServerActionClient();

  const { error } = await client.from('conversations').delete().match({
    reference_id: referenceId,
  });

  if (error) {
    throw error;
  }

  revalidatePath(`/home/documents/[uid]`, 'page');

  return {
    success: true,
  };
};

export const clearConversation = async (referenceId: string) => {
  const client = getSupabaseServerActionClient();
  const conversation = await getConversationByReferenceId(referenceId);

  const { error } = await client.from('messages').delete().match({
    conversation_id: conversation.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath(`/home/documents/[uid]`, 'page');

  return {
    success: true,
  };
};

export async function getConversationByReferenceId(
  conversationReferenceId: string,
) {
  const client = getSupabaseServerActionClient<Database>();

  const { data, error } = await client
    .from('conversations')
    .select(
      `
      name,
      reference_id,
      id
    `,
    )
    .eq('reference_id', conversationReferenceId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
