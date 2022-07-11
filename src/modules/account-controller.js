import _ from 'lodash';
import { Account } from '../types/account';
import { Pocket } from '@pokt-network/pocket-js';

export class AccountController {

  /**
   * @type {Pocket}
   * @private
   */
  _pocket = null;

  /**
   * @param {Pocket} pocket
   */
  constructor(pocket) {
    this._pocket = pocket;
  }

  /**
   * @param {string} password
   * @returns {Promise<Account>}
   */
  async createAccount(password) {
    const res = await this._pocket.keybase.createAccount(password);
    if(_.isError(res))
      throw(res);
    const ppk = await this._pocket.keybase.exportPPKfromAccount(res.addressHex, password, '', password);
    const unlockedAccount = await this._pocket.keybase.getUnlockedAccount(res.addressHex, password);
    if(_.isError(unlockedAccount))
      throw unlockedAccount;
    return new Account({
      address: res.addressHex,
      publicKey: res.publicKey.toString('hex'),
      privateKeyEncrypted: ppk,
    });
  }

  /**
   * @param {string} rawPrivateKey
   * @param {string} password
   * @returns {Promise<Account>}
   */
  async importAccount(rawPrivateKey, password) {
    const res = await this._pocket.keybase.importAccount(Buffer.from(rawPrivateKey, 'hex'), password);
    if(_.isError(res))
      throw(res);
    const ppk = await this._pocket.keybase.exportPPKfromAccount(res.addressHex, password, '', password);
    if(_.isError(ppk))
      throw(ppk);
    return new Account({
      address: res.addressHex,
      publicKey: res.publicKey.toString('hex'),
      privateKeyEncrypted: ppk,
    });
  }

}
