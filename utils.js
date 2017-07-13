var hashFiles = require('hash-files');

module.exports = {
    hashFiles: function (files) {
        return hashFiles.sync({files: files}).slice(0, 32);
    }
};