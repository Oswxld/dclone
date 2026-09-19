import {useState} from 'react';

function useBalance() {
  const [balance, setBalance] = useState(0);

  function addMoney() {
    setBalance(balance + 1);
  }

  function removeMoney() {
    setBalance(balance - 1);
  }

  return {
    balance,
    addMoney,
    removeMoney
  };
}

export default useBalance;