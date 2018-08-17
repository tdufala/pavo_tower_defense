'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {

    entry: [
        path.resolve(__dirname, 'src/game.js'),
        path.resolve(__dirname, 'src/stylesheets/main.css')
    ],

    devServer: {
        port: 6245,
        host: '0.0.0.0',
        disableHostCheck: true,
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/',
        filename: 'project.bundle.js'
    },

    module: {
        rules: [
		  {
			test: /\.css$/,
			use: [
                'style-loader',
                'css-loader'
            ]
		  },
          {
            test: [ /\.vert$/, /\.frag$/ ],
            use: 'raw-loader'
          }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        })
    ]

};
