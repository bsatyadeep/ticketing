// import dotenv from require('dotenv');
// module.exports = {
//   webpackDevMiddleware: config => {
//     config.watchOptions.poll = 300;
//     return config;
//   }
// };

// require('dotenv').config({path: '.env' + (process.env.REACT_APP_ENV || 'dev')})
// require('dotenv').config();
process.env.NEXT_PUBLIC_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'dev';
const {parsed: appEnv} = require('dotenv').config({path: `.env+${process.env.NEXT_PUBLIC_APP_ENV}`});
const webpack = require('webpack');
module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    config.plugins.push(
      // new webpack.EnvironmentPlugin(process.env)
      new webpack.EnvironmentPlugin(appEnv)
    );
    return config;
  }
};