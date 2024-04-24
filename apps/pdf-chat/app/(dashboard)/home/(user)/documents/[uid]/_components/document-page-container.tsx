'use client';

import { useCallback, useEffect, useState } from 'react';



import { If } from '@kit/ui/if';
import {PageBody, PageHeader} from '@kit/ui/page';



import { ChatContainer } from './chat-container';
import { ConversationsSidebar } from './conversation-sidebar';
import { DocumentActionsDropdown } from './document-actions-dropdown';


interface Conversation {
  id: string;
  name: string;
}

export function DocumentPageContainer(
  props: React.PropsWithChildren<{
    doc: {
      id: string;
      name: string;
    };

    conversation: Conversation | undefined;
    conversations: Conversation[];
  }>,
) {
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

    const isSelectedConversationExisting = props.conversations.some(
      (conversation) => {
        return conversation.id === props.conversation?.id;
      },
    );

    if (!isSelectedConversationExisting) {
      setConversation(undefined);
    }
  }, [props.conversation, props.conversations]);

  return (
    <>
      <div className={'py-4 h-full w-2/12 min-w-72'}>
        <PageBody className="h-full">
          <ConversationsSidebar
            conversations={conversations}
            conversation={conversation}
            setConversation={setConversation}
          />
        </PageBody>
      </div>

      <div className={'flex w-9/12 flex-1 flex-col divide-y'}>
        <div className="flex items-center justify-between">
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
