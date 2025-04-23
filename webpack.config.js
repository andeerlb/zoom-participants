import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

export default {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'source-map',
  entry: {
    bundle: [
      './app/js/popup/index.js',
      './app/js/popup/home-page.js',
      './app/js/popup/modal.js',
      './app/js/popup/navbar.js',
      './app/js/popup/settings-page.js',
      './app/js/popup/utils.js',
      './app/js/popup/state.js',
    ],
    zoomScript: './app/js/zoom-script.js',
    background: './app/js/background.js',
  },
  output: {
    filename: 'js/[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    splitChunks: false,
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    open: {
      target: '/popup.html',
    },
    historyApiFallback: true,
  },
  stats: {
    warnings: false,
    errorDetails: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/popup.html',
      filename: 'popup.html',
      chunks: ['bundle'],
    }),
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
      ],
    }),
    new ESLintPlugin({
      context: path.resolve(__dirname, 'app/js'),
      extensions: ['js'],
      failOnError: true,
      emitWarning: true,
      lintDirtyModulesOnly: true,
    }),
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '/dist/',
      generate: (manifest, assets) => {
        const manifestPath = path.resolve(__dirname, 'manifest.json');
        const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        Object.keys(assets).forEach((file) => {
          const assetOriginalFileName = assets[file].name;
          const assetPath = assets[file].path;
          const assetName = assetPath.replace('/dist/js/', '');

          if (assetOriginalFileName === 'zoomScript.js') {
            manifestJson.content_scripts[0].js = [`js/${assetName}`];
          }

          if (assetOriginalFileName === 'background.js') {
            manifestJson.background.service_worker = `js/${assetName}`;
          }
        });

        manifestJson.action.default_popup = 'popup.html';
        return manifestJson;
      },
    }),
  ],
};