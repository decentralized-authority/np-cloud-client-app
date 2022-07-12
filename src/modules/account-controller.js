import _ from 'lodash';
import { Account } from '../types/account';
import { CoinDenom, Hex, Pocket } from '@pokt-network/pocket-js';
import * as math from 'mathjs';
import { REQUEST_TIMEOUT, TRANSACTION_FEE_UPOKT } from '../constants';
import { generateId } from '../util';

const { bignumber } = math;

export class AccountController {

  /**
   * @returns {string}
   */
  static generatePassword() {
    return [generateId(), generateId()].join('');
  }

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

  /**
   * @param {string} address
   * @returns {Promise<string>}
   */
  async getBalance(address) {
    const res = await this._pocket.rpc().query.getBalance(address);
    if(_.isError(res))
      throw res;
    const { balance } = res;
    return math.divide(bignumber(balance.toString()), bignumber('1000000')).toString();
  }

  /**
   * @param {string} privateKey
   * @param {string} amount
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {string} memo
   * @returns {Promise<string>}
   */
  async send(privateKey, amount, fromAddress, toAddress, memo = '') {
    const transactionSender = await this._pocket.withPrivateKey(privateKey);
    if(_.isError(transactionSender))
      throw transactionSender;
    const rawTxResponse = await transactionSender
      .send(fromAddress, toAddress, math.multiply(bignumber(amount), bignumber('1000000')).toString())
      .submit('testnet', TRANSACTION_FEE_UPOKT, CoinDenom.Upokt, memo, REQUEST_TIMEOUT);
    if(_.isError(rawTxResponse))
      throw rawTxResponse;
    return rawTxResponse.hash;
  }

  /**
   * @param {string} privateKeyEncrypted
   * @param {string} password
   * @returns {Promise<string>}
   */
  async getRawPrivateKey(privateKeyEncrypted, password) {
    const res = await this._pocket.keybase.importPPKFromJSON(password, privateKeyEncrypted, password);
    if(_.isError(res))
      throw res;
    const unlockedAccount = await this._pocket.keybase.getUnlockedAccount(res.addressHex, password);
    if(_.isError(unlockedAccount))
      throw unlockedAccount;
    return unlockedAccount.privateKey.toString('hex');
  }

  validateAddress(address) {
    return Hex.validateAddress(address);
  }

}
