const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'products',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductCard': './components/ProductCard.tsx'
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

