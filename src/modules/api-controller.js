import request from 'superagent';
import { REQUEST_TIMEOUT } from '../constants';
import { ValidatorNode } from '../types/validator-node';
import { AccountController } from './account-controller';

export class ApiController {

  /**
   * @type {string}
   * @private
   */
  _apiEndpoint = '';

  /**
   * @param {string} apiEndpoint
   */
  constructor(apiEndpoint) {
    this._apiEndpoint = apiEndpoint;
  }

  /**
   * @param {()=>Promise<any>} requestFunc
   * @returns {Promise<any>}
   * @private
   */
  async _makeRequest(requestFunc) {
    let res;
    try {
      res = await requestFunc();
    } catch(err) {
      if(err.response && err.response.text) {
        throw new Error(`Failed with status code ${err.response.status} and message:\n\n${err.response.text}`)
      } else {
        throw err;
      }
    }
    if(res.status !== 200) {
      if(res.text) {
        throw new Error(`Failed with status code ${res.status} and message ${res.text}.`)
      } else {
        throw new Error(`Failed with status code ${res.status}.`);
      }
    }
    return res.body || {};
  }

  /**
   * @param {string} invitation
   * @param {string} address
   * @param {string} password
   * @returns {Promise<string>}
   */
  async register(invitation, address, password) {
    const { id } = await this._makeRequest(() => request
      .post(`${this._apiEndpoint}/api/v1/register`)
      .type('application/json')
      .timeout(60000 * 30)
      .send({
        invitation,
        address,
        password,
      }));
    return id;
  }

  /**
   * @param {string} userId
   * @param {string} masterPassword
   * @returns {Promise<{expiration: string, token: string}>}
   */
  async unlock(userId, masterPassword) {
    const { token, expiration } = await this._makeRequest(() => request
      .post(`${this._apiEndpoint}/api/v1/unlock`)
      .set({
        auth_id: userId,
        auth_key: masterPassword
      })
      .timeout(REQUEST_TIMEOUT));
    return {
      token,
      expiration,
    };
  }

  /**
   * @param {string} masterPassword
   * @param {string} userId
   * @param {string} token
   * @param {string} stakeAmount
   * @param {Account} account
   * @param {AccountController} accountController
   * @returns {Promise<{password: string, address: *}>}
   */
  async stakeValidator(userId, token, stakeAmount) {
    const password = AccountController.generatePassword();
    const { address, encryptedPrivateKey, balanceRequired } = await this._makeRequest(() => request
      .post(`${this._apiEndpoint}/api/v1/stake_validator`)
      .set({
        auth_id: userId,
        auth_key: token,
      })
      .type('application/json')
      .timeout(60000 * 30)
      .send({
        password,
        stakeAmount,
      }));
    return {
      address,
      privateKeyEncrypted: encryptedPrivateKey,
      password,
      balanceRequired,
    };
  }

  async unstakeValidator() {

  }

  /**
   * @param userId
   * @param token
   * @returns {Promise<ValidatorNode[]>}
   */
  async getNodes(userId, token) {
    const nodes = await this._makeRequest(() => request
      .get(`${this._apiEndpoint}/api/v1/nodes`)
      .set({
        auth_id: userId,
        auth_key: token
      })
      .timeout(REQUEST_TIMEOUT));
    return nodes
      .map(n => new ValidatorNode(n));
  }

  /**
   * @param {string} userId
   * @param {string} token
   * @param {string} address
   * @returns {Promise<ValidatorNode>}
   */
  async getNode(userId, token, address) {
    const node = await this._makeRequest(() => request
      .get(`${this._apiEndpoint}/api/v1/nodes/${address}`)
      .set({
        auth_id: userId,
        auth_key: token
      })
      .timeout(REQUEST_TIMEOUT));
    return new ValidatorNode(node);
  }

  /**
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<{[address: string]: string}>}
   */
  async getNodePrivateKeys(userId, token) {
    return await this._makeRequest(() => request
      .get(`${this._apiEndpoint}/api/v1/node_keys`)
      .set({
        auth_id: userId,
        auth_key: token
      })
      .timeout(REQUEST_TIMEOUT));
  }

}
