const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app'
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: './src',
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'EMBA',
            template: 'base.html',
            filename: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin({
            filename: "[name].bundle.css",
            allChunks: true,
        }),
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
        //     jQuery: 'jquery',
        //     'window.jQuery': 'jquery',
        //     Popper: ['popper.js', 'default']
        // }),
        new CopyWebpackPlugin([
            { from: 'static', to: '.' },
        ])
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        sourceMapFilename: '[file].map'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader",
                    publicPath: "./"
                })
            },
            {
                test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
                use: [{
                    loader: 'url-loader?limit=8192'
                }]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: "babel-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        port: 8080,
        host: 'localhost',
        historyApiFallback: {
            index: 'index.html'
        },
        noInfo: false,
        stats: 'minimal',
        contentBase: "./src"
    }
};