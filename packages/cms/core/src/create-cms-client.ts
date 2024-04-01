import { CmsClient } from './cms-client';
import { CmsType } from './cms.type';

/**
 * Creates a CMS client based on the specified type.
 *
 * @param {CmsType} type - The type of CMS client to create. Defaults to the value of the CMS_CLIENT environment variable.
 * @returns {Promise<CmsClient>} A Promise that resolves to the created CMS client.
 * @throws {Error} If the specified CMS type is unknown.
 */
export async function createCmsClient(
  type: CmsType = process.env.CMS_CLIENT as CmsType,
): Promise<CmsClient> {
  switch (type) {
    case 'contentlayer':
      return getContentLayerClient();

    case 'wordpress':
      return getWordpressClient();

    default:
      throw new Error(`Unknown CMS type: ${type}`);
  }
}

async function getContentLayerClient() {
  const { ContentlayerClient } = await import('@kit/contentlayer');

  return new ContentlayerClient();
}

async function getWordpressClient() {
  const { WordpressClient } = await import('@kit/wordpress');

  return new WordpressClient();
}
