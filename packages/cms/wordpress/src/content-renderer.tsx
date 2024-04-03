export function WordpressContentRenderer(props: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: props.content }} />;
}
