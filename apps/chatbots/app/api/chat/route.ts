import { handleChatBotRequest } from '~/lib/langchain/route-handler';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers':
    'Content-Type, x-chatbot-id, x-conversation-id, User-Agent',
};

export const POST = handleChatBotRequest({
  responseHeaders: HEADERS,
});

export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: HEADERS,
  });
}
