import * as uuid from 'uuid';
import { Transaction as PocketTransaction } from '@pokt-network/pocket-js';

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const timeout = (ms = 0) => new Promise(resolve => {
  setTimeout(resolve, ms);
});

/**
 * @returns {string}
 */
export const generateId = () => {
  return uuid.v4().replace(/-/g, '');
};

export const truncateAddress = (address = '', amount = 6) => {
  return `${address.slice(0, amount)}...${address.slice(-1 * amount)}`;
};

/**
 * @param {PocketTransaction[]} transactions
 * @returns {PocketTransaction[]}
 */
export const sortTransactions = transactions => [...transactions]
  .sort((a, b) => {
    if(a.height === b.height) {
      return a.index === b.index ? 0 : a.index > b.index ? -1 : 1;
    } else {
      return a.height > b.height ? -1 : 1
    }
  });
