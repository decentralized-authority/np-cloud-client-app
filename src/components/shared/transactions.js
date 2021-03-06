import PropTypes from 'prop-types';
import { ValidatorNode } from '../../types/validator-node';
import { useEffect, useState } from 'react';
import { AccountController } from '../../modules/account-controller';
import { sortTransactions } from '../../util';
import * as math from 'mathjs';
import { TransactionCard } from './transaction-card';

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
          const combined = sortTransactions([...allReceived, ...allSent]);
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
Transactions.propTypes = {
  accountController: PropTypes.instanceOf(AccountController),
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
};
