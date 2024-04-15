'use client';

import { useCallback, useEffect, useRef } from 'react';
import classNames from 'clsx';
import { useChat } from 'ai/react';
import { Message } from 'ai';
import useQuery, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

import { fetchDataFromSupabase } from '@makerkit/data-loader-supabase-core';

import MessageContainer from './message-container';
import ChatTextField from './chat-text-field';
import useCsrfToken from '~/core/hooks/use-csrf-token';
import useSupabase from '~/core/hooks/use-supabase';
import If from '~/core/ui/If';
import LoadingBubble from './loading-bubble';
import { getConversationByReferenceId } from '../../server-actions';
import Heading from '~/core/ui/Heading';

function ChatContainer({
  conversation,
  onCreateConversation,
  documentId,
}: {
  conversation: Maybe<{
    id: string;
    name: string;
  }>;

  onCreateConversation: (conversation: { name: string; id: string }) => void;
  documentId: string;
}) {
  // fetch the list of messages for this conversation
  const {
    data: messages,
    isLoading,
    isValidating,
  } = useConversationMessages(conversation);

  // display the loader if the messages are loading or
  // if the messages are being validated
  const displayLoader = isLoading || isValidating;

  return (
    <>
      <ChatBodyContainer
        className={classNames('transition-opacity', {
          ['opacity-40 pointer-events-none']: displayLoader
        })}
        conversationId={conversation?.id}
        documentId={documentId}
        messages={messages}
        onCreateConversation={onCreateConversation}
      />
    </>
  );
}

