import * as uuid from 'uuid';
import { Transaction as PocketTransaction } from '@pokt-network/pocket-js';
import swal from 'sweetalert';
import { ipcMainListeners } from '../constants';
import { dataStore } from '../modules/data-store';

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

export const onImportUserData = async () => {
  const confirmed = await swal({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'If you import a user data file, it will overwrite all current app data. Do you want to continue?',
    buttons: ['Cancel', 'OK'],
  });
  if(!confirmed)
    return;
  const data = await window.ipcRenderer.invoke(ipcMainListeners.IMPORT_USER_DATA);
  if(!data)
    return;
  for(const [key, val] of Object.entries(data)) {
    dataStore.setItem(key, val);
  }
  await swal({
    icon: 'success',
    title: 'Success',
    text: 'User data successfully imported. Click OK to restart the application.',
    button: 'OK',
    closeOnClickOutside: false,
    closeOnEsc: false,
  });
  window.ipcRenderer.send(ipcMainListeners.RESTART);
};
