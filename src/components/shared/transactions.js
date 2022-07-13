import PropTypes from 'prop-types';
import { ValidatorNode } from '../../types/validator-node';
import { ipcMainListeners } from '../../constants';
import { useEffect, useState } from 'react';
import { AccountController } from '../../modules/account-controller';
import { truncateAddress } from '../../util';
import * as math from 'mathjs';

const { bignumber } = math;

export const Transactions = ({ accountController, nodes }) => {

  const [ allTransactions, setAllTransactions ] = useState([]);

  useEffect(() => {
    if(nodes && accountController) {
      (async function() {
        try {
          let allSent = [];
          let allReceived = [];
          for(const node of nodes) {
            const { sent, received } = await accountController.getTransactions(node.address)
            allSent = [
              ...allSent,
              ...sent,
            ];
            allReceived = [
              ...allReceived,
              ...received,
            ];
          }
          for(let i = 0; i < allSent.length; i++) {
            allSent[i].received = false;
          }
          for(let i = 0; i < allReceived.length; i++) {
            allReceived[i].received = true;
          }
          const combined = [...allReceived, ...allSent]
            .sort((a, b) => {
              if(a.height === b.height) {
                return a.index === b.index ? 0 : a.index > b.index ? -1 : 1;
              } else {
                return a.height > b.height ? -1 : 1
              }
            });
          setAllTransactions(combined);
        } catch(err) {
          console.error(err);
        }
      })();
    }
  }, [nodes, accountController]);

  const styles = {
    listContainer: {
      position: 'relative',
    },
    listInnerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
    card: {
      backgroundColor: 'rgba(0, 0, 0, .2)',
    },
    balanceContainer: {
      display: 'inline-block',
      minWidth: 100,
      textAlign: 'right',
    },
  };

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header'}>
        <h3>Recent Node Transactions</h3>
      </div>
      <div className={'card-body'} style={styles.listContainer}>
        <div style={styles.listInnerContainer}>
          {allTransactions
            .map(t => {
              const key = t.received ? t.hash + '-received' : t.hash + '-sent';
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
                <div key={key} style={styles.card} className={'card m-1'}>
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
            })
          }
        </div>
      </div>
    </div>
  );
};
Transactions.propTypes = {
  accountController: PropTypes.instanceOf(AccountController),
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
};
