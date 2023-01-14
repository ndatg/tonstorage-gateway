const Boom = require('@hapi/boom');
const mime = require('mime-types');
const crypto = require('crypto');
const { resolve, extname, basename } = require('path');
const fs = require('fs');

const fsPromises = fs.promises;
const utils = require('../utils/gateway');
const config = require('../config');

module.exports = {
  async gateway(request, h, display = true) {
    // vars
    const { tonstorage } = request.server.app;
    const { path } = request.params;
    const gatewayPath = decodeURI(path);
    const hash = utils.getHash(gatewayPath);
    const filename = utils.getFilename(gatewayPath);
    if (!hash) {
      throw Boom.boomify(new Error('Hash not found'), { statusCode: 400 });
    }

    // cache
    const etag = `"${crypto.createHash('sha256').update(path, 'utf-8').digest('hex')}"`;

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
      await tonstorage.addByHash(hash, { download: true, upload: false, partialFiles: [filename] });
      await tonstorage.priorityAll(hash, 0);
      return h.response({
        statusCode: 200,
        message: 'Torrent added, please refresh the page to download the file',
      });
    }
    if (!torrent.ok && !config.app.autoloadMode) {
      throw Boom.boomify(new Error('Torrent not found'), { statusCode: 400 });
    }
    if (torrent.ok && torrent.result.files.length === 0) {
      throw Boom.boomify(new Error('Torrent is not ready yet'), { statusCode: 400 });
    }

    // check file
    const file = utils.loadFile(torrent, filename, display ? config.display : { index: [], singleFile: false });
    if (!file) {
      // trailing slash
      if (!path.endsWith('/')) {
        return h.redirect(`${config.app.gatewayPrefix}/${path}/`).permanent(true);
      }

      const data = utils.getDirectory(torrent, filename);
      if (data) {
        return h.view('directory', { path, data, root: filename === false });
      }

      throw Boom.boomify(new Error('File not found'), { statusCode: 400 });
    }

    // check file size
    if (file.size > utils.parseSize(config.app.maxFileSize)) {
      throw Boom.boomify(new Error(`File is larger than ${config.app.maxFileSize}`), { statusCode: 400 });
    }

    // check ready
    if (file.size !== file.downloaded_size) {
      // download file
      if (config.app.autoloadMode) {
        const download = await tonstorage.priorityName(hash, file.name, 1);
        if (!download.ok) {
          throw Boom.boomify(new Error('File download error'), { statusCode: 400 });
        }
      }

      throw Boom.boomify(new Error('File is not ready yet'), { statusCode: 400 });
    }

    // response
    let filePath = resolve(torrent.result.torrent.root_dir, file.name);
    if (torrent.result.torrent.dir_name.length > 0) {
      filePath = resolve(torrent.result.torrent.root_dir, torrent.result.torrent.dir_name, file.name);
    }
    const fileStat = await fsPromises.stat(filePath);
    const response = h.response(fs.createReadStream(filePath)).bytes(fileStat.size);
    const contentType = await mime.contentType(extname(filePath));
    if (contentType) {
      response.header('content-type', contentType);
    }
    response.header('etag', etag);
    response.header('cache-control', 'public, max-age=29030400, immutable');
    response.header('content-disposition', `inline; filename*=UTF-8''${encodeURIComponent(basename(filePath))}`);
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
    const { path } = request.params;
    const gatewayPath = decodeURI(path);
    const hash = utils.getHash(gatewayPath);
    const filename = utils.getFilename(gatewayPath);
    if (!hash) {
      throw Boom.boomify(new Error('Hash not found'), { statusCode: 400 });
    }
    if (!filename) {
      throw Boom.boomify(new Error('Filename not found'), { statusCode: 400 });
    }

    // check torrent
    const torrent = await tonstorage.get(hash);
    if (!torrent.ok) {
      await tonstorage.addByHash(hash, { download: true, upload: false, partialFiles: [filename] });
      await tonstorage.priorityAll(hash, 0);
      return h.response({
        statusCode: 200,
        message: 'Torrent added, please refresh the page to download the file',
      });
    }
    if (torrent.ok && torrent.result.files.length === 0) {
      throw Boom.boomify(new Error('Torrent is not ready yet'), { statusCode: 400 });
    }

    // check file
    const file = utils.getFile(torrent, filename);
    if (!file) {
      throw Boom.boomify(new Error('File not found'), { statusCode: 400 });
    }

    // check ready
    if (file.size === file.downloaded_size) {
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
    const { path } = request.params;
    const gatewayPath = decodeURI(path);
    const hash = utils.getHash(gatewayPath);
    if (!hash) {
      throw Boom.boomify(new Error('Hash not found'), { statusCode: 400 });
    }

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
