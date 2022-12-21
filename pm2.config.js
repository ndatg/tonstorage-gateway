module.exports = {
  apps: [{
    name: 'tonstorage-gateway',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
  }],
};
