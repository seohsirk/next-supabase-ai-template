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
      const { ContentRenderer } = await import('@kit/contentlayer');

      return ContentRenderer({ content });
    }
  }
}
