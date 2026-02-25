/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vlowgen/shared'],
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds (optional, but recommended for faster builds)
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Ignore specific warnings from dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
    ];

    // Fallback for modules that are not available in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
        '@react-native-async-storage/async-storage': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
