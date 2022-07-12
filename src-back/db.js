const path = require('path');
const NEDB = require('nedb-promises');

class DB {

  /**
   * @type {NEDB}
   */
  privateKeys = null;

  /**
   * @type {NEDB}
   */
  passwords = null;

  /**
   * @param {string} dataDir
   */
  constructor(dataDir) {
    this.privateKeys = NEDB.create({filename: path.join(dataDir, 'private-keys.db'), timestampData: true});
    this.passwords = NEDB.create({filename: path.join(dataDir, 'passwords.db'), timestampData: true});
  }

}

module.exports.DB = DB;
