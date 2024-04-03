import { CmsType } from './cms.type';

export async function ContentRenderer({
  content,
  type = process.env.CMS_CLIENT as CmsType,
}: {
  content: string;
  type?: CmsType;
}) {
  switch (type) {
    case 'contentlayer': {
      const { MDXContentRenderer } = await import(
        '../../contentlayer/src/content-renderer'
      );

      return MDXContentRenderer({ content });
    }

    case 'wordpress': {
      const { WordpressContentRenderer } = await import(
        '../../wordpress/src/content-renderer'
      );

      return WordpressContentRenderer({ content });
    }
  }
}
