module.exports.dataStoreKeys = {
  ACCOUNT: 'ACCOUNT',
  API_ENDPOINT: 'API_ENDPOINT',
  POCKET_ENDPOINT: 'POCKET_ENDPOINT',
  PASSWORD_SALT: 'PASSWORD_SALT',
  PASSWORD_HASHED: 'PASSWORD_HASHED',
  USER_ID: 'USER_ID',
};

module.exports.localStorageKeys = {
  NPC_DATASTORE: 'NPC_DATASTORE',
};

const ipcMainListeners = {
  GENERATE_SALT: 'GENERATE_SALT',
  HASH_PASSWORD: 'HASH_PASSWORD',
  GET_ENV: 'GET_ENV',
  GET_ENV_SYNC: 'GET_ENV_SYNC',
  OPEN_EXTERNAL: 'OPEN_EXTERNAL',
};
module.exports.ipcMainListeners = ipcMainListeners;

module.exports.PW_ENV_VAR = 'NPC_PASSWORD';

const POCKET_ENDPOINT_VAR = 'NPC_POCKET_ENDPOINT';
module.exports.POCKET_ENDPOINT_VAR = POCKET_ENDPOINT_VAR;

const API_ENDPOINT_VAR = 'NPC_API_ENDPOINT';
module.exports.API_ENDPOINT_VAR = API_ENDPOINT_VAR;

module.exports.CONTACT_NAME = 'Shane Burgett';
module.exports.CONTACT_EMAIL = 'shane@decentralizedauthority.com';

module.exports.REQUEST_TIMEOUT = 30000;

try {
  if(window) {
    module.exports.POCKET_ENDPOINT = window.ipcRenderer.sendSync(ipcMainListeners.GET_ENV_SYNC, POCKET_ENDPOINT_VAR);
    module.exports.API_ENDPOINT = window.ipcRenderer.sendSync(ipcMainListeners.GET_ENV_SYNC, API_ENDPOINT_VAR);
  }
} catch(err) {
  // do nothing
}
