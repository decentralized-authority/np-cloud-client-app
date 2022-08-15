import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { dataStoreKeys, ipcMainListeners, PW_ENV_VAR } from '../constants';
import { dataStore } from '../modules/data-store';
import { onImportUserData } from '../util';

export const MasterPassword = ({ handleError, onChange }) => {

  const [ passwordSalt ] = useState(dataStore.getItem(dataStoreKeys.PASSWORD_SALT));
  const [ passwordHashed ] = useState(dataStore.getItem(dataStoreKeys.PASSWORD_HASHED));
  const [ password, setPassword ] = useState('');
  const [ passwordRepeat, setPasswordRepeat ] = useState('');
  const [ showPassword, setShowPassword ] = useState(false);

  useEffect(() => {
    window.ipcRenderer.invoke(ipcMainListeners.GET_ENV, PW_ENV_VAR)
      .then(pw => {
        if(pw) {
          setPassword(pw);
          setPasswordRepeat(pw);
        }
      })
      .catch(handleError);
  }, []);

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
      marginTop: 200,
    },
    form: {
      width: 600,
      background: 'rgba(0,0,0,.2',
      borderRadius: 10
    },
    label: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  };

  const showLogin = passwordHashed;

  const onPasswordChange = e => {
    e.preventDefault();
    setPassword(e.target.value);
  };
  const onPasswordRepeatChange = e => {
    e.preventDefault();
    setPasswordRepeat(e.target.value);
  };
  const onToggleShowHidePassword = e => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
  const onSubmit = async e => {
    e.preventDefault();
    if(showLogin) {
      const hashed = await window.ipcRenderer.invoke(ipcMainListeners.HASH_PASSWORD, password, passwordSalt);
      if(hashed === passwordHashed) {
        onChange(password);
      } else {
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: 'Invalid password.'
        });
      }
    } else { // new user
      if(password !== passwordRepeat) {
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: 'Password and repeated password do not match.',
        });
      } else if(password.trim().length < 12) {
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: 'Password must be at least 12 characters in length.',
        });
      }
      const salt = await window.ipcRenderer.invoke(ipcMainListeners.GENERATE_SALT);
      const hashed = await window.ipcRenderer.invoke(ipcMainListeners.HASH_PASSWORD, password, salt);
      if(salt && hashed) {
        dataStore.setItem(dataStoreKeys.PASSWORD_SALT, salt);
        dataStore.setItem(dataStoreKeys.PASSWORD_HASHED, hashed);
        onChange(password);
      }
    }
  };
  const onImportUserDataClick = async e => {
    e.preventDefault();
    await onImportUserData();
  };

  return (
    <div style={styles.container}>
      <form className={'pt-1 pb-1 pl-3 pr-3'} style={styles.form} onSubmit={onSubmit}>
        <h1 className={'d-flex flex-row justify-content-between'}>Node Pilot Cloud Client {!showLogin ? <button title={'Import user data'} className={'btn btn-primary'} type={'button'} style={{paddingTop: 0, paddingBottom: 0, fontSize: 20}} onClick={onImportUserDataClick}><i className={'mdi mdi-file-import'} /></button> : ''}</h1>
        {showLogin ?
          <p>Welcome to the Node Pilot Cloud Client! This is meant to be a proof of concept for interacting with the Node Pilot Cloud API. Please enter your master password to continue.</p>
          :
          <p>Welcome to the Node Pilot Cloud Client! This is meant to be a proof of concept for interacting with the Node Pilot Cloud API.
            Before you can begin, you need to add a master password and create an account. This password will be used to
            encrypt all of your private keys on Node Pilot servers.</p>
        }
        <div className={'form-group'}>
          <label style={styles.label}>Master Password: <a href={'#'} onClick={onToggleShowHidePassword}>{showPassword ? 'Hide Password' : 'Show Password'}</a></label>
          <input className={'form-control'} type={showPassword ? 'text' : 'password'} value={password} onChange={onPasswordChange} placeholder={'Enter master password'} autoFocus={true} />
        </div>
        {!showLogin ?
          <div className={'form-group'}>
            <label>Repeat Master Password:</label>
            <input className={'form-control'} type={showPassword ? 'text' : 'password'} value={passwordRepeat} onChange={onPasswordRepeatChange} placeholder={'Repeat master password'} />
          </div>
          :
          null
        }
        <div className={'form-group mt-3'}>
          {showLogin ?
            <button type={'submit'} className={'btn btn-primary w-100'} disabled={!password.trim()}>Unlock Account</button>
            :
            <button type={'submit'} className={'btn btn-primary w-100'} disabled={!password.trim() || !passwordRepeat.trim() || password !== passwordRepeat}>Save Master Password</button>
          }
        </div>
      </form>
    </div>
  );
};
MasterPassword.propTypes = {
  handleError: PropTypes.func,
  onChange: PropTypes.func,
};
