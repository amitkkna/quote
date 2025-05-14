/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: '.next',
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
