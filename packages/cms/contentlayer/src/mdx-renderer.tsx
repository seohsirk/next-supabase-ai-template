import type { MDXComponents as MDXComponentsType } from 'mdx/types';
import { getMDXComponent } from 'next-contentlayer/hooks';

import { MDXComponents } from '@kit/ui/mdx-components';

export function Mdx({
  code,
}: React.PropsWithChildren<{
  code: string;
}>) {
  const Component = getMDXComponent(code);

  return (
    <Component components={MDXComponents as unknown as MDXComponentsType} />
  );
}
