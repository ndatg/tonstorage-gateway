const Joi = require('joi');

const resources = require('../resources');
const config = require('../config');

module.exports = [
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/{path*}`,
    handler: resources.gateway.gateway,
    options: {
      validate: {
        params: Joi.object({
          path: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/files/{path*}`,
    handler(request, h) {
      return resources.gateway.gateway(request, h, false);
    },
    options: {
      validate: {
        params: Joi.object({
          path: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/download/{path*}`,
    handler: resources.gateway.download,
    options: {
      auth: {
        mode: 'try',
        strategy: 'session',
      },
      validate: {
        params: Joi.object({
          path: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/remove/{path*}`,
    handler: resources.gateway.remove,
    options: {
      auth: {
        mode: 'try',
        strategy: 'session',
      },
      validate: {
        params: Joi.object({
          path: Joi.string().required(),
        }),
      },
    },
  },
];
