import type { MDXComponents as MDXComponentsType } from 'mdx/types';
import { getMDXComponent } from 'next-contentlayer/hooks';

import { MDXComponents } from '@kit/ui/mdx-components';

// @ts-ignore: ignore weird error
import styles from './mdx-renderer.module.css';

export function Mdx({
  code,
}: React.PropsWithChildren<{
  code: string;
}>) {
  const Component = getMDXComponent(code);

  return (
    <div className={styles.MDX}>
      <Component components={MDXComponents as unknown as MDXComponentsType} />
    </div>
  );
}
