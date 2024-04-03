import { Mdx } from './mdx-renderer';

export function MDXContentRenderer(props: { content: string }) {
  return <Mdx code={props.content} />;
}
