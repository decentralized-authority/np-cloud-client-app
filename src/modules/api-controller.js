import request from 'superagent';
import { REQUEST_TIMEOUT } from '../constants';

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
      .timeout(REQUEST_TIMEOUT)
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

  async stakeValidator() {

  }

  async unstakeValidator() {

  }

  async getNodes() {

  }

  async getNode() {

  }

}
