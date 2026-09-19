import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccountBalances {
  currency: string;
  totalUsd: number;
  cfdsUsd: number;
  optionsUsd: number;
  walletUsd: number;
  walletUsdt: number;
  p2pUsd: number;
  lastUpdated: string;
}

export type AccountMode = 'real' | 'demo';

export interface AccountContextType {
  activeMode: AccountMode;
  setActiveMode: (mode: AccountMode) => void;
  balances: AccountBalances;
  updateOptionsBalance: (deltaOrValue: number, isAbsolute?: boolean) => void;
  adminOverrideBalances: (updates: Partial<AccountBalances>) => void;
}

const DEFAULT_REAL_OPTIONS = 9901.92;
const DEFAULT_DEMO_OPTIONS = 10000.00;

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<AccountMode>('real');

  // 1. Real Account State
  const [realBalances, setRealBalances] = useState<AccountBalances>(() => {
    const savedOptions = localStorage.getItem('deriv_real_options_balance');
    const savedCfds = localStorage.getItem('deriv_real_cfds_balance');
    const savedWallet = localStorage.getItem('deriv_real_wallet_balance');
    const savedP2p = localStorage.getItem('deriv_real_p2p_balance');

    const optionsVal = savedOptions ? parseFloat(savedOptions) : DEFAULT_REAL_OPTIONS;
    const cfdsVal = savedCfds ? parseFloat(savedCfds) : 10000.0;
    const walletVal = savedWallet ? parseFloat(savedWallet) : 1250.0;
    const p2pVal = savedP2p ? parseFloat(savedP2p) : 500.0;
    
    return {
      currency: 'USD',
      totalUsd: parseFloat((optionsVal + cfdsVal + walletVal + p2pVal).toFixed(2)),
      cfdsUsd: cfdsVal,
      optionsUsd: optionsVal,
      walletUsd: walletVal,
      walletUsdt: 350.0,
      p2pUsd: p2pVal,
      lastUpdated: 'Just now',
    };
  });

  // 2. Demo Account State
  const [demoBalances, setDemoBalances] = useState<AccountBalances>(() => {
    const saved = localStorage.getItem('deriv_demo_options_balance');
    const optionsVal = saved ? parseFloat(saved) : DEFAULT_DEMO_OPTIONS;
    
    return {
      currency: 'USD',
      totalUsd: parseFloat((optionsVal + 10000.0).toFixed(2)),
      cfdsUsd: 10000.0,
      optionsUsd: optionsVal,
      walletUsd: 0.0,
      walletUsdt: 0.0,
      p2pUsd: 0.0,
      lastUpdated: 'Just now',
    };
  });

  // Save real balances automatically
  useEffect(() => {
    localStorage.setItem('deriv_real_options_balance', realBalances.optionsUsd.toFixed(2));
    localStorage.setItem('deriv_real_cfds_balance', realBalances.cfdsUsd.toFixed(2));
    localStorage.setItem('deriv_real_wallet_balance', realBalances.walletUsd.toFixed(2));
    localStorage.setItem('deriv_real_p2p_balance', realBalances.p2pUsd.toFixed(2));
  }, [realBalances.optionsUsd, realBalances.cfdsUsd, realBalances.walletUsd, realBalances.p2pUsd]);

  // Save demo balances automatically
  useEffect(() => {
    localStorage.setItem('deriv_demo_options_balance', demoBalances.optionsUsd.toFixed(2));
  }, [demoBalances.optionsUsd]);

  // The active balances exposed to the rest of the app
  const balances = activeMode === 'real' ? realBalances : demoBalances;

  // Updates whichever account is currently active (used primarily by the Bot)
  const updateOptionsBalance = (deltaOrValue: number, isAbsolute = false) => {
    if (activeMode === 'real') {
      setRealBalances((prev) => {
        const nextOptions = isAbsolute ? parseFloat(deltaOrValue.toFixed(2)) : parseFloat((prev.optionsUsd + deltaOrValue).toFixed(2));
        return { ...prev, optionsUsd: nextOptions, totalUsd: parseFloat((nextOptions + prev.cfdsUsd + prev.walletUsd + prev.p2pUsd).toFixed(2)), lastUpdated: 'Just now' };
      });
    } else {
      setDemoBalances((prev) => {
        const nextOptions = isAbsolute ? parseFloat(deltaOrValue.toFixed(2)) : parseFloat((prev.optionsUsd + deltaOrValue).toFixed(2));
        return { ...prev, optionsUsd: nextOptions, totalUsd: parseFloat((nextOptions + prev.cfdsUsd + prev.walletUsd + prev.p2pUsd).toFixed(2)), lastUpdated: 'Just now' };
      });
    }
  };

  // NEW: God-mode override for all balances
  const adminOverrideBalances = (updates: Partial<AccountBalances>) => {
    setRealBalances((prev) => {
      const nextOptions = updates.optionsUsd !== undefined ? updates.optionsUsd : prev.optionsUsd;
      const nextCfds = updates.cfdsUsd !== undefined ? updates.cfdsUsd : prev.cfdsUsd;
      const nextWallet = updates.walletUsd !== undefined ? updates.walletUsd : prev.walletUsd;
      const nextP2p = updates.p2pUsd !== undefined ? updates.p2pUsd : prev.p2pUsd;

      return {
        ...prev,
        optionsUsd: nextOptions,
        cfdsUsd: nextCfds,
        walletUsd: nextWallet,
        p2pUsd: nextP2p,
        totalUsd: parseFloat((nextOptions + nextCfds + nextWallet + nextP2p).toFixed(2)),
        lastUpdated: 'Just now',
      };
    });
  };

  return (
    <AccountContext.Provider value={{ activeMode, setActiveMode, balances, updateOptionsBalance, adminOverrideBalances }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return ctx;
};