// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Cms {
  export type ContentType = 'post' | 'page';

  export interface ContentItem {
    id: string;
    title: string;
    type: ContentType;
    url: string;
    description: string | undefined;
    content: string;
    author: string;
    publishedAt: Date;
    image: string | undefined;
    slug: string;
    categories: Category[];
    tags: Tag[];
    parentId?: string;
    children?: ContentItem[];
  }

  export interface Category {
    id: string;
    name: string;
    slug: string;
  }

  export interface Tag {
    id: string;
    name: string;
    slug: string;
  }

  export interface GetContentItemsOptions {
    type?: ContentType;
    limit?: number;
    offset?: number;
    categories?: string[];
    tags?: string[];
    depth?: number;
  }

  export interface GetCategoriesOptions {
    type?: ContentType;
    limit?: number;
    offset?: number;
  }

  export interface GetTagsOptions {
    type?: ContentType;
    limit?: number;
    offset?: number;
  }
}

export abstract class CmsClient {
  abstract getContentItems(
    options?: Cms.GetContentItemsOptions,
  ): Promise<Cms.ContentItem[]>;

  abstract getContentItemById(
    id: string,
    type?: string,
  ): Promise<Cms.ContentItem | undefined>;

  abstract getCategories(
    options?: Cms.GetCategoriesOptions,
  ): Promise<Cms.Category[]>;

  abstract getCategoryBySlug(slug: string): Promise<Cms.Category | undefined>;

  abstract getTags(options?: Cms.GetTagsOptions): Promise<Cms.Tag[]>;

  abstract getTagBySlug(slug: string): Promise<Cms.Tag | undefined>;
}
