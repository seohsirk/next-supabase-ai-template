import { notFound } from 'next/navigation';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { DocumentPageContainer } from './_components/document-page-container';
import {withI18n} from "~/lib/i18n/with-i18n";
import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "~/lib/database.types";

interface DocumentPageParams {
  params: {
    uid: string;
  };

  searchParams: {
    conversation: string;
  };
}

async function DocumentPage({ params, searchParams }: DocumentPageParams) {
  const client = getSupabaseServerComponentClient();

  // fetch the document and conversations
  const { doc, conversations } = await getData(client, params.uid);

  // retrieve the conversation from the list of conversations
  const conversation = conversations.find((conversation) => {
    return conversation.id === searchParams.conversation;
  });

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <div
        className={
          'divide dark:divide-dark-900 flex h-full flex-1 divide-x divide-gray-100'
        }
      >
        <DocumentPageContainer
          doc={{
            id: doc.id,
            name: doc.title,
          }}
          conversations={conversations}
          conversation={conversation}
        />
      </div>
    </div>
  );
}

export default withI18n(DocumentPage);

async function getData(
  client: SupabaseClient<Database>,
  documentId: string,
) {
  const doc = client
    .from('documents')
    .select(
      `
      id,
      account_id,
      title
    `,
    )
    .filter('id', 'eq', documentId)
    .single();

  const conversations = client
    .from('conversations')
    .select(
      `
      id: reference_id,
      name,
      created_at
    `,
    )
    .filter('document_id', 'eq', documentId)
    .order('created_at', { ascending: false });

  const [docResponse, conversationsResponse] = await Promise.all([
    doc,
    conversations,
  ]);

  if (!docResponse.data) {
    return notFound();
  }

  return {
    doc: docResponse.data,
    conversations: conversationsResponse.data ?? [],
  };
}
