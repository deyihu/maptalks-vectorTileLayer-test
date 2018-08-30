const pkg=require('./package.json');
const name=pkg.name;

const entry={};
entry['main']=__dirname + '/index.js';

var PROD = process.argv.indexOf('-p') >= 0;
var webpack = require('webpack');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new CaseSensitivePathsPlugin({}),
        new webpack.DefinePlugin({
            'typeof __DEV__': JSON.stringify('boolean'),
            __DEV__: PROD ? false : true
        })
    ],
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: /node_modules/
            }
        ]
    },
    entry:entry,
    output: {
        libraryTarget: 'umd',
        path: __dirname + '/dist/',
        filename: PROD ? '[name].min.js' : '[name].js'
    },
    externals: {
        // maptalks:'maptalks'
    }
};