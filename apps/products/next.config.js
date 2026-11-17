const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

const nextConfig = {
  reactStrictMode: true,
  output: process.env.CLOUDFLARE_STATIC_EXPORT === 'true' ? 'export' : undefined,
  webpack(config) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'products',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductCatalog': './components/catalog/ProductCatalog.tsx'
        },
        extraOptions: {
          exposePages: false
        }
      })
    );

    return config;
  }
};

module.exports = nextConfig;
