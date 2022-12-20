const resources = require('../resources');
const config = require('../config');

module.exports = [
  {
    method: 'GET',
    path: `${config.app.authPrefix}/signin`,
    handler: resources.auth.signin,
    options: {
      auth: 'github',
    },
  },

  {
    method: 'GET',
    path: `${config.app.authPrefix}/signout`,
    handler: resources.auth.signout,
    options: {
      auth: 'session',
    },
  },
];
