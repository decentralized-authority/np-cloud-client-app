import PropTypes from 'prop-types';
import { dashboardMainViews, ipcMainListeners } from '../constants';
import { Account } from '../types/account';
import { ApiController } from '../modules/api-controller';
import { Send } from './shared/send';
import { AccountController } from '../modules/account-controller';
import { useState } from 'react';
import { Stake } from './shared/stake';
import { ValidatorNodes } from './shared/validator-nodes';
import { ValidatorNode } from '../types/validator-node';
import { Stats } from './shared/stats';
import { PricingController } from '../modules/pricing-controller';
import * as math from 'mathjs';
import { Transactions } from './shared/transactions';
import { WalletTransactions } from './shared/wallet-transactions';

const { bignumber } = math;

export const Dashboard = ({ dashboardMainView, setDashboardMainView, userId, account, accountController, apiController, apiToken, balance, masterPassword, nodes, pricing, handleError, onUpdateNodes }) => {

  const styles = {
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    label: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    body: {
      flexGrow: 1,
    },
    leftSidebar: {
      width: 450,
      minWidth: 450,
      maxWidth: 450,
    },
    rightSidebar: {
      width: 370,
      minWidth: 370,
      maxWidth: 370,
    },
    textCol1: {
      display: 'inline-block',
      minWidth: 100,
    },
    textCol2: {
      fontWeight: 'normal',
    },
    walletButton: {
      flexBasis: '1px',
    },
  };
  const onCopyAddressClick = e => {
    e.preventDefault();
    window.ipcRenderer.send(ipcMainListeners.COPY_TO_CLIPBOARD, account.address);
  };
  const onSendPoktClick = e => {
    e.preventDefault();
    setDashboardMainView(dashboardMainViews.SEND);
  };
  const onViewWalletTransactionsClick = e => {
    e.preventDefault();
    setDashboardMainView(dashboardMainViews.WALLET_TRANSACTIONS);
  };
  const onStakeDone = updateNodes => {
    if(updateNodes)
      onUpdateNodes();
    setDashboardMainView(dashboardMainViews.DASHBOARD);
  };

  let balanceInUSD = '';
  try {
    balanceInUSD = pricing.convert(bignumber(balance), PricingController.currencies.USD);
    balanceInUSD = Number(balanceInUSD).toFixed(2);
  } catch(err) {
    // do nothing with error
  }

  return (
    <div style={styles.container}>

      <div className={'pt-2 pb-2 pl-2 d-flex flex-column justify-content-start'} style={styles.leftSidebar}>
        <ValidatorNodes nodes={nodes} setDashboardMainView={setDashboardMainView} />
      </div>

      <div className={'pt-2 pb-2 pl-2 pr-2 d-flex flex-column justify-content-start'} style={styles.body}>

        <div className={'card mb-2'}>
          <div className={'card-header'}>
            <h3>Wallet</h3>
          </div>
          <div className={'card-body'}>
            <div className={'d-flex flex-row justify-content-start flex-nowrap'}>
              <h4><span style={styles.textCol1}>Balance:</span><span style={styles.textCol2} className={'text-monospace'}>{balance} POKT <small>{balanceInUSD ? `$${balanceInUSD} USD` : ''}</small></span></h4>
            </div>
            <div className={'d-flex flex-row justify-content-start flex-nowrap'}>
              <h4><span style={styles.textCol1}>Address:</span><span style={styles.textCol2} className={'text-monospace'}>{account.address}</span> <span style={styles.textCol2}><a href={'#'} onClick={onCopyAddressClick}><span className={'mdi mdi-content-copy'} /></a></span></h4>
            </div>
            <div className={'mt-2 d-flex flex-row justify-content-start flex-wrap flex-gap-1'}>
              <button style={styles.walletButton} className={'btn btn-primary flex-grow-1'} onClick={onSendPoktClick}>Send POKT</button>
              <button style={styles.walletButton} className={'btn btn-primary flex-grow-1'} onClick={onViewWalletTransactionsClick}>View Wallet Transactions</button>
            </div>
          </div>
        </div>

        {dashboardMainView === dashboardMainViews.DASHBOARD ?
          <Stats nodes={nodes} handleError={handleError} onDone={() => setDashboardMainView(dashboardMainViews.DASHBOARD)} pricing={pricing} />
          :
          dashboardMainView === dashboardMainViews.SEND ?
            <Send account={account} accountController={accountController} balance={balance} handleError={handleError} masterPassword={masterPassword} onDone={() => setDashboardMainView(dashboardMainViews.DASHBOARD)} />
            :
            dashboardMainView === dashboardMainViews.STAKE ?
              <Stake userId={userId} apiToken={apiToken} account={account} accountController={accountController} apiController={apiController} balance={balance} handleError={handleError} masterPassword={masterPassword} onDone={onStakeDone} />
              :
              dashboardMainView === dashboardMainViews.WALLET_TRANSACTIONS ?
                <WalletTransactions account={account} accountController={accountController} handleError={handleError} pricing={pricing} onDone={() => setDashboardMainView(dashboardMainViews.DASHBOARD)} />
                :
                null
        }
      </div>

      <div className={'pt-2 pb-2 pr-2 d-flex flex-column justify-content-start'} style={styles.rightSidebar}>
        <Transactions accountController={accountController} nodes={nodes} />
      </div>

    </div>
  );
};
Dashboard.propTypes = {
  userId: PropTypes.string,
  masterPassword: PropTypes.string,
  account: PropTypes.instanceOf(Account),
  accountController: PropTypes.instanceOf(AccountController),
  apiController: PropTypes.instanceOf(ApiController),
  apiToken: PropTypes.string,
  balance: PropTypes.string,
  pricing: PropTypes.instanceOf(PricingController),
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
  handleError: PropTypes.func,
  onUpdateNodes: PropTypes.func,
  dashboardMainView: PropTypes.string,
  setDashboardMainView: PropTypes.func,
};
