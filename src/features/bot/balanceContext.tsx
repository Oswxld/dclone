import React, { createContext, useContext, useEffect, useState } from 'react';

export interface BotTransaction {
  id: string;
  type: string;
  entrySpot: number;
  exitSpot: number;
  stake: number;
  profit: number;
  isWin: boolean;
  timestamp: string;
}

interface BalanceContextType {
  balance: number;
  deductStake: (stake: number) => void;
  creditPayout: (payout: number) => void;
  transactions: BotTransaction[];
  addTransaction: (tx: BotTransaction) => void;
  resetAccount: () => void;
}

const INITIAL_BALANCE = 9901.92;

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('deriv_demo_balance');
    return saved ? parseFloat(saved) : INITIAL_BALANCE;
  });

  const [transactions, setTransactions] = useState<BotTransaction[]>(() => {
    const saved = localStorage.getItem('deriv_demo_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deriv_demo_balance', balance.toFixed(2));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('deriv_demo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const deductStake = (stake: number) => {
    setBalance((prev) => parseFloat((prev - stake).toFixed(2)));
  };

  const creditPayout = (payout: number) => {
    setBalance((prev) => parseFloat((prev + payout).toFixed(2)));
  };

  const addTransaction = (tx: BotTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const resetAccount = () => {
    setBalance(INITIAL_BALANCE);
    setTransactions([]);
    localStorage.setItem('deriv_demo_balance', INITIAL_BALANCE.toFixed(2));
    localStorage.removeItem('deriv_demo_transactions');
  };

  return (
    <BalanceContext.Provider
      value={{
        balance,
        deductStake,
        creditPayout,
        transactions,
        addTransaction,
        resetAccount,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};