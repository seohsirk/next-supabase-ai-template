import { Message } from 'ai';

import { isBrowser } from '@kit/shared/utils';

import { ChatBotMessageRole } from '../lib/message-role.enum';
import appConfig from '../../../config/app.config';

const LOCAL_STORAGE_KEY = createLocalStorageKey();

export const chatBotMessagesStore = {
  loadMessages(key = LOCAL_STORAGE_KEY, siteName: string): Message[] {
    const emptyMessages = [
      {
        id: 'initial-message',
        content: `Hi, I'm the ${siteName} chatbot! How can I help you?`,
        role: ChatBotMessageRole.Assistant,
      },
    ];

    if (!isBrowser()) {
      return emptyMessages;
    }

    const messages = localStorage.getItem(key);

    try {
      if (messages) {
        const parsed = JSON.parse(messages);

        if (!parsed.length) {
          return emptyMessages;
        }

        return parsed;
      }
    } catch (error) {
      return emptyMessages;
    }

    return emptyMessages;
  },
  saveMessages(messages: Message[], key = LOCAL_STORAGE_KEY) {
    localStorage.setItem(key, JSON.stringify(messages));
  },
  removeMessages(storageKey: string | undefined) {
    localStorage.removeItem(storageKey ?? LOCAL_STORAGE_KEY);
  },
};

function createLocalStorageKey() {
  const url = new URL(appConfig.url ?? 'http://localhost');
  const domain = url.hostname;

  return `${domain}-chatbot-messages`;
}
