'use client';

import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import {
  clearConversation,
  deleteConversation,
} from '~/(dashboard)/home/(user)/documents/server-actions';

export function DocumentActionsDropdown(props: { conversationId: string }) {
  const clearMessagesCache = useClearMessagesCache();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'icon'} variant={'ghost'} className="mx-8">
          <EllipsisVertical className={'h-6'} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent collisionPadding={10}>
        <DropdownMenuItem asChild>
          <button
            onClick={async () => {
              await clearConversation(props.conversationId);
              await clearMessagesCache(props.conversationId);
            }}
          >
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

function useClearMessagesCache() {
  const queryClient = useQueryClient();

  return useCallback(
    (conversationId: string) => {
      const conversationCacheKey = `conversation-${conversationId}`;

      return queryClient.setQueryData([conversationCacheKey], []);
    },
    [queryClient],
  );
}
