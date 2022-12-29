module.exports = {
  app: {
    gatewayPrefix: '/gateway',
    authPrefix: '/auth',
    maxFileSize: '10MB',
    whitelistMode: false,
    autoloadMode: true,
  },
  security: {
    disableIP: false,
  },
  whitelist: [
    'ndatg',
  ],
  server: {
    port: process.env.SERVER_PORT,
    host: process.env.SERVER_HOST,
    hostname: process.env.SERVER_HOSTNAME,
  },
  tonstorage: {
    bin: process.env.TONSTORAGE_BIN,
    host: process.env.TONSTORAGE_HOST,
    database: process.env.TONSTORAGE_DATABASE,
    timeout: process.env.TONSTORAGE_TIMEOUT,
  },
  session: {
    cookie: {
      name: process.env.SESSION_COOKIE_NAME,
      password: process.env.SESSION_COOKIE_PASSWORD,
      path: process.env.SESSION_COOKIE_PATH,
      isSecure: process.env.SESSION_COOKIE_ISSECURE,
    },
    redirectTo: '/',
  },
  auth: {
    provider: 'github',
    password: process.env.GITHUB_AUTH_PASSWORD,
    clientId: process.env.GITHUB_AUTH_CLIENTID,
    clientSecret: process.env.GITHUB_AUTH_CLIENTSECRET,
    isSecure: process.env.GITHUB_AUTH_ISSECURE,
  },
};
