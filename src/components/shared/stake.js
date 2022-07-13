import PropTypes from 'prop-types';
import { AccountController } from '../../modules/account-controller';
import { useState } from 'react';
import * as math from 'mathjs';
import { Account } from '../../types/account';
import swal from 'sweetalert';
import { ApiController } from '../../modules/api-controller';
import { ipcMainListeners } from '../../constants';

const { bignumber } = math;

export const Stake = ({ userId, apiToken, account, accountController, apiController, balance, handleError, masterPassword, onDone }) => {

  const [ stakeAmount, setStakeAmount ] = useState('15100');
  const [ validatorCount, setValidatorCount ] = useState('1');
  const [ disableSubmit, setDisableSubmit ] = useState(false);

  const styles = {
    input: {
      maxWidth: 500,
    },
  };

  let total = '0';
  try {
    total = math.multiply(bignumber(stakeAmount), bignumber(validatorCount)).toString(10);
  } catch(err) {
    // do nothing with error
  }

  const onSubmit = async e => {
    e.preventDefault();
    try {
      setDisableSubmit(true);
      const balance = await accountController.getBalance(account.address);
      if(math.larger(total, bignumber(balance))) {
        setDisableSubmit(false);
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: `Required amount is greater than available balance.`,
        });
      }
      const countNum = Number(validatorCount);
      const preppedStakeAmount = stakeAmount.trim();
      const privateKey = await accountController.getRawPrivateKey(account.privateKeyEncrypted, masterPassword);
      let userBalanceRequired;
      for(let i = 0; i < countNum; i++) {
        const { address, privateKeyEncrypted, password, balanceRequired } = await apiController.stakeValidator(userId, apiToken, preppedStakeAmount);
        if(!userBalanceRequired)
          userBalanceRequired = balanceRequired;
        await window.ipcRenderer.invoke(ipcMainListeners.SAVE_KEY_PASSWORD, masterPassword, address, password);
        await window.ipcRenderer.invoke(ipcMainListeners.SAVE_PRIVATE_KEY, address, privateKeyEncrypted);
        await accountController.send(privateKey, balanceRequired, account.address, address);
      }
      setDisableSubmit(false);
      await swal({
        icon: 'success',
        title: 'Stake Requests Successful',
        text: Number(validatorCount) === 1 ?
          `${validatorCount} new validator node created and ${userBalanceRequired} POKT sent. It will be staked shortly.`
          :
          `${validatorCount} new validator nodes created and ${userBalanceRequired} POKT sent to each. They will be staked shortly.`
      });
      onDone(true);
    } catch(err) {
      handleError(err);
      setDisableSubmit(false);
    }
  };
  const onBackClick = e => {
    e.preventDefault();
    onDone();
  };
  const onStakeAmountChange = e => {
    e.preventDefault();
    setStakeAmount(e.target.value);
  }
  const onValidatorCountChange = e => {
    e.preventDefault();
    setValidatorCount(e.target.value);
  }

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header'}>
        <h3><a href={'#'} title={'Back'} onClick={onBackClick}><span className={'mdi mdi-arrow-left'} /></a> Stake Validator(s):</h3>
      </div>
      <div className={'card-body'}>
        <form onSubmit={onSubmit}>

          <div className={'form-group'}>
            <label>Stake Amount: <em>(minimum 15100 POKT)</em></label>
            <input type={'number'} style={styles.input} className={'form-control text-monospace'} placeholder={'Enter stake amount'} value={stakeAmount} onChange={onStakeAmountChange} />
          </div>

          <div className={'form-group'}>
            <label>Number of New Validators to Stake:</label>
            <input type={'number'} style={styles.input} className={'form-control text-monospace'} placeholder={'Enter new validator count'} value={validatorCount} onChange={onValidatorCountChange} />
          </div>

          <div className={'form-group'}>
            <p>Total cost <strong>{total}</strong> POKT</p>
          </div>

          <div className={'form-group'}>
            <button type={'submit'} className={'btn btn-primary'} disabled={disableSubmit}>Stake New Validators</button>
          </div>

        </form>
      </div>
    </div>
  );
};
Stake.propTypes = {
  userId: PropTypes.string,
  apiToken: PropTypes.string,
  account: PropTypes.instanceOf(Account),
  accountController: PropTypes.instanceOf(AccountController),
  apiController: PropTypes.instanceOf(ApiController),
  balance: PropTypes.string,
  handleError: PropTypes.func,
  masterPassword: PropTypes.string,
  onDone: PropTypes.func,
};
