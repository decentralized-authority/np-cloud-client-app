import PropTypes from 'prop-types';
import { AccountController } from '../../modules/account-controller';
import { useState } from 'react';
import * as math from 'mathjs';
import { Account } from '../../types/account';
import swal from 'sweetalert';

const { bignumber } = math;

export const Send = ({ account, accountController, balance, handleError, masterPassword, onDone }) => {

  const [ amount, setAmount ] = useState('');
  const [ toAddress, setToAddress ] = useState('');
  const [ memo, setMemo ] = useState('');
  const [ disableSubmit, setDisableSubmit ] = useState(false);

  const styles = {
    scrollContainer: {
      position: 'relative',
    },
    scrollInnerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      overflowX: 'hidden',
      overflowY: 'auto',
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 24,
      paddingBottom: 24,
    },
    input: {
      maxWidth: 500,
    },
  };

  const onAmountChange = e => {
    e.preventDefault();
    setAmount(e.target.value);
  };
  const onToAddressChange = e => {
    e.preventDefault();
    setToAddress(e.target.value.trim());
  };
  const onMemoChange = e => {
    e.preventDefault();
    setMemo(e.target.value);
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      setDisableSubmit(true);
      const preppedAmount = amount.trim();
      const amountNum = bignumber(preppedAmount);
      const preppedAddress = toAddress.trim();
      const preppedMemo = memo.trim();
      const validAddress = accountController.validateAddress(preppedAddress);
      if(!validAddress) {
        setDisableSubmit(false);
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: `${preppedAddress} is not a valid address.`
        });
      } else if(math.equal(amountNum, bignumber(0))) {
        setDisableSubmit(false);
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: `You must enter an amount greater than zero.`,
        });
      } else if(math.larger(amountNum, math.subtract(bignumber(balance), bignumber('0.01')))) {
        setDisableSubmit(false);
        return swal({
          icon: 'warning',
          title: 'Oops!',
          text: `Amount is greater than available balance.`,
        });
      }
      const privateKey = await accountController
        .getRawPrivateKey(account.privateKeyEncrypted, masterPassword);
      const tx = await accountController.send(
        privateKey,
        preppedAmount,
        account.address,
        preppedAddress,
        preppedMemo,
      );
      setDisableSubmit(false);
      if(tx) {
        await swal({
          icon: 'success',
          title: 'Transaction Successfully Submitted',
          text: `From:\n${account.address}\nTo:\n${preppedAddress}\nFee:\n0.01 POKT\nTXID:\n${tx}`,
        });
        onDone();
      }
    } catch(err) {
      handleError(err);
      setDisableSubmit(false);
    }
  };
  const onBackClick = e => {
    e.preventDefault();
    onDone();
  };

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header'}>
        <h3><a href={'#'} title={'Back'} onClick={onBackClick}><span className={'mdi mdi-arrow-left'} /></a> Send POKT:</h3>
      </div>
      <div className={'card-body'} style={styles.scrollContainer}>
        <div style={styles.scrollInnerContainer}>
          <form onSubmit={onSubmit}>

            <div className={'form-group'}>
              <label>Amount in POKT:</label>
              <input style={styles.input} className={'form-control text-monospace'} value={amount} onChange={onAmountChange} type={'number'} placeholder={'Enter amount of POKT to send'} required={true} />
            </div>

            <div className={'form-group'}>
              <label>To Address:</label>
              <input style={styles.input} className={'form-control text-monospace'} value={toAddress} onChange={onToAddressChange} type={'text'} placeholder={'Enter recipient\'s POKT address'} required={true} />
            </div>

            <div className={'form-group'}>
              <label>Memo:</label>
              <textarea rows={3} style={styles.input} className={'form-control'} value={memo} onChange={onMemoChange} type={'text'} placeholder={'Enter optional memo'} />
            </div>

            <div className={'form-group'}>
              <button type={'submit'} className={'btn btn-primary'} disabled={disableSubmit}>Submit Transaction</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
Send.propTypes = {
  account: PropTypes.instanceOf(Account),
  accountController: PropTypes.instanceOf(AccountController),
  balance: PropTypes.string,
  handleError: PropTypes.func,
  masterPassword: PropTypes.string,
  onDone: PropTypes.func,
};
