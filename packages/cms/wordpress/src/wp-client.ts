import type {
  WP_REST_API_Category,
  WP_REST_API_Post,
  WP_REST_API_Tag,
} from 'wp-types';

import { Cms, CmsClient } from '@kit/cms';

import GetTagsOptions = Cms.GetTagsOptions;

/**
 * @name WordpressClient
 * @description Represents a client for interacting with a Wordpress CMS.
 * Implements the CmsClient interface.
 */
export class WordpressClient implements CmsClient {
  private readonly apiUrl: string;

  constructor(apiUrl = process.env.WORDPRESS_API_URL as string) {
    this.apiUrl = apiUrl;
  }

  async getContentItems(options?: Cms.GetContentItemsOptions) {
    let endpoint: string;

    switch (options?.type) {
      case 'post':
        endpoint = '/wp-json/wp/v2/posts?_embed';
        break;

      case 'page':
        endpoint = '/wp-json/wp/v2/pages?_embed';
        break;

      default:
        endpoint = '/wp-json/wp/v2/posts?_embed';
    }

    const url = new URL(this.apiUrl + endpoint);

    if (options?.limit) {
      url.searchParams.append('per_page', options.limit.toString());
    }

    if (options?.offset) {
      url.searchParams.append('offset', options.offset.toString());
    }

    if (options?.categories) {
      url.searchParams.append('categories', options.categories.join(','));
    }

    if (options?.tags) {
      url.searchParams.append('tags', options.tags.join(','));
    }

    const response = await fetch(url.toString());
    const data = (await response.json()) as WP_REST_API_Post[];

    return Promise.all(
      data.map(async (item) => {
        // Fetch author, categories, and tags as before...

        let parentId: string | undefined;

        if (item.parent) {
          parentId = item.parent.toString();
        }

        let children: Cms.ContentItem[] = [];

        const embeddedChildren = (
          item._embedded ? item._embedded['wp:children'] : []
        ) as WP_REST_API_Post[];

        if (options?.depth && options.depth > 0) {
          children = await Promise.all(
            embeddedChildren.map(async (child) => {
              const childAuthor = await this.getAuthor(child.author);

              const childCategories = await this.getCategoriesByIds(
                child.categories ?? [],
              );

              const childTags = await this.getTagsByIds(child.tags ?? []);

              return {
                id: child.id.toString(),
                title: child.title.rendered,
                type: child.type as Cms.ContentType,
                image: this.getFeaturedMedia(child),
                description: child.excerpt.rendered,
                url: child.link,
                content: child.content.rendered,
                slug: child.slug,
                publishedAt: new Date(child.date),
                author: childAuthor?.name,
                categories: childCategories,
                tags: childTags,
                parentId: child.parent?.toString(),
              };
            }),
          );
        }

        const author = await this.getAuthor(item.author);
        const categories = await this.getCategoriesByIds(item.categories ?? []);
        const tags = await this.getTagsByIds(item.tags ?? []);
        const image = item.featured_media ? this.getFeaturedMedia(item) : '';

        return {
          id: item.id.toString(),
          title: item.title.rendered,
          content: item.content.rendered,
          description: item.excerpt.rendered,
          image,
          url: item.link,
          slug: item.slug,
          publishedAt: new Date(item.date),
          author: author?.name,
          categories: categories,
          tags: tags,
          type: item.type as Cms.ContentType,
          parentId,
          children,
        };
      }),
    );
  }

  async getContentItemById(slug: string) {
    const url = `${this.apiUrl}/wp-json/wp/v2/posts?slug=${slug}`;
    const response = await fetch(url);
    const data = (await response.json()) as WP_REST_API_Post[];
    const item = data[0];

    if (!item) {
      return;
    }

    const author = await this.getAuthor(item.author);
    const categories = await this.getCategoriesByIds(item.categories ?? []);
    const tags = await this.getTagsByIds(item.tags ?? []);
    const image = item.featured_media ? this.getFeaturedMedia(item) : '';

    return {
      id: item.id.toString(),
      image,
      url: item.link,
      description: item.excerpt.rendered,
      type: item.type as Cms.ContentType,
      children: [],
      title: item.title.rendered,
      content: item.content.rendered,
      slug: item.slug,
      publishedAt: new Date(item.date),
      author: author?.name,
      categories,
      tags,
    };
  }

  async getCategoryBySlug(slug: string) {
    const url = `${this.apiUrl}/wp-json/wp/v2/categories?slug=${slug}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
      return;
    }

    const item = data[0] as WP_REST_API_Category;

    return {
      id: item.id.toString(),
      name: item.name,
      slug: item.slug,
    };
  }

  async getTagBySlug(slug: string) {
    const url = `${this.apiUrl}/wp-json/wp/v2/tags?slug=${slug}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
      return;
    }

    const item = data[0] as WP_REST_API_Tag;

    return {
      id: item.id.toString(),
      name: item.name,
      slug: item.slug,
    };
  }

  async getCategories(options?: Cms.GetCategoriesOptions) {
    const queryParams = new URLSearchParams();

    if (options?.limit) {
      queryParams.append('per_page', options.limit.toString());
    }

    if (options?.offset) {
      queryParams.append('offset', options.offset.toString());
    }

    const response = await fetch(
      `${this.apiUrl}/wp-json/wp/v2/categories?${queryParams.toString()}`,
    );

    const data = (await response.json()) as WP_REST_API_Category[];

    return data.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      slug: item.slug,
    }));
  }

  async getTags(options: GetTagsOptions) {
    const queryParams = new URLSearchParams();

    if (options?.limit) {
      queryParams.append('per_page', options.limit.toString());
    }

    if (options?.offset) {
      queryParams.append('offset', options.offset.toString());
    }

    const response = await fetch(
      `${this.apiUrl}/wp-json/wp/v2/tags?${queryParams.toString()}`,
    );

    const data = (await response.json()) as WP_REST_API_Tag[];

    return data.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      slug: item.slug,
    }));
  }

  private async getTagsByIds(ids: number[]) {
    const promises = ids.map((id) =>
      fetch(`${this.apiUrl}/wp-json/wp/v2/tags/${id}`),
    );

    const responses = await Promise.all(promises);

    const data = (await Promise.all(
      responses.map((response) => response.json()),
    )) as WP_REST_API_Tag[];

    return data.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      slug: item.slug,
    }));
  }

  private async getCategoriesByIds(ids: number[]) {
    const promises = ids.map((id) =>
      fetch(`${this.apiUrl}/wp-json/wp/v2/categories/${id}`),
    );

    const responses = await Promise.all(promises);

    const data = (await Promise.all(
      responses.map((response) => response.json()),
    )) as WP_REST_API_Category[];

    return data.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      slug: item.slug,
    }));
  }

  private async getAuthor(id: number) {
    const response = await fetch(`${this.apiUrl}/wp-json/wp/v2/users/${id}`);

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();

    return { name: data.name };
  }

  private getFeaturedMedia(post: WP_REST_API_Post) {
    const embedded = post._embedded ?? {
      'wp:featuredmedia': [],
    };

    const media = embedded['wp:featuredmedia'] ?? [];
    const item = media?.length > 0 ? media[0] : null;

    return item
      ? (
          item as {
            source_url: string;
          }
        ).source_url
      : '';
  }
}
