module.exports = {
  getFile(torrent, filename) {
    for (let i = 0; torrent.result && i < torrent.result.files.length; i += 1) {
      const file = torrent.result.files[i];
      if (file.name === filename) {
        return file;
      }
    }

    return null;
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

    return null;
  },
};
