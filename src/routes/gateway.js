const Joi = require('joi');
const resources = require('../resources');

module.exports = [
  {
    method: 'GET',
    path: '/itfs/{hash}/{filename*}',
    handler: resources.gateway.handler,
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
];
