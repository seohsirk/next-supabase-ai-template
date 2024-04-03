import { Cms, CmsClient } from '@kit/cms';

import type { DocumentationPage, Post } from '../.contentlayer/generated';

async function getAllContentItems() {
  const { allDocumentationPages, allPosts } = await import(
    '../.contentlayer/generated'
  );

  return [
    ...allPosts.map((item) => {
      return { ...item, type: 'post' };
    }),
    ...allDocumentationPages.map((item) => {
      return { ...item, type: 'page', categories: ['documentation'] };
    }),
  ];
}

/**
 * A class that represents a Content Layer CMS client.
 * This class implements the base CmsClient class.
 *
 * @class ContentlayerClient
 * @extends {CmsClient}
 */
export class ContentlayerClient implements CmsClient {
  async getContentItems(options?: Cms.GetContentItemsOptions) {
    const allContentItems = await getAllContentItems();
    const { startOffset, endOffset } = this.getOffset(options);

    const promise = allContentItems
      .filter((item) => {
        const tagMatch = options?.tags
          ? item.tags?.some((tag) => options.tags?.includes(tag))
          : true;

        const categoryMatch = options?.categories
          ? item.categories?.some((category) =>
              options.categories?.includes(category),
            )
          : true;

        const typeMatch = options?.type ? item.type === options.type : true;
        const path = item._raw.flattenedPath;
        const splitPath = path.split('/');

        const depthMatch =
          options?.depth !== undefined
            ? splitPath.length - 1 === options.depth
            : true;

        return tagMatch && categoryMatch && typeMatch && depthMatch;
      })
      .slice(startOffset, endOffset)
      .map((post) => {
        const children: Cms.ContentItem[] = [];

        for (const item of allContentItems) {
          if (item.url.startsWith(post.url + '/')) {
            children.push(this.mapPost(item));
          }
        }

        return this.mapPost(post, children);
      });

    return Promise.resolve(promise);
  }

  async getContentItemById(id: string) {
    const allContentItems = await getAllContentItems();
    const post = allContentItems.find((item) => item.slug === id);

    if (!post) {
      return Promise.resolve(undefined);
    }

    const children: Cms.ContentItem[] = [];

    for (const item of allContentItems) {
      if (item.url.startsWith(post.url + '/')) {
        children.push(this.mapPost(item));
      }
    }

    return Promise.resolve(post ? this.mapPost(post, children) : undefined);
  }

  async getCategoryBySlug(slug: string) {
    return Promise.resolve({
      id: slug,
      name: slug,
      slug,
    });
  }

  async getTagBySlug(slug: string) {
    return Promise.resolve({
      id: slug,
      name: slug,
      slug,
    });
  }

  async getCategories(options?: Cms.GetCategoriesOptions) {
    const { startOffset, endOffset } = this.getOffset(options);
    const allContentItems = await getAllContentItems();

    const categories = allContentItems
      .filter((item) => {
        if (options?.type) {
          return item.type === options.type;
        }

        return true;
      })
      .slice(startOffset, endOffset)
      .flatMap((post) => post.categories)
      .filter((category): category is string => !!category)
      .map((category) => ({
        id: category,
        name: category,
        slug: category,
      }));

    return Promise.resolve(categories);
  }

  async getTags(options?: Cms.GetTagsOptions) {
    const { startOffset, endOffset } = this.getOffset(options);
    const allContentItems = await getAllContentItems();

    const tags = allContentItems
      .filter((item) => {
        if (options?.type) {
          return item.type === options.type;
        }

        return true;
      })
      .slice(startOffset, endOffset)
      .flatMap((post) => post.tags)
      .filter((tag): tag is string => !!tag)
      .map((tag) => ({
        id: tag,
        name: tag,
        slug: tag,
      }));

    return Promise.resolve(tags);
  }

  private getOffset(options?: { offset?: number; limit?: number }) {
    const startOffset = options?.offset ?? 0;
    const endOffset = options?.limit ? startOffset + options.limit : undefined;

    return { startOffset, endOffset };
  }

  private mapPost(
    post: Post | DocumentationPage,
    children: Array<Post | DocumentationPage> = [],
  ): Cms.ContentItem {
    return {
      id: post.slug,
      title: post.title,
      description: post.description ?? '',
      content: post.body?.code,
      image: 'image' in post ? post.image : undefined,
      publishedAt: 'date' in post ? new Date(post.date) : new Date(),
      parentId: 'parentId' in post ? post.parentId : undefined,
      url: post.url,
      slug: post.slug,
      author: 'author' in post ? post.author : '',
      children: children.map((child) => this.mapPost(child)),
      categories:
        post.categories?.map((category) => ({
          id: category,
          name: category,
          slug: category,
        })) ?? [],
      tags:
        post.tags?.map((tag) => ({
          id: tag,
          name: tag,
          slug: tag,
        })) ?? [],
    };
  }
}
