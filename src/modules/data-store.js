import { ipcMainListeners, localStorageKeys } from '../constants';

class DataStore {

  constructor() {
    const data = this._getData();
    const fsDatastore = window.ipcRenderer.sendSync(ipcMainListeners.GET_DATASTORE);
    if(Object.keys(fsDatastore).length === 0) {
      window.ipcRenderer.sendSync(ipcMainListeners.SAVE_DATASTORE, data);
    }
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

  getData() {
    return this._getData();
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
    window.ipcRenderer.sendSync(ipcMainListeners.SAVE_DATASTORE, newData);
    return val;
  }

}

export const dataStore = new DataStore();
