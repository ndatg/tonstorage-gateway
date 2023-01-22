module.exports = {
  app: {
    gatewayPrefix: '/gateway',
    authPrefix: '/auth',
    maxFileSize: '10MB', // maximum file size for autoload
    whitelistMode: false, // content moderation mode on the gateway (use with autoloadMode: false)
    autoloadMode: true, // autoload files
  },
  display: {
    index: ['index.html', 'index.htm'], // auto dispaly files with the name
    singleFile: true, // auto display single file
  },
  security: {
    disableIP: false, // allow domain access only
  },
  whitelist: [
    // names of the github users who are allowed to moderate the content of the gateway
    'ndatg',
  ],
  server: {
    port: parseInt(process.env.SERVER_PORT, 10),
    host: process.env.SERVER_HOST,
    hostname: process.env.SERVER_HOSTNAME,
  },
  tonstorage: {
    bin: process.env.TONSTORAGE_BIN,
    host: process.env.TONSTORAGE_HOST,
    database: process.env.TONSTORAGE_DATABASE,
    timeout: parseInt(process.env.TONSTORAGE_TIMEOUT, 10),
  },
  session: {
    cookie: {
      name: process.env.SESSION_COOKIE_NAME,
      password: process.env.SESSION_COOKIE_PASSWORD,
      path: '/',
      isSecure: (process.env.SESSION_COOKIE_ISSECURE.toLowerCase() === 'true'),
    },
    redirectTo: '/',
  },
  auth: {
    provider: 'github',
    password: process.env.GITHUB_AUTH_PASSWORD,
    clientId: process.env.GITHUB_AUTH_CLIENTID,
    clientSecret: process.env.GITHUB_AUTH_CLIENTSECRET,
    isSecure: (process.env.GITHUB_AUTH_ISSECURE.toLowerCase() === 'true'),
  },
};
