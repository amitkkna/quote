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
  output: 'export',
  trailingSlash: true,
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Handle react-pdf ES module issues
    if (isServer) {
      config.externals = [...config.externals, 'canvas', 'jsdom', '@react-pdf/renderer'];
    }

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

    // Exclude react-pdf from server-side bundling
    if (isServer) {
      config.externals.push({
        '@react-pdf/renderer': '@react-pdf/renderer',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
