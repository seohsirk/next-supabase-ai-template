import { Mdx } from './mdx/mdx-renderer';

export function ContentRenderer(props: { content: string }) {
  return <Mdx code={props.content} />;
}
