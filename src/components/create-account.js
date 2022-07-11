import { useState } from 'react';
import PropTypes from 'prop-types';
import { dataStoreKeys } from '../constants';
import { dataStore } from '../modules/data-store';
import { AccountController } from '../modules/account-controller';

export const CreateAccount = ({ accountController, handleError, masterPassword, onChange }) => {

  const [ privateKey, setPrivateKey ] = useState('');
  const [ showKey, setShowKey ] = useState(false);
  const [ importAccount, setImportAccount ] = useState(false);

  const styles = {
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    form: {
      marginTop: 200,
      width: 600,
      background: 'rgba(0,0,0,.2',
      borderRadius: 10
    },
    label: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      gap: '8px'
    }
  };

  const onToggleImportClick = e => {
    e.preventDefault();
    setImportAccount(!importAccount);
  };
  const onToggleShowKey = e => {
    e.preventDefault();
    setShowKey(!showKey);
  };
  const onPrivateKeyChange = e => {
    e.preventDefault();
    setPrivateKey(e.target.value);
  };
  const onSubmit = async e => {
    try {
      e.preventDefault();
      let account;
      if(importAccount) {
        const preppedPrivateKey = privateKey.trim();
        account = await accountController.importAccount(preppedPrivateKey, masterPassword);
      } else {
        account = await accountController.createAccount(masterPassword);
      }
      dataStore.setItem(dataStoreKeys.ACCOUNT, account);
      onChange(account);
    } catch(err) {
      handleError(err);
    }
  };

  return (
    <div style={styles.container}>
      <form className={'pt-1 pb-1 pl-3 pr-3'} style={styles.form} onSubmit={onSubmit}>
        <h1>Create/Import Account</h1>
        <h4 className={'mt-3 pb-3'}>Would you like to create a new POKT wallet or use and existing one?</h4>
        <div className={'form-group'} style={styles.buttonContainer}>
          <button type={'button'} className={`btn btn-${importAccount ? 'primary' : 'secondary'} w-100`} onClick={onToggleImportClick}>Import Account</button>
          <button type={'button'} className={`btn btn-${importAccount ? 'secondary' : 'primary'} w-100`} onClick={onToggleImportClick}>Create New Account</button>
        </div>
        {!importAccount ?
          <p>This will create a new POKT wallet for you. This wallet will be used to send coin for creating new validator nodes and will collect rewards during the daily sweep.</p>
          :
          <div>
            <p>This will import an existing POKT wallet for you. This wallet will be used to send coin for creating new validator nodes and will collect rewards during the daily sweep.</p>
            <div className={'form-group'}>
              <label style={styles.label}>Raw Private Key: <a href={'#'} onClick={onToggleShowKey}>{showKey ? 'Hide Key' : 'Show Key'}</a></label>
              <input className={'form-control'} type={showKey ? 'text' : 'password'} value={privateKey} onChange={onPrivateKeyChange} placeholder={'Enter raw private key'} autoFocus={true} />
            </div>
          </div>
        }
        <div className={'form-group mt-3'}>
          {importAccount ?
            <button type={'submit'} className={'btn btn-primary w-100'} disabled={!privateKey.trim()}>Import Private Key</button>
            :
            <button type={'submit'} className={'btn btn-primary w-100'}>Generate New Private Key</button>
          }
        </div>
      </form>
    </div>
  );
};
CreateAccount.propTypes = {
  accountController: PropTypes.instanceOf(AccountController),
  masterPassword: PropTypes.string,
  handleError: PropTypes.func,
  onChange: PropTypes.func,
};
