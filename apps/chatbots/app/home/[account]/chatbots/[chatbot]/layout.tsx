import Link from 'next/link';

import { ArrowLeftIcon, EditIcon } from 'lucide-react';

import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '@kit/ui/bordered-navigation-menu';
import { Button } from '@kit/ui/button';
import { PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { EditChatDialog } from '~/home/[account]/chatbots/_components/edit-chat-dialog';
import { loadChatbot } from '~/home/[account]/chatbots/_lib/server/load-chatbot';

async function ChatbotLayout(
  props: React.PropsWithChildren<{
    params: {
      account: string;
      chatbot: string;
    };
  }>,
) {
  const chatbot = await loadChatbot(props.params.chatbot);

  const path = (path = '') => {
    const { account, chatbot } = props.params;

    return ['/home', account, 'chatbots', chatbot, path]
      .filter(Boolean)
      .join('/');
  };

  return (
    <div className={'flex h-full flex-col space-y-8'}>
      <div>
        <PageHeader title={chatbot.name} description={chatbot.description}>
          <div className={'flex space-x-2'}>
            <Button variant={'ghost'} asChild>
              <Link href={'../'}>
                <ArrowLeftIcon className={'mr-2 h-4'} />

                <span>
                  <Trans i18nKey={'chatbot:backToChatbotsButton'} />
                </span>
              </Link>
            </Button>

            <EditChatDialog chatbot={chatbot}>
              <Button variant={'outline'}>
                <EditIcon className={'mr-2 h-4'} />

                <span>
                  <Trans i18nKey={'chatbot:editChatbotTitle'} />
                </span>
              </Button>
            </EditChatDialog>
          </div>
        </PageHeader>

        <div className={'px-4'}>
          <BorderedNavigationMenu>
            <BorderedNavigationMenuItem
                {...{
                  path: path('documents'),
                  label: 'chatbot:documentsTab',
                }}
            />

            <BorderedNavigationMenuItem
                {...{
                  path: path('training'),
                  label: 'chatbot:trainingTab',
                }}
            />

            <BorderedNavigationMenuItem
                {...{
                  path: path('design'),
                  label: 'chatbot:designTab',
                }}
            />

            <BorderedNavigationMenuItem
                {...{
                  path: path('playground'),
                  label: 'chatbot:playgroundTab',
                }}
            />

            <BorderedNavigationMenuItem
                {...{
                  path: path('publish'),
                  label: 'chatbot:publishTab',
                }}
            />
          </BorderedNavigationMenu>
        </div>
      </div>

      {props.children}
    </div>
  );
}

export default ChatbotLayout;
