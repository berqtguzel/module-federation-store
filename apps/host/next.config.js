const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

const productsRemoteUrl = process.env.PRODUCTS_REMOTE_URL || 'http://localhost:3101';
const basketRemoteUrl = process.env.BASKET_REMOTE_URL || 'http://localhost:3102';

const nextConfig = {
  reactStrictMode: true,
  output: process.env.CLOUDFLARE_STATIC_EXPORT === 'true' ? 'export' : undefined,
  env: {
    PRODUCTS_REMOTE_URL: productsRemoteUrl,
    BASKET_REMOTE_URL: basketRemoteUrl
  },
  webpack(config) {
    config.output.chunkLoadTimeout = 5000;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'host',
        filename: 'static/chunks/remoteEntry.js',
        extraOptions: {
          exposePages: false
        }
      })
    );

    return config;
  }
};

module.exports = nextConfig;
