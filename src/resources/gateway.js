const Boom = require('@hapi/boom');
const mime = require('mime-types');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const fsPromises = fs.promises;
const utils = require('../utils/gateway');
const config = require('../config');

module.exports = {
  async gateway(request, h) {
    // vars
    const { tonstorage } = request.server.app;
    const { hash, filename } = request.params;
    const etag = `"${crypto.createHash('sha256').update(`${hash}/${filename}`, 'utf-8').digest('hex')}"`;

    // if-none-match && etag
    const cachedEtag = request.headers['if-none-match'];
    if (cachedEtag === etag || cachedEtag === `W/${etag}`) {
      return h.response().code(304);
    }

    // if-modified-since
    if (request.headers['if-modified-since']) {
      return h.response().code(304);
    }

    // check torrent
    const torrent = await tonstorage.get(hash);
    if (!torrent.ok && config.app.autoloadMode) {
      await tonstorage.addByHash(hash, { download: true, partialFiles: [filename] });
      await tonstorage.priorityAll(hash, 0);
    }
    if (!torrent.ok && !config.app.autoloadMode) {
      throw Boom.boomify(new Error('Torrent not found'), { statusCode: 400 });
    }

    // check file
    const file = utils.getFile(torrent, filename);
    if (!file) {
      throw Boom.boomify(new Error('File not found'), { statusCode: 400 });
    }

    // check file size
    if (utils.parseSize(file.size) > utils.parseSize(config.app.maxFileSize)) {
      throw Boom.boomify(new Error(`File is larger than ${config.app.maxFileSize}`), { statusCode: 400 });
    }

    // download file
    if (config.app.autoloadMode) {
      const download = await tonstorage.priorityName(hash, filename, 1);
      if (!download.ok) {
        throw Boom.boomify(new Error('File download error'), { statusCode: 400 });
      }
    }

    // check ready
    if (file.ready !== file.size) {
      throw Boom.boomify(new Error('File is not ready yet'), { statusCode: 400 });
    }

    // response
    let filePath = path.resolve(torrent.result.rootDir, file.name);
    if (torrent.result.dirName) {
      filePath = path.resolve(torrent.result.rootDir, torrent.result.dirName, file.name);
    }
    const fileStat = await fsPromises.stat(filePath);
    const response = h.response(fs.createReadStream(filePath)).bytes(fileStat.size);
    const contentType = await mime.contentType(path.extname(filePath));
    if (contentType) {
      response.header('content-type', contentType);
    }
    response.header('etag', etag);
    response.header('cache-control', 'public, max-age=29030400, immutable');
    response.header('content-disposition', `inline; filename*=UTF-8''${encodeURIComponent(filename)}`);
    return response;
  },

  async download(request, h) {
    // check auth
    const username = request.auth.credentials ? request.auth.credentials.username : null;
    if (!request.auth.isAuthenticated || !config.whitelist.includes(username)) {
      throw Boom.boomify(new Error('Not authenticated'), { statusCode: 400 });
    }

    // vars
    const { tonstorage } = request.server.app;
    const { hash, filename } = request.params;

    // check torrent
    const torrent = await tonstorage.get(hash);
    if (!torrent.ok) {
      await tonstorage.addByHash(hash, { download: true, partialFiles: [filename] });
      await tonstorage.priorityAll(hash, 0);
    }

    // check file
    const file = utils.getFile(torrent, filename);
    if (!file) {
      throw Boom.boomify(new Error('File not found'), { statusCode: 400 });
    }

    // check ready
    if (file.ready === file.size) {
      throw Boom.boomify(new Error('File downloaded earlier'), { statusCode: 400 });
    }

    // download file
    const download = await tonstorage.priorityName(hash, filename, 1);
    if (!download.ok) {
      throw Boom.boomify(new Error('File download error'), { statusCode: 400 });
    }

    // response
    return h.response({
      statusCode: 200,
      message: 'File added for download',
    });
  },

  async remove(request, h) {
    // check auth
    const username = request.auth.credentials ? request.auth.credentials.username : null;
    if (!request.auth.isAuthenticated || !config.whitelist.includes(username)) {
      throw Boom.boomify(new Error('Not authenticated'), { statusCode: 400 });
    }

    // vars
    const { tonstorage } = request.server.app;
    const { hash } = request.params;

    // check torrent
    const torrent = await tonstorage.get(hash);
    if (!torrent.ok) {
      throw Boom.boomify(new Error('Torrent not found'), { statusCode: 400 });
    }

    // remove torrent
    const remove = await tonstorage.remove(hash, { removeFiles: true });
    if (!remove.ok) {
      throw Boom.boomify(new Error('File remove error'), { statusCode: 400 });
    }

    // response
    return h.response({
      statusCode: 200,
      message: 'Files removed',
    });
  },
};
