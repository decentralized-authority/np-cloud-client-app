import PropTypes from 'prop-types';
import { ValidatorNode } from '../../types/validator-node';
import { dashboardMainViews, ipcMainListeners } from '../../constants';
import { truncateAddress } from '../../util';

export const ValidatorNodes = ({ nodes, setDashboardMainView }) => {
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

  const onNewClick = e => {
    e.preventDefault();
    setDashboardMainView(dashboardMainViews.STAKE);
  };

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header d-flex flex-row justify-content-between'}>
        <h3>Validator Nodes</h3>
        <button className={'btn btn-primary'} onClick={onNewClick}>Create New Node(s)</button>
      </div>
      <div className={'card-body'} style={styles.listContainer}>
        <div style={styles.listInnerContainer}>
          {nodes
            .map(n => {

              const onCopyAddressClick = e => {
                e.preventDefault();
                window.ipcRenderer.send(ipcMainListeners.COPY_TO_CLIPBOARD, n.address);
              };

              return (
                <div key={n.address} style={styles.card} className={'card m-1'}>
                  <div className={'card-body'}>
                    <div className={'d-flex flex-row justify-content-between'}>
                      <div className={'text-monospace'}>{truncateAddress(n.address)} <a href={'#'} onClick={onCopyAddressClick}><span className={'mdi mdi-content-copy'} /></a></div>
                      <div>Balance: <strong style={styles.balanceContainer} className={'text-monospace'}>{n.balance} POKT</strong></div>
                    </div>
                    <div className={'mt-1 d-flex flex-row justify-content-between'}>
                      <div>Status: <strong className={n.staked ? 'text-success' : 'text-danger'}>{n.staked ? 'Staked' : 'Not Staked'}</strong></div>
                      <div>{n.staked ? <span>Stake Amount: <strong style={styles.balanceContainer} className={'text-success text-monospace'}>{n.stakedAmount} POKT</strong></span> : ''}</div>
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
ValidatorNodes.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
  setDashboardMainView: PropTypes.func,
};
