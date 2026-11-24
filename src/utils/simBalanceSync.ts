import type { AccountBalances, AccountKey, AccountMode } from '../context/AccountContext';

export type NewSimBalanceEvent =
  | { kind: 'adjust'; account: AccountKey; cents: number }
  | { kind: 'set'; account: AccountKey; cents: number }
  | { kind: 'transfer'; from: AccountKey; to: AccountKey; amount_cents: number };

export type SimBalanceEvent = NewSimBalanceEvent & { seq: number };

export interface StoredSimQueue {
  clientId: string;
  lastIssued: number;
  events: SimBalanceEvent[];
}

const types: AccountKey[] = ['optionsUsd', 'cfdsUsd', 'walletUsd', 'walletUsdt', 'p2pUsd'];
export const simAccountKeys = types;
export const simModes: AccountMode[] = ['real', 'demo'];

export const cents = (amount: number): number => {
  if (!Number.isFinite(amount) || Math.abs(amount) > 10000000000) {
    throw new Error('Invalid simulated amount');
  }
  return Math.round(amount * 100);
};

export const startingBalances = (): AccountBalances => ({
  currency: 'USD',
  optionsUsd: 0,
  cfdsUsd: 0,
  walletUsd: 0,
  walletUsdt: 0,
  p2pUsd: 0,
  totalUsd: 0,
  lastUpdated: 'just now',
});

const withTotal = (value: AccountBalances): AccountBalances => ({
  ...value,
  totalUsd: (cents(value.optionsUsd) + cents(value.cfdsUsd) + cents(value.walletUsd) + cents(value.p2pUsd)) / 100,
  lastUpdated: 'just now',
});

export const applySimEvent = (initial: AccountBalances, event: SimBalanceEvent): AccountBalances => {
  const updated = { ...initial };
  if (event.kind === 'transfer') {
    if (event.from === event.to || !Number.isSafeInteger(event.amount_cents) || event.amount_cents <= 0) {
      throw new Error('Invalid simulated transfer');
    }
    if (cents(updated[event.from]) < event.amount_cents) throw new Error('Insufficient simulated balance');
    updated[event.from] = (cents(updated[event.from]) - event.amount_cents) / 100;
    updated[event.to] = (cents(updated[event.to]) + event.amount_cents) / 100;
  } else {
    if (!Number.isSafeInteger(event.cents)) throw new Error('Invalid simulated adjustment');
    const next = event.kind === 'set' ? event.cents : cents(updated[event.account]) + event.cents;
    if (next < 0) throw new Error('Insufficient simulated balance');
    updated[event.account] = next / 100;
  }
  return withTotal(updated);
};

const queueKey = (userId: string, mode: AccountMode) => 'dclone_sim_queue_v1:' + userId + ':' + mode;
const idKey = (userId: string) => 'dclone_sim_client_v1:' + userId;

export const getSimClientId = (userId: string): string => {
  let id = localStorage.getItem(idKey(userId));
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(idKey(userId), id);
  }
  return id;
};

export const loadSimQueue = (userId: string, mode: AccountMode, clientId: string): StoredSimQueue => {
  const raw = localStorage.getItem(queueKey(userId, mode));
  if (!raw) return { clientId, lastIssued: 0, events: [] };
  const parsed: StoredSimQueue = JSON.parse(raw);
  if (parsed.clientId !== clientId || !Array.isArray(parsed.events)
      || !Number.isSafeInteger(parsed.lastIssued) || parsed.lastIssued < 0) {
    throw new Error('Saved queue could not be verified. No changes were discarded.');
  }
  return parsed;
};

export const saveSimQueue = (userId: string, mode: AccountMode, queue: StoredSimQueue): void => {
  // This write must succeed BEFORE displaying any change to the balance.
  localStorage.setItem(queueKey(userId, mode), JSON.stringify(queue));
};

export const reconcileSimQueue = (queue: StoredSimQueue, confirmedSeq: number): StoredSimQueue => {
  if (!Number.isSafeInteger(confirmedSeq) || confirmedSeq < 0) throw new Error('Invalid sync cursor');
  const outstanding = queue.events.filter(event => event.seq > confirmedSeq);
  let expected = confirmedSeq + 1;
  for (const event of outstanding) {
    if (event.seq !== expected++) throw new Error('Local pending changes are out of sequence');
  }
  if (queue.lastIssued > Math.max(confirmedSeq, outstanding.at(-1)?.seq ?? 0)) {
    throw new Error('Unrecoverable gap in pending simulated changes');
  }
  return { ...queue, events: outstanding, lastIssued: Math.max(queue.lastIssued, confirmedSeq) };
};

export const balancesFromRows = (
  rows: unknown, mode: AccountMode
): AccountBalances => {
  if (!Array.isArray(rows)) throw new Error('Database did not return simulated account balances');
  const value = startingBalances();
  const seen = new Set<AccountKey>();
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const item = row as { mode?: string; account?: string; cents?: unknown };
    if (item.mode && item.mode !== mode) continue;
    if (!types.includes(item.account as AccountKey)) continue;
    const amount = Number(item.cents);
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Invalid balance returned by database');
    const key = item.account as AccountKey;
    value[key] = amount / 100;
    seen.add(key);
  }
  if (seen.size !== types.length) throw new Error('Incomplete simulated account snapshot');
  return withTotal(value);
};
