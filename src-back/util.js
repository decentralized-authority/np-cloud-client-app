const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * Reads the contents of package.json
 * @returns {Promise<Object>}
 */
module.exports.getPackageJson = () => {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  return fs.readJson(packageJsonPath);
};

module.exports.generateSalt = length => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

module.exports.pbkdf2 = (password, salt) => {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
    .toString('hex');
};
