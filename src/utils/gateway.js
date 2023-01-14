const { join } = require('path');

module.exports = {
  getHash(path) {
    const PATH_REGEXP = /^(?<hash>[A-F0-9]{64})\/?(?<filename>.*)$/i;
    const match = PATH_REGEXP.exec(path);
    return match && match.groups.hash ? match.groups.hash : false;
  },

  getFilename(path) {
    const PATH_REGEXP = /^(?<hash>[A-F0-9]{64})\/?(?<filename>.*)$/i;
    const match = PATH_REGEXP.exec(path);
    return match && match.groups.filename ? match.groups.filename : false;
  },

  getDirectory(torrent, filename) {
    let { files } = torrent.result;

    // filter files by the filename
    if (filename) {
      const splittedFilename = filename.split('/').filter((element) => element.length > 0);
      files = files.filter((element) => {
        const splittedElementName = element.name.split('/');
        for (let i = 0; i < splittedFilename.length; i += 1) {
          if (splittedFilename[i] !== splittedElementName[i]) {
            return false;
          }
        }

        return true;
      });
    }

    // get only the last part of the name
    files = files.map((element) => ({ name: element.name.slice(filename ? filename.length : 0), size: element.size }));
    files = files.filter((element) => element.name.length > 0);

    const res = [];
    for (let i = 0; i < files.length; i += 1) {
      const splittedElementName = files[i].name.split('/').filter((element) => element.length > 0);

      // trailing slash for dirs
      let name = splittedElementName[0];
      if (splittedElementName.length > 1) {
        name += '/';
      }

      let elementExist = false;
      for (let j = 0; j < res.length; j += 1) {
        if (res[j].name === name) {
          res[j].size += parseInt(files[i].size, 10);
          elementExist = true;
        }
      }

      if (!elementExist) {
        res.push({ name, size: parseInt(files[i].size, 10) });
      }
    }

    return res.length > 0 ? res : false;
  },

  getFile(torrent, filename) {
    if (filename) {
      for (let i = 0; i < torrent.result.files.length; i += 1) {
        const file = torrent.result.files[i];
        if (file.name === filename) {
          return file;
        }
      }
    }

    return false;
  },

  loadFile(torrent, filename, options) {
    const file = this.getFile(torrent, filename);

    // return single file
    if (options.singleFile && !filename && torrent.result.files.length === 1) {
      const newFile = this.getFile(torrent, torrent.result.files[0].name);
      if (newFile) {
        return newFile;
      }
    }

    // return index file
    for (let i = 0; i < options.index.length; i += 1) {
      const newFilename = join(filename || '', options.index[i]);
      const newFile = this.getFile(torrent, newFilename);
      if (newFile) {
        return newFile;
      }
    }

    return file;
  },

  parseSize(size) {
    const forms = {
      B: 1,
      KB: 1000,
      MB: 1.0e+6,
      GB: 1.0e+9,
      TB: 1.0e+12,
      PB: 1.0e+15,
      EB: 1.0e+18,
    };

    const SIZE_REGEXP = /(?<value>[0-9]+)(?<form>\w+)/i;
    const sizeMatch = SIZE_REGEXP.exec(size);
    if (sizeMatch.groups) {
      return sizeMatch.groups.value * forms[sizeMatch.groups.form];
    }

    return false;
  },
};
