import { truncateAddress } from '../../util';
import { ipcMainListeners } from '../../constants';
import * as math from 'mathjs';
import PropTypes from 'prop-types';
import { Transaction as PocketTransaction } from '@pokt-network/pocket-js';

const { bignumber } = math;

export const TransactionCard = ({ transaction: t }) => {

  const styles = {
    card: {
      backgroundColor: 'rgba(0, 0, 0, .2)',
    },
  };

  const onCopyHashClick = e => {
    e.preventDefault();
    window.ipcRenderer.send(ipcMainListeners.COPY_TO_CLIPBOARD, t.hash);
  };

  let amount;
  try {
    amount = math.divide(bignumber(t.stdTx.msg.value.amount), bignumber('1000000')).toString();
  } catch(err) {
    // do nothing
  }

  return (
    <div style={styles.card} className={'card m-1'}>
      <div className={'card-body'}>
        <div className={'d-flex flex-row justify-content-between'}>
          <div>TXID:</div>
          <div><span className={'text-monospace'}>{truncateAddress(t.hash, 10)} <a href={'#'} onClick={onCopyHashClick}><span className={'mdi mdi-content-copy'} /></a></span></div>
        </div>
        <div className={'mt-1 d-flex flex-row justify-content-between'}>
          <div><strong>{t.received ? <span className={'text-success'}>Received</span> : <span className={'text-danger'}>Sent</span>}</strong></div>
          <div><strong className={`text-monospace ${t.received ? 'text-success' : 'text-danger'}`}>{amount ? `${amount} POKT` : ''}</strong></div>
        </div>
      </div>
    </div>
  );
};
TransactionCard.propTypes = {
  transaction: PropTypes.instanceOf(PocketTransaction),
}
