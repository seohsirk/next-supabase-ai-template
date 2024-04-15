'use client';

import { useCallback, useEffect, useState } from 'react';
import ChatContainer from './chat-container';
import ConversationsSidebar from './conversation-sidebar';
import { PageBody, PageHeader } from '~/core/ui/Page';
import If from '~/core/ui/If';
import DocumentActionsDropdown from './document-actions-dropdown';

interface Conversation {
  id: string;
  name: string;
}

function DocumentPageContainer(props: React.PropsWithChildren<{
  doc: {
    id: string;
    name: string;
  };

  conversation: Maybe<Conversation>;
  conversations: Conversation[];
}>) {
  const [conversation, setConversation] = useState(props.conversation);
  const [conversations, setConversations] = useState(props.conversations);

  // when creating a new conversation, we need to add it to the list
  const onCreateConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => [{ ...conversation, new: true }, ...prev]);
    setConversation(conversation);
  }, []);

  // we need to update the conversation and conversations when the props change
  useEffect(() => {
    setConversations(props.conversations);

    const isSelectedConversationExisting = props.conversations.some((conversation) => {
      return conversation.id === props.conversation?.id;
    });

    if (!isSelectedConversationExisting) {
      setConversation(undefined);
    }
  }, [props.conversation, props.conversations]);

  return (
    <>
      <div className={'w-2/12 min-w-72 h-full py-container'}>
        <PageBody className='h-full'>
          <ConversationsSidebar
            conversations={conversations}
            conversation={conversation}
            setConversation={setConversation}
          />
        </PageBody>
      </div>

      <div className={'w-9/12 flex flex-col flex-1 divide-y'}>
        <div className='flex justify-between items-center'>
          <PageHeader title={props.doc.name} />

          <If condition={conversation}>
            {({ id }) => <DocumentActionsDropdown conversationId={id} />}
          </If>
        </div>

        <ChatContainer
          documentId={props.doc.id}
          conversation={conversation}
          onCreateConversation={onCreateConversation}
        />
      </div>
    </>
  );
}

export default DocumentPageContainer;