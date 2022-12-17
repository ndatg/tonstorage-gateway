const Hapi = require('@hapi/hapi');
const TonStorageCLI = require('tonstorage-cli');
const routes = require('./routes');

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
    routes: {
      cors: true,
      response: {
        emptyStatusCode: 200,
      },
    },
  });

  const tonstorage = new TonStorageCLI({
    bin: '/root/storage-daemon-cli',
    host: '127.0.0.1:5555',
    database: '/var/ton-storage',
    timeout: 5000,
  });
  server.app.tonstorage = tonstorage;

  server.route(routes.home);
  server.route(routes.gateway);

  await server.start();
  console.log('Server running on %s', server.info.uri);
})();
