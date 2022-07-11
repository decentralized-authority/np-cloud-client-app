import { localStorageKeys } from '../constants';

class DataStore {

  constructor() {
    this._getData();
  }

  /**
   * @returns {Object}
   * @private
   */
  _getData() {
    const rawData = localStorage.getItem(localStorageKeys.NPC_DATASTORE);
    let data;
    if(!rawData) {
      data = {};
      localStorage.setItem(localStorageKeys.NPC_DATASTORE, JSON.stringify(data));
    } else {
      data = JSON.parse(rawData);
    }
    return data;
  }

  /**
   * @param {string} key
   * @returns {any}
   */
  getItem(key) {
    return this._getData()[key];
  }

  /**
   * @param {string} key
   * @param {any} val
   * @returns {any}
   */
  setItem(key, val) {
    const newData = {
      ...this._getData(),
      [key]: val
    };
    const serialized = JSON.stringify(newData);
    localStorage.setItem(localStorageKeys.NPC_DATASTORE, serialized);
    return val;
  }

}

export const dataStore = new DataStore();
