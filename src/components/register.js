import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { dataStoreKeys, CONTACT_EMAIL, CONTACT_NAME, ipcMainListeners, PW_ENV_VAR } from '../constants';
import { dataStore } from '../modules/data-store';
import { getPocketInstance } from '../util';
import _ from 'lodash';
import { Account } from '../types/account';

export const RegisterUser = ({ account, masterPassword, handleError, onChange }) => {

  const [ invitation, setInvitation ] = useState('');

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
  };

  const onEmailClick = e => {
    e.preventDefault();
    window.ipcRenderer.send(
      ipcMainListeners.OPEN_EXTERNAL,
      `mailto:${CONTACT_EMAIL}`
    );
  };
  const onInvitationChange = e => {
    e.preventDefault();
    setInvitation(e.target.value);
  };

  const onSubmit = async e => {
    try {
      e.preventDefault();
      const preppedInvitation = invitation.trim();
      console.log('preppedInvitation', preppedInvitation);
    } catch(err) {
      handleError(err);
    }
  };

  return (
    <div style={styles.container}>
      <form className={'pt-1 pb-1 pl-3 pr-3'} style={styles.form} onSubmit={onSubmit}>
        <h1>Register</h1>
        <p>In order to use Node Pilot Cloud, you need to register and get a user ID. Please enter your invite code below and submit to register for your ID. If you don't yet have an invitation ID, please contact {CONTACT_NAME} (<a href={'#'} onClick={onEmailClick}>{CONTACT_EMAIL}</a>).</p>
        <div className={'form-group'}>
          <label>Invitation ID:</label>
          <input type={'text'} className={'form-control'} value={invitation} onChange={onInvitationChange} autoFocus={true} />
        </div>
        <div className={'form-group mt-3'}>
          <button type={'submit'} className={'btn btn-primary w-100'} disabled={!invitation.trim()}>Submit</button>
        </div>
      </form>
    </div>
  );
};
RegisterUser.propTypes = {
  masterPassword: PropTypes.string,
  account: PropTypes.instanceOf(Account),
  handleError: PropTypes.func,
  onChange: PropTypes.func,
};
