import { useEffect, useState } from 'react';
import { dataStore } from './modules/data-store';
import { dashboardMainViews, dataStoreKeys, API_ENDPOINT, POCKET_ENDPOINT } from './constants';
import { MasterPassword } from './components/master-password';
import { CreateAccount } from './components/create-account';
import swal from 'sweetalert';
import { Account } from './types/account';
import { RegisterUser } from './components/register';
import { AccountController } from './modules/account-controller';
import { Configuration, HttpRpcProvider, Pocket } from '@pokt-network/pocket-js';
import { ApiController } from './modules/api-controller';
import dayjs from 'dayjs';
import { Dashboard } from './components/dashboard';
import { PricingController } from './modules/pricing-controller';

const handleError = err => {
  console.error(err);
  swal({
    icon: 'error',
    title: 'Oops!',
    text: err.message,
  });
};

const App = () => {

  const [ masterPassword, setMasterPassword ] = useState('');
  const [ account, setAccount ] = useState(null);
  const [ userId, setUserId ] = useState('');
  const [ windowSize, setWindowSize ] = useState({height: window.innerHeight, width: window.innerWidth});
  const [ accountController, setAccountController ] = useState(null);
  const [ apiController ] = useState(new ApiController(API_ENDPOINT));
  const [ apiToken, setAPIToken ] = useState('');
  const [ apiTokenExpiration, setAPITokenExpiration ] = useState('');
  const [ walletBalance, setWalletBalance ] = useState('0');
  const [ nodes, setNodes ] = useState([]);
  const [ pricing, setPricing ] = useState(new PricingController({}));
  const [ dashboardMainView, setDashboardMainView ] = useState(dashboardMainViews.DASHBOARD);

  useEffect(() => {

    const dispatcher = new URL(POCKET_ENDPOINT);
    const configuration = new Configuration(5, 1000, 0, 40000, undefined, undefined, undefined, undefined, undefined, undefined, false);
    const pocket = new Pocket([dispatcher], new HttpRpcProvider(dispatcher), configuration);

    setAccountController(new AccountController(pocket));

    const account = dataStore.getItem(dataStoreKeys.ACCOUNT);
    if(account) {
      setAccount(new Account(account));
    }
    const userId = dataStore.getItem(dataStoreKeys.USER_ID);
    if(userId)
      setUserId(userId);
    window.addEventListener('resize', e => {
      if(!e.target)
        return;
      const { innerHeight: height, innerWidth: width } = e.target;
      setWindowSize({height, width});
    });

    const getPricing = () => {
      PricingController.getPricingData([PricingController.currencies.USD])
        .then(data => {
          setPricing(new PricingController(data));
        })
        .catch(console.error);
    };
    const pricingInterval = setInterval(() => {
      getPricing();
    }, 60000);
    getPricing();

    return () => {
      clearInterval(pricingInterval);
    };
  }, []);

  useEffect(() => {
    let interval;
    if(account && accountController) {
      const getBalance = () => {
        accountController.getBalance(account.address)
          .then(setWalletBalance)
          .catch(console.error);
      };
      getBalance();
      interval = setInterval(() => {
        getBalance();
      }, 60000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [account, accountController]);

  const getNodes = () => {
    apiController
      .getNodes(userId, apiToken)
      .then(nodes => {
        setNodes([...nodes]
          .reverse()
          .sort((a, b) => {
            if(a.staked === b.staked) {
              return b.stakedBlock.localeCompare(a.stakedBlock);
            } else {
              return a.staked && !b.staked ? 1 : -1;
            }
          })
        );
      })
      .catch(console.error);
  };

  useEffect(() => {
    let interval;
    if(userId && apiToken) {
      getNodes();
      setInterval(() => {
        getNodes();
      }, 60000);
    }
    return () => {
      clearInterval(interval);
    }
  }, [userId, apiToken, apiController]);

  const unlock = async (id, password) => {
    try {
      apiController.unlock(id, password)
        .then(({ token, expiration }) => {
          setAPIToken(token);
          setAPITokenExpiration(expiration);
        })
        .catch(handleError);
    } catch(err) {
      handleError(err);
    }
  };

  useEffect(() => {
    if(userId && masterPassword) {
      unlock(userId, masterPassword)
        .catch(handleError);
    }
  }, [apiController, masterPassword, userId]);

  useEffect(() => {
    let interval;
    if(apiTokenExpiration) {
      interval = setInterval(async () => {
        try {
          if(dayjs().isAfter(dayjs(apiTokenExpiration)))
            await unlock(userId, masterPassword);
        } catch(err) {
          handleError(err);
        }
      }, 30000);
    }
    return () => {
      clearInterval(interval);
    }
  }, [apiTokenExpiration, masterPassword, userId]);

  const styles = {
    container: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: windowSize.height,
      width: windowSize.width,
      overflowX: 'hidden',
      overflowY: 'hidden',
    },
  };

  let activeView = null;
  if(!masterPassword) {
    activeView = <MasterPassword handleError={handleError} onChange={setMasterPassword} />;
  } else if(!account) {
    activeView = <CreateAccount accountController={accountController} handleError={handleError} masterPassword={masterPassword} onChange={setAccount} />;
  } else if(!userId) {
    activeView = <RegisterUser account={account} handleError={handleError} apiController={apiController} masterPassword={masterPassword} onChange={setUserId} />;
  } else {
    activeView = <Dashboard account={account}
                            userId={userId}
                            nodes={nodes}
                            pricing={pricing}
                            accountController={accountController}
                            apiToken={apiToken}
                            balance={walletBalance}
                            handleError={handleError}
                            apiController={apiController}
                            onUpdateNodes={()=>getNodes()}
                            dashboardMainView={dashboardMainView}
                            setDashboardMainView={setDashboardMainView}
                            masterPassword={masterPassword} />;
  }

  return (
    <div style={styles.container}>
      {activeView}
    </div>
  );
}

export default App;
