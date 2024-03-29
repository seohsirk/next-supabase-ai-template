import type { MDXComponents } from 'mdx/types';
import { getMDXComponent } from 'next-contentlayer/hooks';

import Components from './mdx-components';
// @ts-expect-error: weird typescript error with css modules
import styles from './mdx-renderer.module.css';

export function Mdx({
  code,
}: React.PropsWithChildren<{
  code: string;
}>) {
  const Component = getMDXComponent(code);

  return (
    <div className={styles.MDX}>
      <Component components={Components as unknown as MDXComponents} />
    </div>
  );
}
