const Boom = require('@hapi/boom');
const mime = require('mime-types');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const fsPromises = fs.promises;
const utils = require('../utils/gateway');

module.exports = {
  async handler(request, h) {
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

    // add file by addByHash
    const torrent = await tonstorage.get(hash);
    if (!torrent.ok) {
      await tonstorage.addByHash(hash, { download: true, partialFiles: [filename] });
      await tonstorage.priorityAll(hash, 0);
      throw Boom.boomify(new Error('Torrent added to queue'), { statusCode: 400 });
    }

    // check file
    const file = utils.getFile(torrent, filename);
    if (!file) {
      throw Boom.boomify(new Error('File not found'), { statusCode: 400 });
    }

    // check file size
    if (utils.parseSize(file.size) > utils.parseSize('10MB')) {
      throw Boom.boomify(new Error('File is larger than 10 MB'), { statusCode: 400 });
    }

    // add file by priorityName
    if (!file.ready) {
      await tonstorage.priorityName(hash, filename, 1);
      throw Boom.boomify(new Error('Torrent added to queue'), { statusCode: 400 });
    }

    // check ready
    if (file.ready !== file.size) {
      throw Boom.boomify(new Error('File is not ready yet'), { statusCode: 400 });
    }

    // response
    const filePath = `${torrent.result.rootDir}/${torrent.result.dirName}${file.name}`;
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
};
