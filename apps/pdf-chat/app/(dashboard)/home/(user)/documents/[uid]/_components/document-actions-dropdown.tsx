'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/core/ui/Dropdown';
import IconButton from '~/core/ui/IconButton';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { clearConversation, deleteConversation } from '~/app/dashboard/[organization]/documents/actions.server';
import { useSWRConfig } from 'swr';
import { useCallback } from 'react';

function DocumentActionsDropdown(props: {
  conversationId: string;
}) {
  const clearMessagesCache = useClearMessagesCache();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton className='mx-8'>
          <EllipsisVerticalIcon className={'h-6'} />
        </IconButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent collisionPadding={10}>
        <DropdownMenuItem asChild>
          <button onClick={async () => {
            await clearConversation(props.conversationId);
            await clearMessagesCache(props.conversationId);
          }}>
            Clear conversation
          </button>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <button onClick={() => deleteConversation(props.conversationId)}>
            Delete conversation
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DocumentActionsDropdown;

function useClearMessagesCache() {
  const { mutate } = useSWRConfig();

  return useCallback((conversationId: string) => {
    const conversationCacheKey = `conversation-${conversationId}`;

    return mutate(conversationCacheKey, [], {
      optimisticData: [],
    });
  }, [mutate]);
}