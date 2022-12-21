const Joi = require('joi');

const resources = require('../resources');
const config = require('../config');

module.exports = [
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/{hash}/{filename*}`,
    handler: resources.gatewayWL.gateway,
    options: {
      validate: {
        params: Joi.object({
          hash: Joi.string().regex(/[A-F0-9]/i).min(64).max(64)
            .uppercase()
            .required(),
          filename: Joi.any().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/download/{hash}/{filename*}`,
    handler: resources.gatewayWL.download,
    options: {
      auth: {
        mode: 'try',
        strategy: 'session',
      },
      validate: {
        params: Joi.object({
          hash: Joi.string().regex(/[A-F0-9]/i).min(64).max(64)
            .uppercase()
            .required(),
          filename: Joi.any().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${config.app.gatewayPrefix}/remove/{hash}`,
    handler: resources.gatewayWL.remove,
    options: {
      auth: {
        mode: 'try',
        strategy: 'session',
      },
      validate: {
        params: Joi.object({
          hash: Joi.string().regex(/[A-F0-9]/i).min(64).max(64)
            .uppercase()
            .required(),
        }),
      },
    },
  },
];
