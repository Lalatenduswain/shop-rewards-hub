/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@shop-rewards/ui', '@shop-rewards/shared', '@shop-rewards/db'],
  experimental: {
    optimizePackageImports: ['@shop-rewards/ui'],
  },
};

module.exports = nextConfig;
