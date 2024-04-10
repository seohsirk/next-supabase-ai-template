import { Entry, createReader } from '@keystatic/core/reader';

import { Cms, CmsClient } from '@kit/cms';

import config from './keystatic.config';

const reader = createReader('.', config);

type EntryProps = Entry<(typeof config)['collections']['posts']>;

export class KeystaticClient implements CmsClient {
  async getContentItems(options?: Cms.GetContentItemsOptions) {
    const docs = await reader.collections.posts.all();

    const startOffset = options?.offset ?? 0;
    const endOffset = startOffset + (options?.limit ?? 10);

    return Promise.all(
      docs
        .filter((item) => {
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
        })
        .slice(startOffset, endOffset)
        .map(async (item) => {
          const children = docs.filter(
            (item) => item.entry.parent === item.slug,
          );

          console.log(item);

          return this.mapPost(item, children);
        }),
    );
  }

  async getContentItemById(id: string) {
    const doc = await reader.collections.posts.read(id);

    if (!doc) {
      return Promise.resolve(undefined);
    }

    return this.mapPost({ entry: doc, slug: id }, []);
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
      author: item.entry.author,
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
