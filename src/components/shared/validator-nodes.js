import PropTypes from 'prop-types';
import { ValidatorNode } from '../../types/validator-node';
import { dashboardMainViews, ipcMainListeners } from '../../constants';
import { truncateAddress } from '../../util';
import { ApiController } from '../../modules/api-controller';
import { AccountController } from '../../modules/account-controller';
import swal from 'sweetalert';

export const ValidatorNodes = ({ masterPassword, nodes, setDashboardMainView, apiController, accountController, userId, apiToken, handleError }) => {
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

  const onSaveKeysClick = async e => {
    e.preventDefault();
    const confirmed = await swal({
      title: 'Save Node Private Keys',
      text: 'This will save all node private keys as a CSV file. This could take a little while. You will be notified when the process is complete. Continue?',
      buttons: [
        'Cancel',
        'OK'
      ],
    });
    if(!confirmed)
      return;
    try {
      const keys = await apiController.getNodePrivateKeys(userId, apiToken);
      const decrypted = {};
      for(const [ address, encryptedKey ] of Object.entries(keys)) {
        decrypted[address] = await accountController.getRawPrivateKey(encryptedKey, masterPassword);
      }
      const content = [
        ['Address', 'Private Key'],
        ...Object.entries(decrypted),
      ];
      const filePath = await window.ipcRenderer.invoke(ipcMainListeners.EXPORT_CSV_FILE, content);
      if(filePath)
        await swal({
          icon: 'success',
          title: 'Keys successfully saved',
          text: `${Object.keys(decrypted).length} node private keys successfully saved to ${filePath}`,
        });
    } catch(err) {
      handleError(err);
    }
  };

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header d-flex flex-row justify-content-between'}>
        <h3 className={'flex-grow-1'}>Validator Nodes</h3>
        <button type={'button'} className={'btn btn-primary btn-sm mr-2'} style={{fontSize: 20}} onClick={onSaveKeysClick} title={'Save node keys'}><i className={'mdi mdi-file-export'} /></button>
        <button type={'button'} className={'btn btn-primary btn-sm'} style={{fontSize: 20}} onClick={onNewClick} title={'Create new node(s)'}><i className={'mdi mdi-plus'} /></button>
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
  masterPassword: PropTypes.string,
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
  setDashboardMainView: PropTypes.func,
  apiController: PropTypes.instanceOf(ApiController),
  accountController: PropTypes.instanceOf(AccountController),
  userId: PropTypes.string,
  apiToken: PropTypes.string,
  handleError: PropTypes.func,
};
