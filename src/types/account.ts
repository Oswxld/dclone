export interface AccountBalances {
  totalUsd: number;
  cfdsUsd: number;
  optionsUsd: number;
  walletUsd: number;
  walletUsdt: number;
  p2pUsd: number;
  currency: string;
  lastUpdated: string;
}

export type NavigationTab = 'home' | 'cfds' | 'options' | 'portfolio';