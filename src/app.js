import { useEffect, useState } from 'react';
import { dataStore } from './modules/data-store';
import { dataStoreKeys } from './constants';
import { MasterPassword } from './components/master-password';
import { CreateAccount } from './components/create-account';
import swal from 'sweetalert';
import { Account } from './types/account';
import { RegisterUser } from './components/register';

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

  useEffect(() => {
    const account = dataStore.getItem(dataStoreKeys.ACCOUNT);
    if(account)
      setAccount(new Account(account));
    const userId = dataStore.getItem(dataStoreKeys.USER_ID);
    if(userId)
      setUserId(userId);
    window.addEventListener('resize', e => {
      if(!e.target)
        return;
      const { innerHeight: height, innerWidth: width } = e.target;
      setWindowSize({height, width});
    });
  }, []);

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
    activeView = <CreateAccount handleError={handleError} masterPassword={masterPassword} onChange={setAccount} />;
  } else if(!userId) {
    activeView = <RegisterUser handleError={handleError} masterPassword={masterPassword} onChange={setUserId} />;
  }

  return (
    <div style={styles.container}>
      {activeView}
    </div>
  );
}

export default App;
