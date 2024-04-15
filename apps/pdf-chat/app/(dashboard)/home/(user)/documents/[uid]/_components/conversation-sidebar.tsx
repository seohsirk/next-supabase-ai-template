'use client';

import {
  ChatBubbleLeftIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

import classNames from 'clsx';
import { useEffect } from 'react';

import Button from '~/core/ui/Button';

type Conversation = {
  id: string;
  name: string;
  new?: true;
};

function ConversationsSidebar(props: {
  conversation: Maybe<Conversation>;
  setConversation: (id: Maybe<Conversation>) => void;
  conversations: Conversation[];
}) {
  // we want to update the URL query params when the conversationId changes
  // without triggering a page reload
  const setSearchParams = (conversationId: Maybe<string>) => {
    if (conversationId) {
      history.replaceState(null, '', `?conversation=${conversationId}`);
    } else {
      history.replaceState(null, '', '?');
    }
  };

  useEffect(() => {
    setSearchParams(props.conversation?.id);
  }, [props.conversation?.id]);

  return (
    <div className="flex flex-col space-y-4">
      <Button
        size={'sm'}
        variant={'outline'}
        block
        onClick={() => {
          props.setConversation(undefined);
          setSearchParams(undefined);
        }}
      >
        <span>New Conversation</span>
      </Button>

      <ul className={'relative flex flex-col space-y-1'}>
        {props.conversations.map((conversation) => {
          const selected = conversation.id === props.conversation?.id

          return (
            <li key={conversation.id}>
              <button
                role="link"
                className={classNames(
                  'py-2 px-2.5 flex font-medium space-x-1 rounded-md text-xs active:bg-gray-100 dark:active:bg-dark-800' +
                    'items-center transition-colors duration-200 truncate max-w-full w-full',
                  {
                    'bg-primary text-primary-foreground': selected,
                    'hover:bg-gray-50 dark:hover:bg-dark-900': !selected,
                    'animate-in fade-in zoom-in-95 duration-500': conversation.new
                  },
                )}
                onClick={() => {
                  props.setConversation(conversation);
                  setSearchParams(conversation.id);
                }}
              >
                <ChatBubbleLeftIcon className={'h-4 w-4 min-w-4 mr-1'} />

                <span className="truncate">{conversation.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ConversationsSidebar;
