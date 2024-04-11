import { collection, config, fields } from '@keystatic/core';
import { z } from 'zod';

const path = z.string().parse(process.env.NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH);

export default createKeyStaticConfig(path);

function createKeyStaticConfig(path: string) {
  return config({
    storage: {
      kind: 'local',
    },
    collections: {
      posts: collection({
        label: 'Posts',
        slugField: 'title',
        path: `${path}/posts/*`,
        format: { contentField: 'content' },
        schema: {
          title: fields.slug({ name: { label: 'Title' } }),
          image: fields.image({
            label: 'Image',
            directory: 'public/site/images',
            publicPath: '/site/images',
          }),
          categories: fields.array(fields.text({ label: 'Category' })),
          tags: fields.array(fields.text({ label: 'Tag' })),
          description: fields.text({ label: 'Description' }),
          publishedAt: fields.date({ label: 'Published At' }),
          parent: fields.relationship({
            label: 'Parent',
            collection: 'posts',
          }),
          language: fields.text({ label: 'Language' }),
          order: fields.number({ label: 'Order' }),
          content: fields.document({
            label: 'Content',
            formatting: true,
            dividers: true,
            links: true,
            images: {
              directory: 'public/site/images',
              publicPath: '/site/images',
              schema: {
                title: fields.text({
                  label: 'Caption',
                  description:
                    'The text to display under the image in a caption.',
                }),
              },
            },
          }),
        },
      }),
      documentation: collection({
        label: 'Documentation',
        slugField: 'title',
        path: `${path}/documentation/**`,
        format: { contentField: 'content' },
        schema: {
          title: fields.slug({ name: { label: 'Title' } }),
          content: fields.document({
            label: 'Content',
            formatting: true,
            dividers: true,
            links: true,
            images: {
              directory: 'public/site/images',
              publicPath: '/site/images',
              schema: {
                title: fields.text({
                  label: 'Caption',
                  description:
                    'The text to display under the image in a caption.',
                }),
              },
            },
          }),
          image: fields.image({
            label: 'Image',
            directory: 'public/site/images',
            publicPath: '/site/images',
          }),
          description: fields.text({ label: 'Description' }),
          publishedAt: fields.date({ label: 'Published At' }),
          order: fields.number({ label: 'Order' }),
          language: fields.text({ label: 'Language' }),
          parent: fields.relationship({
            label: 'Parent',
            collection: 'documentation',
          }),
          categories: fields.array(fields.text({ label: 'Category' })),
          tags: fields.array(fields.text({ label: 'Tag' })),
        },
      }),
    },
  });
}
