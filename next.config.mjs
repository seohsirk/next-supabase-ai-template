/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    '@kit/ui',
    '@kit/auth',
    '@kit/accounts',
    '@kit/team-accounts',
    '@kit/shared',
    '@kit/supabase',
    '@kit/i18n',
    '@kit/mailers',
    '@kit/billing',
    '@kit/stripe',
  ],
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: true,
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
