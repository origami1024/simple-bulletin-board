// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const pug = {
    test: /\.pug$/,
    use: ['html-loader?attrs=false', 'pug-html-loader']
  };

const config = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        publicPath: '/dist'
    },
    module: {
        rules: [pug]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
              from: path.resolve(__dirname, 'src/scripts/'),
              to: path.resolve(__dirname, 'dist/scripts/'),
              ignore: ['.*']
            }
        ]),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'reg.html',
            template: 'src/reg.pug',
            inject: false
        })
        
    ]
};
module.exports = config;