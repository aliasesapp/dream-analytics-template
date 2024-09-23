/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    config.externals.push({
      'duckdb': 'commonjs duckdb',
      '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
    });

    return config;
  },
};

module.exports = nextConfig;