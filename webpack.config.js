const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        index: './app/js/popup/index.js',
        homePage: './app/js/popup/home-page.js',
        modal: './app/js/popup/modal.js',
        navbar: './app/js/popup/navbar.js',
        settingsPage: './app/js/popup/settings-page.js',
        utils: './app/js/popup/utils.js',
        zoomScript: './app/js/zoom-script.js',
        background: './app/js/background.js',
        styles: './app/style.css'
    },
    output: {
        filename: 'js/[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
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
                type: 'assets',
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
        historyApiFallback: true
    },
    stats: {
        warnings: false,
        errorDetails: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './app/popup.html',
            filename: 'popup.html',
            chunks: ['index', 'homePage', 'modal', 'navbar', 'settingsPage', 'utils'],
        }),
        new MiniCssExtractPlugin({
            filename: '[contenthash].css',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'assets', to: 'assets' },
            ],
        }),,
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
                    
                    if(assetOriginalFileName === "zoomScript.js") {
                        manifestJson.content_scripts[0].js = [`js/${assetName}`];
                    }

                    if(assetOriginalFileName === "background.js") {
                        manifestJson.background.service_worker = `js/${assetName}`;
                    }                    
                });

                manifestJson.action.default_popup = "popup.html";
                return manifestJson;
            },
        })
    ],
};