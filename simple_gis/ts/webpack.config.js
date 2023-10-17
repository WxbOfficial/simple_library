const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  performance: {
    maxAssetSize: 1024 * 1024, //1 M = 1024 byte * 1024
    maxEntrypointSize: 1024 * 1024,
  },
  output: {
    filename: 'simpleGis.js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd'
  },
  // 用来设置引用模块
  resolve: {
    extensions: [".ts", ".js"],
  },
  
  // 配置webpack的loader
  module: {
    rules: [
      {
        test: /.ts$/,
        use: {
          loader: "ts-loader",
        },
        exclude: /node_modules/,
      },
    ],
  },
};