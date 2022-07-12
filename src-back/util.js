const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { KEY_LENGTH, ENCRYPTION_ALGORITHM } = require('./constants');

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

/**
 * @param {string} encryptionPassword
 * @param {string} salt
 * @param {string} clearText
 * @param {string} iv
 */
module.exports.encrypt = (encryptionPassword, salt, clearText, iv) => {
  const key = crypto.scryptSync(
    Buffer.from(encryptionPassword, 'utf8'),
    Buffer.from(salt, 'hex'),
    KEY_LENGTH,
  );
  const cipher = crypto
    .createCipheriv(
      ENCRYPTION_ALGORITHM,
      key,
      Buffer.from(iv, 'hex'),
    );
  const encrypted = cipher.update(clearText, 'utf8', 'hex');
  return encrypted + cipher.final('hex');
};

module.exports.decrypt = (decryptionPassword, salt, encryptedText, iv) => {
  const key = crypto.scryptSync(
    Buffer.from(decryptionPassword, 'utf8'),
    Buffer.from(salt, 'hex'),
    KEY_LENGTH,
  );
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(iv, 'hex'),
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  return decrypted + decipher.final('utf8');
};

/**
 * @param {number} size
 * @returns {string}
 */
module.exports.generateSalt = (size = 16) => {
  return crypto.randomBytes(size).toString('hex');
};
