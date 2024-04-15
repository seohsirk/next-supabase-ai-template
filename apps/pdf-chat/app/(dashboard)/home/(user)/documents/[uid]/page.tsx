import { notFound } from 'next/navigation';

import { withI18n } from '~/i18n/with-i18n';
import getSupabaseServerComponentClient from '~/core/supabase/server-component-client';

import loadAppData from '~/lib/server/loaders/load-app-data';
import DocumentPageContainer from './components/DocumentPageContainer';

interface DocumentPageParams {
  params: {
    organization: string;
    uid: string;
  };

  searchParams: {
    conversation: string;
  };
}

async function DocumentPage({ params, searchParams }: DocumentPageParams) {
  const client = getSupabaseServerComponentClient();
  const appData = await loadAppData(params.organization);

  // fetch the document and conversations
  const { doc, conversations } = await getData(client, params.uid)
  const isSameOrganization = doc.organization_id === appData.organization?.id;

  // if the document is not found or the user is not in the same organization
  // as the document, then return a 404
  if (!appData.organization?.id || !isSameOrganization) {
    return notFound();
  }

  // retrieve the conversation from the list of conversations
  const conversation = conversations.find((conversation) => {
    return conversation.id === searchParams.conversation;
  });

  return (
    <div className={'h-screen flex flex-col flex-1'}>
      <div
        className={
          'divide divide-x divide-gray-100 dark:divide-dark-900 flex flex-1 h-full'
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

async function getData(client: ReturnType<typeof getSupabaseServerComponentClient>, documentId: string) {
  const doc = client
    .from('documents')
    .select(`
      id,
      organization_id,
      title
    `)
    .filter('id', 'eq', documentId)
    .single();

  const conversations = client
    .from('conversations')
    .select(`
      id: reference_id,
      name,
      created_at
    `)
    .filter('document_id', 'eq', documentId)
    .order('created_at', { ascending: false });

  const [docResponse, conversationsResponse] = await Promise.all([doc, conversations]);

  if (!docResponse.data) {
    return notFound();
  }

  return {
    doc: docResponse.data,
    conversations: conversationsResponse.data ?? [],
  };
}
