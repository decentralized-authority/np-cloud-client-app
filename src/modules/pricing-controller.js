import request from 'superagent';
import * as math from 'mathjs';

const { bignumber, BigNumber } = math;

export class PricingController {

  /**
   * @type {{USD: string}}
   */
  static currencies = {
    USD: 'USD'
  };

  /**
   * @param {string[]} currencies
   * @return {Object}
   */
  static async getPricingData(currencies) {
    try {
      let data = {};
      for(const currency of currencies) {
        const { body } = await request
          .get(`https://min-api.cryptocompare.com/data/price?fsym=POKT&tsyms=${currency}`)
          .timeout(10000);
        data = {
          ...data,
          ...body
        };
      }
      return data;
    } catch(err) {
      console.error(err);
      return {};
    }
  }

  /**
   * @type {Object}
   * @private
   */
  _pricingData = {};

  /**
   * @param {Object} data
   */
  constructor(data) {
    this._pricingData = data;
  }

  /**
   * @param {BigNumber} amount
   * @param {string} currency
   * @returns {string}
   */
  convert(amount, currency) {
    try {
      const pricingData = this._pricingData[currency];
      if(!pricingData)
        return '0';
      return math.multiply(amount, bignumber(pricingData)).toString();
    } catch(err) {
      // do nothing with error
      return '0'
    }
  }

}
