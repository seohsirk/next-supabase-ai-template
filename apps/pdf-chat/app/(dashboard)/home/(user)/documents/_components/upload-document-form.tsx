'use client';

import { useCallback, useState } from 'react';



import { useMutation } from '@tanstack/react-query';
import { Cloud } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';



import { usePersonalAccountData } from '@kit/accounts/hooks/use-personal-account-data';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Stepper } from '@kit/ui/stepper';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { addDocument } from '../server-actions';


function UploadDocumentForm() {
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        'application/pdf': ['.pdf'],
      },
      maxFiles: 1,
      onDropAccepted: (files) => {
        setFiles(files);
      },
    });

  if (files.length) {
    return (
      <div
        className={
          's-full my-24 flex flex-1 flex-col items-center justify-between space-y-8'
        }
      >
        <AcceptedFilesConfirmation
          acceptedFiles={files}
          onClear={() => setFiles([])}
        />
      </div>
    );
  }

  return (
    <div
      className={
        's-full my-24 flex flex-1 flex-col items-center justify-between space-y-8'
      }
    >
      <div className={'flex flex-col items-center'}>
        <Heading level={3}>
          <Trans i18nKey={'documents:uploadDocument'} />
        </Heading>

        <Heading level={6} className={'!text-lg'}>
          <Trans i18nKey={'documents:uploadDocumentDescription'} />
        </Heading>
      </div>

      <div
        {...getRootProps({ className: 'dropzone' })}
        className={cn(
          'w-full max-w-2xl cursor-pointer rounded-lg border border-dashed p-16 transition-colors hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10',
          {
            'border-green-500 bg-green-50 dark:bg-green-500/10': isDragAccept,
            'border-red-500 bg-red-50 dark:bg-red-500/10': isDragReject,
          },
        )}
      >
        <input {...getInputProps()} />

        <div className={'flex flex-col items-center space-y-4'}>
          <div className={'flex flex-col items-center space-y-4'}>
            <Cloud className={'w-24'} />

            <Heading level={5}>Drag and drop your document here</Heading>
          </div>

          <div>
            <Heading level={5}>or</Heading>
          </div>

          <div>
            <Button>Upload Document from Computer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocumentForm;

function AcceptedFilesConfirmation(props: {
  acceptedFiles: File[];
  onClear: () => void;
}) {
  const file = props.acceptedFiles[0];
  const steps = ['documents:details', 'documents:title', 'documents:confirm'];
  const [currentStep, setCurrentStep] = useState(0);

  const useUploadDocumentToStorageMutation = useUploadDocumentToStorage();

  const onUpload = useCallback(
    async (title: string) => {
      if (!title) {
        return;
      }

      setCurrentStep(2);

      try {
        const path = await useUploadDocumentToStorageMutation.trigger(file);

        await addDocument({
          title,
          path,
        });

        toast.success(`Document uploaded successfully!`);
      } catch (e) {
        toast.error(`Sorry, we encountered an error. Please try again.`);
        setCurrentStep(1);
      }
    },
    [file, useUploadDocumentToStorageMutation],
  );

  return (
    <div className={'w-full max-w-3xl'}>
      <div className={'flex flex-col space-y-8 rounded-md border p-12'}>
        <Stepper variant={'numbers'} steps={steps} currentStep={currentStep} />

        <If condition={currentStep === 0}>
          <DocumentDetailsStep
            file={file}
            onNext={() => setCurrentStep(1)}
            onCancel={props.onClear}
          />
        </If>

        <If condition={currentStep === 1}>
          <DocumentTitleStep onNext={onUpload} onCancel={props.onClear} />
        </If>

        <If condition={currentStep === 2}>
          <div className={'py-16'}>
            <LoadingOverlay fullPage={false}>
              We&apos;re uploading your document. This may take a few minutes.
            </LoadingOverlay>
          </div>
        </If>
      </div>
    </div>
  );
}

function DocumentDetailsStep({
  file,
  onNext,
  onCancel,
}: {
  file: File;
  onNext: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className={'flex flex-col'}>
        <Heading level={4}>Confirm Document Details</Heading>

        <Heading level={6} className={'!text-base'}>
          This document can be uploaded! Please confirm the details below.
        </Heading>
      </div>

      <div className={'flex flex-col space-y-1'}>
        <p>
          <b>File</b>: {file.name}
        </p>
        <p>
          <b>Size</b>: {Math.round(file.size / 1024)} KB
        </p>
        <p>
          <b>Type</b>: PDF
        </p>
      </div>

      <div className={'flex justify-end space-x-4'}>
        <Button variant={'ghost'} onClick={onCancel}>
          Go Back
        </Button>

        <Button onClick={onNext}>Next</Button>
      </div>
    </>
  );
}

function DocumentTitleStep(props: {
  onNext: (title: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');

  return (
    <>
      <div className={'flex flex-col'}>
        <Heading level={4}>Document Title</Heading>

        <Heading level={6} className={'!text-base'}>
          Please enter a title for your document.
        </Heading>
      </div>

      <div>
        <Label>
          <span>Document Title</span>

          <Input
            required
            type={'text'}
            className={'w-full'}
            placeholder={'Document Title'}
            onInput={(e) =>
              setTitle((e.target as HTMLInputElement).value ?? '')
            }
          />
        </Label>
      </div>

      <div className={'flex justify-end space-x-4'}>
        <Button variant={'ghost'} onClick={props.onCancel}>
          Go Back
        </Button>

        <Button
          onClick={() => {
            props.onNext(title);
          }}
        >
          Next
        </Button>
      </div>
    </>
  );
}

function useUploadDocumentToStorage() {
  const supabase = useSupabase();
  const documentName = nanoid(24);
  const account = usePersonalAccountData();

  const accountId = account.data?.id;

  return useMutation({
    mutationKey: ['upload-document'],
    mutationFn: async (file: File) => {
      if (!account) {
        throw new Error('Account is not defined');
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `${accountId}/${documentName}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      return data.path;
    },
  });
}
