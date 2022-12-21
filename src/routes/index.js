const Home = require('./home');
const Auth = require('./auth');
const Gateway = require('./gateway');
const GatewayWL = require('./gatewayWL');

const config = require('../config');

module.exports = {
  home: Home,
  auth: Auth,
  gateway: config.app.whitelistMode ? GatewayWL : Gateway,
};
