const fs = require('fs');

const deleteFile = (filepath) => fs.unlink(filepath, err => {
    throw err;
})

exports.deleteFile = deleteFile;