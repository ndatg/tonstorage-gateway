const Hapi = require('@hapi/hapi');
const Cookie = require('@hapi/cookie');
const Bell = require('@hapi/bell');
const TonStorageCLI = require('tonstorage-cli');

const routes = require('./routes');
const config = require('./config');

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

(async () => {
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
    routes: {
      cors: true,
      response: {
        emptyStatusCode: 200,
      },
    },
  });

  const tonstorage = new TonStorageCLI(config.tonstorage);
  server.app.tonstorage = tonstorage;

  await server.register(Bell);
  await server.register(Cookie);
  server.auth.strategy('github', 'bell', config.auth);
  server.auth.strategy('session', 'cookie', config.session);

  server.route(routes.home);
  if (config.app.whitelistMode) {
    server.route(routes.auth);
    server.route(routes.gatewayWL);
  } else {
    server.route(routes.gateway);
  }

  await server.start();
  console.log('Server running on %s', server.info.uri);
})();
