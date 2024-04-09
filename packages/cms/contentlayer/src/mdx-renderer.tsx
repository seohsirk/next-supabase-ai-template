import { getMDXComponent } from 'next-contentlayer/hooks';

export function Mdx({ code }: { code: string }) {
  const Component = getMDXComponent(code);

  return <Component />;
}
