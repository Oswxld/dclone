type BalanceListener = (balance: number) => void;

const INITIAL_BALANCE = 9901.92;
let listeners: BalanceListener[] = [];

const getStoredBalance = (): number => {
  const saved = localStorage.getItem('deriv_demo_balance');
  return saved ? parseFloat(saved) : INITIAL_BALANCE;
};

let currentBalance = getStoredBalance();

export const balanceStore = {
  get: () => currentBalance,
  set: (val: number) => {
    currentBalance = parseFloat(val.toFixed(2));
    localStorage.setItem('deriv_demo_balance', currentBalance.toFixed(2));
    listeners.forEach((fn) => fn(currentBalance));
  },
  update: (delta: number) => {
    currentBalance = parseFloat((currentBalance + delta).toFixed(2));
    localStorage.setItem('deriv_demo_balance', currentBalance.toFixed(2));
    listeners.forEach((fn) => fn(currentBalance));
  },
  reset: () => {
    currentBalance = INITIAL_BALANCE;
    localStorage.setItem('deriv_demo_balance', INITIAL_BALANCE.toFixed(2));
    listeners.forEach((fn) => fn(currentBalance));
  },
  subscribe: (fn: BalanceListener) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
};