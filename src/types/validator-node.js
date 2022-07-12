export class ValidatorNode {

  /**
   * @type {string}
   */
  address = '';

  /**
   * @type {string}
   */
  balance = '0';

  /**
   * @type {boolean}
   */
  jailed = false;

  /**
   * @type {string}
   */
  publicKey = '';

  /**
   * @type {string}
   */
  region = '';

  /**
   * @type {string}
   */
  reportBlock = '';

  /**
   * @type {boolean}
   */
  staked = true;

  /**
   * @type {string}
   */
  stakedAmount = '0';

  /**
   * @type {string}
   */
  stakedBlock = '';

  /**
   * @type {string}
   */
  timestamp = '';

  /**
   * @type {string}
   */
  unstakeDate = '';

  /**
   * @type {string}
   */
  url = '';

  /**
   * @param {ValidatorNode} data
   */
  constructor(data) {
    Object.assign(this, data);
  }

}
