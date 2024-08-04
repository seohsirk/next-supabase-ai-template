import { Heading } from '@kit/ui/heading';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

import { CopyToClipboardButton } from './_components/copy-to-clipboard-button';

interface ChatbotPublishPageParams {
  params: {
    organization: string;
    chatbot: string;
  };
}

export const metadata = {
  title: 'Publish',
};

function ChatbotPublishPage({ params }: ChatbotPublishPageParams) {
  const widgetHostingUrl = process.env.NEXT_PUBLIC_WIDGET_HOSTING_URL;

  const script = `
    <script async data-chatbot='${params.chatbot}' src='${widgetHostingUrl}' />
  `.trim();

  return (
    <PageBody className={'space-y-4'}>
      <div className={'flex flex-col space-y-2'}>
        <p className={'text-sm'}>
          <Trans i18nKey={'chatbot:publishTabSubheading'} />
        </p>
      </div>

      <pre
        className={
          'rounded-lg border bg-muted p-4 text-sm text-muted-foreground'
        }
      >
        <code>{script}</code>
      </pre>

      <div>
        <CopyToClipboardButton text={script} />
      </div>
    </PageBody>
  );
}

export default withI18n(ChatbotPublishPage);
