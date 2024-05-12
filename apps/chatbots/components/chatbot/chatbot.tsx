'use client';

import { ChatBotContextProvider } from '~/components/chatbot/chatbot-context';
import { ChatbotSettings } from '~/components/chatbot/lib/types';

import { ChatbotContainer } from './chatbot-container';

interface ChatBotProps {
  chatbotId: string;
  siteName: string;

  conversationId?: string;
  defaultPrompts?: string[];
  isOpen?: boolean;
  isDisabled?: boolean;
  settings?: ChatbotSettings;
  storageKey?: string;

  onClear?: () => void;
  onMessage?: (message: string) => void;
}

function ChatBot(props: ChatBotProps) {
  const {
    defaultPrompts = [],
    isOpen = false,
    isDisabled = false,
    settings,
    chatbotId,
    conversationId,
    storageKey,
    siteName,
    onClear,
    onMessage,
  } = props;

  return (
    <ChatBotContextProvider state={{ isOpen, isDisabled, settings }}>
      <ChatbotContainer
        conversationId={conversationId}
        chatbotId={chatbotId}
        defaultPrompts={defaultPrompts}
        storageKey={storageKey}
        siteName={siteName}
        onClear={onClear}
        onMessage={onMessage}
      />
    </ChatBotContextProvider>
  );
}

export default ChatBot;
