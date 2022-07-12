import * as uuid from 'uuid';

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
