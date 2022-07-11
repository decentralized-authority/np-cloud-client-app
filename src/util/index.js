const { Configuration, HttpRpcProvider, Pocket } = require('@pokt-network/pocket-js');

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const timeout = (ms = 0) => new Promise(resolve => {
  setTimeout(resolve, ms);
});

/**
 * @param {string} pocketEndpoint
 * @returns Pocket
 */
export const getPocketInstance = pocketEndpoint => {
  const dispatcher = new URL(pocketEndpoint);
  const configuration = new Configuration(5, 1000, 0, 40000, undefined, undefined, undefined, undefined, undefined, undefined, false);
  return new Pocket([dispatcher], new HttpRpcProvider(dispatcher), configuration);
};
