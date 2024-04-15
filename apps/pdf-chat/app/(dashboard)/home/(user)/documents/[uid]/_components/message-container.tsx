'use client';

import classNames from 'clsx';
import { Message } from 'ai';
import LoadingBubble from './loading-bubble';

function MessageContainer({
  message,
}: React.PropsWithChildren<{
  message: Message;
}>) {
  const isUser = message.role === 'user';
  const content = message.content.trim();

  return (
    <div
      className={classNames('w-full rounded-md p-4 border animate-in slide-in-from-bottom-1', {
        'bg-primary-50 dark:bg-primary-800 border-border': isUser,
        'border-transparent': !isUser,
      })}
    >
      <div className={'flex items-start space-x-4'}>
        <LoadingIndicator show={!content} />

        <MessageContentContainer show={!!content}>
          <div>
            <b>
              {isUser ? `You` : `Assistant`}:{' '}
            </b>
            {content}
          </div>
        </MessageContentContainer>
      </div>
    </div>
  );
}

export default MessageContainer;

function LoadingIndicator({
  show,
}: React.PropsWithChildren<{ show: boolean }>) {
  return show ? <LoadingBubble /> : null;
}

function MessageContentContainer({
  children,
  show,
}: React.PropsWithChildren<{
  show: boolean;
}>) {
  return show ? <div className={'text-sm text-current'}>{children}</div> : null;
}