function ChatBodyContainer(props: {
  className?: string;
  conversationId: Maybe<string>;
  documentId: string;
  messages: Maybe<Message[]> | null;
  onCreateConversation: (conversation: { name: string; id: string }) => void;
}) {
  // set a ref for the conversation id - or generate a new one if there is none
  const conversationIdRef = useRef(props.conversationId);
  const { mutate } = useSWRConfig();

  const scrollingDiv = useRef<HTMLDivElement>();
  const csrfToken = useCsrfToken();
  const scrollToBottom = useScrollToBottom(scrollingDiv);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: getApiEndpoint(props.documentId),
    headers: {
      'x-csrf-token': csrfToken,
      'x-conversation-id': conversationIdRef.current ?? '',
    },
    body: {
      create: !props.conversationId,
    },
    initialMessages: props.messages || undefined,
    onError: (error) => {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    },
    onFinish: async (message) => {
      // scroll to the bottom when the message is sent
      scrollToBottom({ smooth: true });

      // we need to update the cache with the new message
      // so that we don't have to fetch it from the API the next time
      const updateCache = async () => {
        const cacheKey = getConversationIdStorageKey(conversationIdRef.current);

        const userMessage = {
          id: nanoid(),
          content: input,
          createdAt: new Date(),
          role: 'user',
        };

        const nextCache = [...(messages ?? []), userMessage, message];

        return mutate(cacheKey, nextCache);
      };

      // if the conversation id is already set, we just update the cache
      if (props.conversationId) {
        return updateCache();
      }

      // if there is no conversation id, it means the user created a new conversation
      // in this case, we fetch the conversation from the API and update the UI
      try {
        if (!conversationIdRef.current) {
          conversationIdRef.current = createConversationReferenceId();
        }

        const data = await getConversationByReferenceId(
          conversationIdRef.current,
        );

        // once the conversation is created, we update the UI
        if (data) {
          conversationIdRef.current = data.reference_id;

          // dispatch an event to the parent component
          // so that it can display the new conversation in the sidebar
          props.onCreateConversation({
            id: data.reference_id,
            name: data.name,
          });

          // update the cache
          await updateCache();
        }
      } catch {
        toast.error(
          'Something went wrong creating your conversation. Please try again.',
        );
      }
    },
  });

  // when the messages change, we need to update the state
  useEffect(() => {
    if (props.messages) {
      setMessages(props.messages);
    }

    // scroll to the bottom when the messages change
    scrollToBottom({ smooth: true });
  }, [props.messages, setMessages, scrollToBottom]);

  // when the conversation id changes, we need to update the ref
  useEffect(() => {
    if (props.conversationId) {
      conversationIdRef.current = props.conversationId;
    } else {
      conversationIdRef.current = createConversationReferenceId();
      setMessages([]);
    }
  }, [props.conversationId, setMessages]);

  return (
    <div
      className={classNames(
        'm-auto flex h-full w-full flex-col flex-1 space-y-4 pt-container',
        props.className,
      )}
    >
      <div
        className={'order-1 flex-[1_1_0] overflow-y-auto px-container'}
        ref={(div) => (scrollingDiv.current = div ?? undefined)}
      >
        <div className={'mx-auto h-full w-full'}>
          <ChatMessagesContainer messages={messages} loading={isLoading} />
        </div>
      </div>

      <div className={'order-2 justify-end'}>
        <ChatTextField
          loading={isLoading}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

function ChatMessagesContainer({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  if (!messages.length) {
    if (loading) {
      return <LoadingBubble />;
    }

    return <NoMessageEmptySpace />;
  }

  return (
    <div className={'m-auto flex flex-col space-y-2'}>
      {messages.map((message) => {
        return <ChatMessageItem key={message.id} message={message} />;
      })}

      <If condition={loading}>
        <LoadingBubble />
      </If>
    </div>
  );
}

function ChatMessageItem({
  message,
}: React.PropsWithChildren<{ message: Message }>) {
  return (
    <div className={classNames(`flex h-fit w-full animate-in fade-in-90`)}>
      <div
        className={'m-auto flex w-full whitespace-pre-wrap break-words'}
        style={{
          wordBreak: 'break-word',
        }}
      >
        <MessageContainer message={message} />
      </div>
    </div>
  );
}

function NoMessageEmptySpace() {
  return (
    <div
      className={
        'm-auto flex h-full flex-1 space-y-2.5 flex-col items-center justify-center'
      }
    >
      <div>
        <Heading type={3}>Hello, how can I help you?</Heading>
      </div>

      <span className={'text-gray-500 dark:text-gray-400'}>
        Ask me anything about this document - I&apos;ll do my best to help you.
      </span>
    </div>
  );
}

export default ChatContainer;

function useConversationMessages(
  conversation: Maybe<{
    id: string;
    name: string;
  }>,
) {
  const client = useSupabase();

  const queryFn = async () => {
    if (!conversation) {
     return null;
    }

    const { data, error } = await fetchDataFromSupabase({
      client,
      table: 'messages',
      camelCase: true,
      limit: 50,
      select: `
        id,
        text,
        sender,
        conversation_id !inner (
          reference_id
        )
      `,
      where: {
        'conversation_id.reference_id': {
          eq: conversation.id,
        },
      },
    });

    if (error) {
      throw error;
    }

    return (data ?? []).map((message) => {
      return {
        id: message.id.toString(),
        role: message.sender,
        content: message.text,
      };
    });
  };

  type Data = Awaited<ReturnType<typeof queryFn>>;

  const key = conversation?.id ? getConversationIdStorageKey(conversation?.id) : null;

  return useQuery<Data>(key, queryFn, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateIfStale: false,
  });
}

function getConversationIdStorageKey(conversationId: Maybe<string>) {
  return `conversation-${conversationId}`;
}

function useScrollToBottom(
  scrollingDiv: React.MutableRefObject<HTMLDivElement | undefined>,
) {
  return useCallback(
    ({ smooth } = { smooth: false }) => {
      setTimeout(() => {
        if (scrollingDiv.current) {
          scrollingDiv.current?.scrollTo({
            behavior: smooth ? 'smooth' : 'auto',
            top: scrollingDiv.current.scrollHeight,
          });
        }
      }, 50);
    },
    [scrollingDiv],
  );
}

function getApiEndpoint(documentId: string) {
  return `/api/documents/${documentId}/conversation`;
}

function createConversationReferenceId() {
  return nanoid(12);
}
