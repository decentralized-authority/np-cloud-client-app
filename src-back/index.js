const path = require('path');
const isDev = require('electron-is-dev');
const serve = require('electron-serve');
const { app, screen, BrowserWindow, clipboard, dialog, ipcMain, shell } = require('electron');
const electronContextMenu = require('electron-context-menu');
const { ipcMainListeners } = require('./constants');
const { generateSalt, pbkdf2, encrypt, decrypt} = require('./util');
const { DB } = require('./db');
const fs = require('fs-extra');

const dataDir = app.getPath('userData');
const db = new DB(dataDir);

electronContextMenu();

const serveDir = !isDev ? serve({directory: path.resolve(__dirname, '../build')}) : null;

let appWindow;

const init = async function() {
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;
  appWindow = new BrowserWindow({
    backgroundColor: '#14171a',
    width: width - 200,
    minWidth: 1280,
    height: height - 200,
    minHeight: 800,
    show: false,
    webPreferences: {
      webSecurity: false,
      preload: path.resolve(__dirname, '../public/api.js'),
    }
  });
  appWindow.once('ready-to-show', () => {
    appWindow.show();
  });
  if(isDev) {
    appWindow.toggleDevTools();
    await appWindow.loadURL('http://localhost:3000');
  } else {
    serveDir(appWindow)
      .catch(err => {
        console.error(`'serveDir error: ${err.message} \n ${err.stack}`);
      });
  }
};

ipcMain.on(ipcMainListeners.GET_ENV_SYNC, (e, name) => {
  e.returnValue = process.env[name];
});
ipcMain.handle(ipcMainListeners.GET_ENV, (e, name) => {
  return process.env[name];
});
ipcMain.handle(ipcMainListeners.GENERATE_SALT, e => {
  return generateSalt(32);
});
ipcMain.handle(ipcMainListeners.HASH_PASSWORD, (e, password, salt) => {
  return pbkdf2(password, salt);
});
ipcMain.on(ipcMainListeners.OPEN_EXTERNAL, (e, url) => {
  shell.openExternal(url)
    .catch(console.error);
});
ipcMain.on(ipcMainListeners.COPY_TO_CLIPBOARD, (e, val) => {
  clipboard.writeText(val);
});

ipcMain.handle(ipcMainListeners.SAVE_KEY_PASSWORD, async (e, masterPassword, address, passwordToSave) => {
  try {
    const salt = generateSalt();
    const iv = generateSalt();
    const encrypted = encrypt(masterPassword, salt, passwordToSave, iv);
    await db.passwords.insert({
      address,
      salt,
      encrypted,
      iv,
    });
    return true;
  } catch(err) {
    console.error(err);
    return false;
  }
});
ipcMain.handle(ipcMainListeners.GET_KEY_PASSWORDS, async (e, masterPassword) => {
  const privateKeys = await db.passwords.find({});
  return privateKeys
    .reduce((obj, k) => {
      return {
        ...obj,
        [k.address]: decrypt(masterPassword, k.salt, k.encrypted, k.iv),
      };
    }, {});
});
ipcMain.handle(ipcMainListeners.SAVE_PRIVATE_KEY, async (e, address, privateKeyEncrypted) => {
  try {
    await db.privateKeys.insert({
      address,
      privateKeyEncrypted,
    });
    return true;
  } catch(err) {
    console.error(err);
    return false;
  }
});
ipcMain.handle(ipcMainListeners.GET_PRIVATE_KEYS, async (e) => {
  const privateKeys = await db.privateKeys.find({});
  return privateKeys
    .reduce((obj, k) => {
      return {
        ...obj,
        [k.address]: k.privateKeyEncrypted
      };
    }, {});
});

const datastorePath = path.join(dataDir, 'user-data.json');
if(!fs.pathExistsSync(datastorePath)) {
  fs.writeJsonSync(datastorePath, {}, {spaces: 2});
}
ipcMain.on(ipcMainListeners.SAVE_DATASTORE, (e, data) => {
  fs.writeJsonSync(datastorePath, data, {spaces: 2});
  e.returnValue = true;
});
ipcMain.on(ipcMainListeners.GET_DATASTORE, e => {
  e.returnValue = fs.readJsonSync(datastorePath);
});

ipcMain.on(ipcMainListeners.EXPORT_USER_DATA, async (e, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(
    appWindow,
    {
      title: 'Save user data',
      defaultPath: 'npc_user_data.json',
      filters: [
        {name: 'JSON files', extensions: ['json']}
      ],
    }
  );
  if(canceled || !filePath)
    return;
  await fs.writeJsonSync(filePath, data, {spaces: 2});
});
ipcMain.handle(ipcMainListeners.IMPORT_USER_DATA, async e => {
  const { canceled, filePaths } = await dialog.showOpenDialog(
    appWindow,
    {
      title: 'Import user data',
      filters: [
        {name: 'JSON files', extensions: ['json']}
      ],
    }
  );
  if(canceled || filePaths.length === 0)
    return;
  try {
    return await fs.readJson(filePaths[0]);
  } catch(err) {
    console.error(err);
  }
});

ipcMain.on(ipcMainListeners.RESTART, e => {
  app.relaunch();
  app.quit();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', init);
