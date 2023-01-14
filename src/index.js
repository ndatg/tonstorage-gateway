require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Bell = require('@hapi/bell');
const Cookie = require('@hapi/cookie');
const Vision = require('@hapi/vision');
const Handlebars = require('handlebars');
const TonStorageCLI = require('tonstorage-cli');

const routes = require('./routes');
const config = require('./config');

const init = async () => {
  // server
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
    router: {
      stripTrailingSlash: false,
    },
    routes: {
      cors: true,
      response: {
        emptyStatusCode: 200,
      },
    },
  });

  // tonstorage
  const tonstorage = new TonStorageCLI(config.tonstorage);
  server.app.tonstorage = tonstorage;

  // plugins
  await server.register(Bell);
  await server.register(Cookie);
  await server.register(Vision);

  // strategies
  server.auth.strategy('github', 'bell', config.auth);
  server.auth.strategy('session', 'cookie', config.session);

  // views
  server.views({
    engines: { html: Handlebars },
    relativeTo: __dirname,
    path: 'views',
  });

  // routes
  server.ext('onRequest', (request, h) => {
    if (config.security.disableIP && request.info.hostname !== config.server.hostname) {
      return h.response().code(444).takeover();
    }

    return h.continue;
  });

  server.route(routes.home);
  server.route(routes.gateway);
  if (config.app.whitelistMode) {
    server.route(routes.auth);
  }

  // start
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
