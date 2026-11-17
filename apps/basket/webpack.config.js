const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { container } = require('webpack');

const { ModuleFederationPlugin } = container;

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    publicPath: 'auto',
    clean: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'basket',
      filename: 'remoteEntry.js',
      exposes: {
        './BasketSummary': './src/BasketSummary.tsx'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false
        }
      }
    }),
    new HtmlWebpackPlugin({
      title: 'Basket application',
      meta: {
        viewport: 'width=device-width, initial-scale=1'
      }
    })
  ],
  devServer: {
    port: 3102,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
