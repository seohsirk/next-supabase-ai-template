import { Cms, CmsClient } from '@kit/cms';

import type { DocumentationPage, Post } from '../.contentlayer/generated';

async function getAllContentItems() {
  const { allDocumentationPages, allPosts } = await import(
    '../.contentlayer/generated'
  );

  return [...allPosts, ...allDocumentationPages];
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

        const matchesParentIds = options?.parentIds
          ? options.parentIds.includes(item.parentId ?? '')
          : true;

        return tagMatch && categoryMatch && matchesParentIds;
      })
      .map((post) => this.mapPost(post))
      .slice(startOffset, endOffset);

    return Promise.resolve(promise);
  }

  async getContentItemById(id: string) {
    const allContentItems = await getAllContentItems();
    const post = allContentItems.find((item) => item.slug === id);

    if (!post) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(post ? this.mapPost(post) : undefined);
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
      order: 'order' in post ? post.order : 0,
      image: 'image' in post ? post.image : undefined,
      publishedAt: 'date' in post ? new Date(post.date) : new Date(),
      parentId: 'parentId' in post ? (post.parentId as string) : undefined,
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
