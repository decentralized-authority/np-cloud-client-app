const fs = require('fs-extra');
const path = require('path');

/**
 * Reads the contents of package.json
 * @returns {Promise<Object>}
 */
module.exports.getPackageJson = () => {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  return fs.readJson(packageJsonPath);
};
