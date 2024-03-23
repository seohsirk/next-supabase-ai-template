/**
 * Resolves the translation file for a given language and namespace.
 *
 */
export async function i18nResolver(language: string, namespace: string) {
  try {
    const { default: data } = await import(
      `../../public/locales/${language}/${namespace}.json`
    );

    return data as Record<string, string>;
  } catch (e) {
    console.error('Could not load translation file', e);

    return {} as Record<string, string>;
  }
}
