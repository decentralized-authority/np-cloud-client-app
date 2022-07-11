export class Account {

  /**
   * @type {string}
   */
  address = '';

  /**
   * @type {string}
   */
  privateKeyEncrypted = '';

  /**
   * @type {string}
   */
  publicKey = '';

  /**
   * @param {Account} data
   */
  constructor(data) {
    Object.assign(this, data);
  }

}
