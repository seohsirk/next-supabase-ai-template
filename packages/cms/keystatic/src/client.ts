import { Entry, createReader } from '@keystatic/core/reader';

import { Cms, CmsClient } from '@kit/cms';

import config from './keystatic.config';

const reader = createReader('.', config);

type EntryProps = Entry<(typeof config)['collections']['posts']>;

export class KeystaticClient implements CmsClient {
  async getContentItems(options: Cms.GetContentItemsOptions) {
    const collection =
      options.collection as keyof (typeof config)['collections'];

    if (!reader.collections[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const docs = await reader.collections[collection].all();

    const startOffset = options?.offset ?? 0;
    const endOffset = startOffset + (options?.limit ?? 10);

    const filtered = docs.filter((item) => {
      const categoryMatch = options?.categories
        ? options.categories.find((category) =>
            item.entry.categories.includes(category),
          )
        : true;

      if (!categoryMatch) {
        return false;
      }

      const tagMatch = options?.tags
        ? options.tags.find((tag) => item.entry.tags.includes(tag))
        : true;

      if (!tagMatch) {
        return false;
      }

      return true;
    });

    const items = await Promise.all(
      filtered.slice(startOffset, endOffset).map(async (item) => {
        const children = docs.filter((item) => item.entry.parent === item.slug);

        return this.mapPost(item, children);
      }),
    );

    return {
      total: filtered.length,
      items,
    };
  }

  async getContentItemBySlug(params: { slug: string; collection: string }) {
    const collection =
      params.collection as keyof (typeof config)['collections'];

    if (!reader.collections[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const doc = await reader.collections[collection].read(params.slug);

    if (!doc) {
      return Promise.resolve(undefined);
    }

    const allPosts = await reader.collections[collection].all();

    const children = allPosts.filter(
      (item) => item.entry.parent === params.slug,
    );

    return this.mapPost({ entry: doc, slug: params.slug }, children);
  }

  async getCategories() {
    return Promise.resolve([]);
  }

  async getTags() {
    return Promise.resolve([]);
  }

  async getTagBySlug() {
    return Promise.resolve(undefined);
  }

  async getCategoryBySlug() {
    return Promise.resolve(undefined);
  }

  private async mapPost<
    Type extends {
      entry: EntryProps;
      slug: string;
    },
  >(item: Type, children: Type[] = []): Promise<Cms.ContentItem> {
    const publishedAt = item.entry.publishedAt
      ? new Date(item.entry.publishedAt)
      : new Date();

    const content = await item.entry.content();

    return {
      id: item.slug,
      title: item.entry.title,
      url: item.slug,
      slug: item.slug,
      description: item.entry.description,
      publishedAt,
      content,
      image: item.entry.image ?? undefined,
      categories:
        item.entry.categories.map((item) => {
          return {
            id: item,
            name: item,
            slug: item,
          };
        }) ?? [],
      tags: item.entry.tags.map((item) => {
        return {
          id: item,
          name: item,
          slug: item,
        };
      }),
      parentId: item.entry.parent ?? undefined,
      order: item.entry.order ?? 1,
      children: await Promise.all(
        children.map(async (child) => this.mapPost(child, [])),
      ),
    };
  }
}
