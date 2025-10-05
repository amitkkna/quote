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
  // Disable static export - use standard Next.js build
  // output: 'export',
  trailingSlash: true,
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Simplified webpack config for react-pdf
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    // Handle ES modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Only externalize canvas and jsdom on server
    if (isServer) {
      config.externals.push('canvas', 'jsdom');
    }

    return config;
  },
};

module.exports = nextConfig;
