const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const configs = require('./configs.json');

var configsOverlay = {};

try {
  configsOverlay = JSON.parse(fs.readFileSync(path.resolve(__dirname, './configs.overlay.json')));
} catch (err) { console.log('Could not find/load configs.overlay.json:', err.message) }

module.exports = function(env) {
  env = env || {};

  env.profile = env.profile || 'debug';

  const compiledConfigs = Object.assign({}, configs, configsOverlay);

  let modes = env.profile.split(',');
  var profile = {};
  ['default', ...modes].forEach((mode) => {
    if (compiledConfigs[mode]) {
      Object.assign(profile, compiledConfigs[mode])
    }
  });

  console.log('profile', profile);

  var config = { entry: {} };

  config.entry['cy-script'] = [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './src/js/init/cy-script-config.ts',
    ...profile.cyScriptConfigs,
    './src/js/init/cy-script-config-set.ts',
    './src/js/index.ts',
  ];
  // config.entry['cy-script-chanjs'] = [
  // ];

  var indexCss = 'cy-script.css';

  return Object.assign(config, {
    mode: profile.mode,
    output: {
      publicPath: profile.publicPath,
      path: path.resolve(__dirname, './build/' + env.profile),
      filename: '[name].js',
      sourceMapFilename: '[name].js.map',
      chunkFilename: '[id].[hash].js',
      crossOriginLoading: 'anonymous',
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          oneOf: [
            {
              use: [
                { loader: MiniCssExtractPlugin.loader },
                { loader: 'css-loader', options: { sourceMap: true } },
                { loader: 'resolve-url-loader', options: { sourceMap: true } },
                {
                  loader: 'sass-loader',
                  options: {
                    sassOptions: {
                      includePaths: ['.', './src', './node_modules'],
                    },
                    sourceMap: true,
                  },
                },
              ],
            },
          ],
        },
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          use: [{
            loader: 'url-loader',
            options: { 
              limit: 10, // b 
              emitFile: true,
              publicPath: profile.publicPath
            } 
          }]
        },
        // For new scripts
        {
          test: /\.jsx?$/,
          exclude: [
            path.resolve(__dirname, './node_modules/'),
            path.resolve(__dirname, './src/js/legacy/')
          ],
          use: [
            {
              loader: 'babel-loader',
              options: {
                sourceMaps: true,
                presets: [
                  ['@babel/preset-env', {
                    corejs: '3.0.0',
                    useBuiltIns: 'entry',
                  }],
                ],
                plugins: [
                  '@babel/plugin-proposal-class-properties',
                  path.resolve(__dirname, './babel/plugins/jsx-to-template-literal.js')
                ]
              }
            }
          ]
        },
        // For legacy
        {
          test: /\.jsx?$/,
          include: [
            path.resolve(__dirname, './src/js/legacy/')
          ],
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    corejs: '3.0.0',
                    useBuiltIns: 'entry',
                  }],
                ],
                plugins: [
                  '@babel/plugin-proposal-class-properties',
                  path.resolve(__dirname, './babel/plugins/jsx-to-template-literal.js')
                ]
              }
            }
          ]
        },
        {
          test: /\.tsx?$/,
          exclude: path.resolve(__dirname, './node_modules/'),
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    corejs: '3.0.0',
                    useBuiltIns: 'entry',
                  }],
                ],
                plugins: [
                  path.resolve(__dirname, './babel/plugins/jsx-to-template-literal.js'),
                ]
              }
            },
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, './tsconfig.json'),
                onlyCompileBundledFiles: true
              }
            },
          ]
        },
      ],
    },
    resolve: {
      modules: [path.resolve('./src'), path.resolve('node_modules')],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        jquery: path.resolve(__dirname, './src/js/backbone/jquery.js'),
        Backbone: path.resolve(__dirname, './src/js/backbone/backbone.js'),
        PlainComponent: path.resolve(__dirname, './src/js/components/PlainComponent.ts')
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: indexCss,
        chunkFilename: profile.mode === 'development' ? '[id].css' : '[id].[hash].css',
      }),
      new webpack.ProvidePlugin({
        Backbone: 'Backbone',
        '_': 'underscore/underscore',
        'moment': 'moment',
        'linkifyHtml': 'linkifyjs/html',
        PlainComponent: ['PlainComponent', 'default'],
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true, debug: false
      }),
    ],
    stats: {
     colors: true
    },
    devtool: env.profile === 'debug' ? 'inline-source-map' : false,
    devServer: {
      contentBase: path.resolve('build/' + env.profile),
      publicPath: profile.publicPath,
      watchContentBase: true,
      historyApiFallback: {
        index: 'index.html'
      },
      host: '0.0.0.0',
      sockHost: 'localhost',
      port: 8211,
      disableHostCheck: true,
      headers: {
        'Content-Security-Policy': [
          "default-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; "
          + "img-src * data: 'unsafe-inline'; connect-src * 'unsafe-inline'; frame-src *; font-src *;"
        ],
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    },
  });
};
