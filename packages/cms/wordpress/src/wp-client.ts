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

  /**
   * Retrieves content items from a CMS based on the provided options.
   *
   * @param {Cms.GetContentItemsOptions} options - The options to customize the retrieval of content items.
   */
  async getContentItems(options?: Cms.GetContentItemsOptions) {
    const queryParams = new URLSearchParams({
      _embed: 'true',
    });

    if (options?.limit) {
      queryParams.append('per_page', options.limit.toString());
    }

    if (options?.offset) {
      queryParams.append('offset', options.offset.toString());
    }

    if (options?.categories) {
      const ids = await this.getCategories({
        slugs: options.categories,
      }).then((categories) => categories.map((category) => category.id));

      if (ids.length) {
        queryParams.append('categories', ids.join(','));
      } else {
        console.warn(
          'No categories found for the provided slugs',
          options.categories,
        );
      }
    }

    if (options?.tags) {
      const ids = await this.getCategories({
        slugs: options.tags,
      }).then((tags) => tags.map((tag) => tag.id));

      if (ids.length) {
        queryParams.append('tags', ids.join(','));
      } else {
        console.warn('No tags found for the provided slugs', options.tags);
      }
    }

    if (options?.parentIds && options.parentIds.length > 0) {
      queryParams.append('parent', options.parentIds.join(','));
    }

    const endpoints = [
      `/wp-json/wp/v2/pages?${queryParams.toString()}`,
      `/wp-json/wp/v2/posts?${queryParams.toString()}`,
    ];

    const urls = endpoints.map((endpoint) => `${this.apiUrl}${endpoint}`);

    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url).then((value) => value.json() as Promise<WP_REST_API_Post[]>),
      ),
    ).then((values) => values.flat().filter(Boolean));

    return await Promise.all(
      responses.map(async (item: WP_REST_API_Post) => {
        let parentId: string | undefined;

        if (!item) {
          throw new Error('Failed to fetch content items');
        }

        if (item.parent) {
          parentId = item.parent.toString();
        }

        const author = await this.getAuthor(item.author);
        const categories = await this.getCategoriesByIds(item.categories ?? []);
        const tags = await this.getTagsByIds(item.tags ?? []);
        const image = item.featured_media ? this.getFeaturedMedia(item) : '';
        const order = item.menu_order ?? 0;

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
          parentId,
          order,
          children: [],
        };
      }),
    );
  }

  async getContentItemById(slug: string) {
    const searchParams = new URLSearchParams({
      _embed: 'true',
      slug,
    });

    const endpoints = [
      `/wp-json/wp/v2/pages?${searchParams.toString()}`,
      `/wp-json/wp/v2/posts?${searchParams.toString()}`,
    ];

    const promises = endpoints.map((endpoint) =>
      fetch(this.apiUrl + endpoint).then(
        (res) => res.json() as Promise<WP_REST_API_Post[]>,
      ),
    );

    const responses = await Promise.all(promises).then((values) =>
      values.filter(Boolean),
    );

    const item = responses[0] ? responses[0][0] : undefined;

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
      order: item.menu_order ?? 0,
      url: item.link,
      description: item.excerpt.rendered,
      children: [],
      title: item.title.rendered,
      content: item.content.rendered,
      slug: item.slug,
      publishedAt: new Date(item.date),
      author: author?.name,
      categories,
      tags,
      parentId: item.parent?.toString(),
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

    if (options?.slugs) {
      const slugs = options.slugs.join(',');

      queryParams.append('slug', slugs);
    }

    const response = await fetch(
      `${this.apiUrl}/wp-json/wp/v2/categories?${queryParams.toString()}`,
    );

    if (!response.ok) {
      console.error('Failed to fetch categories', await response.json());

      throw new Error('Failed to fetch categories');
    }

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

    if (options?.slugs) {
      const slugs = options.slugs.join(',');
      queryParams.append('slug', slugs);
    }

    const response = await fetch(
      `${this.apiUrl}/wp-json/wp/v2/tags?${queryParams.toString()}`,
    );

    if (!response.ok) {
      console.error('Failed to fetch tags', await response.json());

      throw new Error('Failed to fetch tags');
    }

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
