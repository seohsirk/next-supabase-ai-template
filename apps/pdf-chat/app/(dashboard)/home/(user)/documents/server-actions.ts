'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';
import { isWithinTokenLimit } from 'gpt-tokenizer';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import getSupabaseServerActionClient from '~/core/supabase/action-client';
import getSdk from '~/lib/sdk';
import configuration from '~/configuration';
import getLogger from '~/core/logger';
import getVectorStore from '~/lib/ai/vector-store';
import parsePdf from '~/lib/ai/parse-pdf';
import { withSession } from '~/core/generic/actions-utils';

const schema = z.object({
  path: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
});

const DOCUMENT_CHUNK_SIZE = process.env.DOCUMENT_CHUNK_SIZE ? Number(process.env.DOCUMENT_CHUNK_SIZE) : 1500;

export const addDocument = withSession(
  async (params: { path: string; title: string }) => {
    const logger = getLogger();
    const client = getSupabaseServerActionClient();
    const sdk = getSdk(client);
    const organization = await sdk.organization.getCurrent();

    logger.info(params, `Uploading document...`);

    if (!organization) {
      throw new Error(`No organization found`);
    }

    const { path, title } = schema.parse(params);

    const storageDocument = await client.storage
      .from('documents')
      .download(path);

    if (storageDocument.error) {
      throw storageDocument.error;
    }

    const documentData = await storageDocument.data.arrayBuffer();
    const text = await parsePdf(documentData) as string;

    const { data } = await client
      .from('organization_usage')
      .select('tokens_quota')
      .eq('organization_id', organization.id)
      .single();

    const remainingTokens = data?.tokens_quota ?? 0;

    if (!remainingTokens) {
      logger.info({
        remainingTokens,
        organizationId: organization.id,
      }, `No tokens left to index this document`);

      throw new Error(`You can't index more documents`);
    }

    const tokensCount = isWithinTokenLimit(text as string, remainingTokens);

    if (tokensCount === false) {
      logger.info({
        remainingTokens,
        tokensCount,
        organizationId: organization.id,
      }, `Not enough tokens to index this document`);

      throw new Error(`You don't have enough tokens to index this document`);
    }

    if (tokensCount === 0) {
      logger.info({
        remainingTokens,
        tokensCount,
        organizationId: organization.id,
      }, `Document is empty. Likely parsing error.`);

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

    logger.info({
      title,
      organizationId: organization.id,
    }, `Inserting document into database...`);

    const documentResponse = await adminClient
      .from('documents')
      .insert({
        title,
        organization_id: organization.id,
      })
      .select('id')
      .single();

    if (documentResponse.error) {
      throw documentResponse.error;
    }

    logger.info({
      title,
      organizationId: organization.id,
      documentId: documentResponse.data.id,
    }, `Document inserted into database`);

    logger.info({
      title,
      organizationId: organization.id,
      documentId: documentResponse.data.id,
    }, `Inserting document embeddings...`);

    const documentEmbeddings = splittedDocs.map(item => {
      return {
        pageContent: item,
        metadata: {
          name: title,
          organization_id: organization.id,
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
      .from('organization_usage')
      .update({ tokens_quota: remainingTokens - tokensCount })
      .eq('organization_id', organization.id);

    if (error) {
      logger.error({
        error,
        organizationId: organization.id,
      }, `Failed to update organization usage`);
    } else {
      logger.info({
        organizationId: organization.id,
      }, `Organization usage updated successfully`);
    }

    try {
      logger.info(
        {
          organizationId: organization.id,
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
          organizationId: organization.id,
        },
        `Failed to remove document from storage`,
      );
    }

    logger.info({}, `Redirecting to document page...`);

    const redirectPath = [
      configuration.paths.appHome,
      organization.uuid,
      'documents',
      documentResponse.data.id,
    ].join('/');

    return redirect(redirectPath);
  },
);

export const deleteDocument = withSession(async (documentId: string) => {
  const client = getSupabaseServerActionClient();

  const { error } = await client
    .from('documents')
    .delete()
    .match({ id: documentId });

  if (error) {
    throw error;
  }

  revalidatePath(`/dashboard/[organization]/documents`, 'page');

  return {
    success: true,
  };
});

export const deleteConversation = withSession(async (referenceId: string) => {
  const client = getSupabaseServerActionClient();

  const { error } = await client.from('conversations').delete().match({
    reference_id: referenceId,
  });

  if (error) {
    throw error;
  }

  revalidatePath(`/dashboard/[organization]/documents/[uid]`, 'page');

  return {
    success: true,
  };
});

export const clearConversation = withSession(async (referenceId: string) => {
  const client = getSupabaseServerActionClient();

  const conversation = await getConversationByReferenceId(referenceId);

  const { error } = await client.from('messages').delete().match({
    conversation_id: conversation.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath(`/dashboard/[organization]/documents/[uid]`, 'page');

  return {
    success: true,
  };
});

export async function getConversationByReferenceId(
  conversationReferenceId: string,
) {
  const client = getSupabaseServerActionClient();

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
