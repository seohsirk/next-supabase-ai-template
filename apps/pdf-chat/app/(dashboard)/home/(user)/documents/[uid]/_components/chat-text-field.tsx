export function ChatTextField({
  handleSubmit,
  handleInputChange,
  input,
  loading,
}: React.PropsWithChildren<{
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  input: string;
  loading: boolean;
}>) {
  return (
    <form onSubmit={handleSubmit} className={'p-4 border-t border-gray-100 dark:border-border'}>
      <input
        disabled={loading}
        onInput={handleInputChange}
        value={input}
        placeholder='Ask your PDF anything and it will answer you.'
        className={
          '!min-h-[80px] w-full border px-4 bg-gray-50 shadow-sm' +
          ' focus:ring-none outline-none transition-all' +
          ' ring-primary focus:ring-2 focus:ring-offset-0' +
          ' aria-disabled:opacity-50 dark:bg-background'
        }
      />
    </form>
  );
}
