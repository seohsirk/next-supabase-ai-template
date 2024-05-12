'use client';

import { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { EllipsisVerticalIcon } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Dialog, DialogTitle } from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { Spinner } from '@kit/ui/spinner';
import { Trans } from '@kit/ui/trans';

import { MarkdownRenderer } from '~/components/markdown-renderer';
import { DeleteDocumentModal } from '~/home/[account]/chatbots/[chatbot]/_components/delete-document-modal';

export function DocumentDialog() {
  const params = useSearchParams();
  const value = params.get('document');

  const [docId, setDocId] = useState(value);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    setDocId(value);
  }, [value]);

  if (!docId) {
    return null;
  }

  return (
    <Dialog
      open={!!value}
      onOpenChange={(open) => {
        if (!open) {
          setDocId(null);
          // remove the query param from the url when the dialog is closed
          router.replace(pathName);
        }
      }}
    >
      <DocumentContent
        documentId={docId}
        onBeforeDelete={() => setDocId(null)}
      />
    </Dialog>
  );
}

function DocumentContent(props: {
  documentId: string;
  onBeforeDelete?: () => void;
}) {
  const { data, isLoading, error } = useFetchDocument(props.documentId);

  if (error) {
    return (
      <Alert variant={'warning'}>
        <AlertTitle>
          <Trans i18nKey={'chatbot:documentNotFound'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={'chatbot:documentNotFoundDescription'} />
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <If condition={isLoading}>
        <div className={'flex items-center space-x-4'}>
          <Spinner />

          <span>
            <Trans i18nKey={'chatbot:loadingDocument'} />
          </span>
        </div>
      </If>

      <If condition={data}>
        {(doc) => (
          <div className={'flex w-full flex-col space-y-6 divide-y'}>
            <div className={'flex w-full items-center justify-between'}>
              <DialogTitle>{doc.title}</DialogTitle>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVerticalIcon className={'w-5'} />
                </DropdownMenuTrigger>

                <DropdownMenuContent collisionPadding={{ right: 20 }}>
                  <DeleteDocumentModal
                    onBeforeDelete={props.onBeforeDelete}
                    documentId={doc.id}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trans i18nKey={'chatbot:deleteDocument'} />
                    </DropdownMenuItem>
                  </DeleteDocumentModal>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div
              className={
                'absolute top-10 -m-6 h-full w-full overflow-y-auto p-6 pb-36'
              }
            >
              <MarkdownRenderer>{doc.content}</MarkdownRenderer>
            </div>
          </div>
        )}
      </If>
    </>
  );
}

function useFetchDocument(documentId: string) {
  const client = useSupabase();
  const queryKey = ['documents', documentId];

  const queryFn = async () => {
    const { data, error } = await client
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  return useQuery({
    queryKey,
    queryFn,
  });
}
