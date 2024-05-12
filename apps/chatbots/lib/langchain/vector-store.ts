import type { SupabaseClient } from '@supabase/supabase-js';

import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';

import { Database } from '~/lib/database.types';

export function getVectorStore(client: SupabaseClient<Database>) {
  return SupabaseVectorStore.fromExistingIndex(new OpenAIEmbeddings(), {
    client,
    tableName: 'documents_embeddings',
    queryName: 'match_documents',
  });
}
