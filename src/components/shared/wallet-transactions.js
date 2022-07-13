import PropTypes from 'prop-types';
import { PricingController } from '../../modules/pricing-controller';
import { useEffect, useState } from 'react';
import { AccountController } from '../../modules/account-controller';
import { sortTransactions } from '../../util';
import { Account } from '../../types/account';
import { TransactionCard } from './transaction-card';

export const WalletTransactions = ({ account, accountController, pricing, handleError, onDone }) => {

  const [ allTransactions, setAllTransactions ] = useState([]);

  useEffect(() => {
    if(account && accountController) {
      (async function() {
        try {
          let { sent, received } = await accountController.getTransactions(account.address, 50)
          for(let i = 0; i < sent.length; i++) {
            sent[i].received = false;
          }
          for(let i = 0; i < received.length; i++) {
            received[i].received = true;
          }
          const combined = sortTransactions([...received, ...sent]);
          setAllTransactions(combined);
        } catch(err) {
          console.error(err);
        }
      })();
    }
  }, [account, accountController]);

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
  };

  const onBackClick = e => {
    e.preventDefault();
    onDone();
  };

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header'}>
        <h3><a href={'#'} title={'Back'} onClick={onBackClick}><span className={'mdi mdi-arrow-left'} /></a> Wallet Transactions</h3>
      </div>
      <div className={'card-body'} style={styles.listContainer}>
        <div style={styles.listInnerContainer}>
          {allTransactions
            .map(t => {
              const key = t.received ? t.hash + '-received' : t.hash + '-sent';
              return (
                <TransactionCard key={key} transaction={t} />
              );
            })
          }
        </div>
      </div>
    </div>
  );
};
WalletTransactions.propTypes = {
  account: PropTypes.instanceOf(Account),
  accountController: PropTypes.instanceOf(AccountController),
  pricing: PropTypes.instanceOf(PricingController),
  handleError: PropTypes.func,
  onDone: PropTypes.func,
};
