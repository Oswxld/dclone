import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppLoader } from '../components/layout/AppLoader';
import { createPaperRealtimeController } from '../utils/paperBalanceRealtimeController.mjs';
import {
  applySimEvent, balancesFromRows, cents, getSimClientId, loadSimQueue,
  reconcileSimQueue, saveSimQueue, simModes, startingBalances,
} from '../utils/simBalanceSync';
import type { NewSimBalanceEvent, StoredSimQueue } from '../utils/simBalanceSync';

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
export type AccountKey = 'cfdsUsd' | 'optionsUsd' | 'walletUsd' | 'walletUsdt' | 'p2pUsd';
export type BalanceSyncTargets = Partial<Record<AccountMode, number>>;
export interface AccountContextType {
  activeMode: AccountMode;
  setActiveMode: (mode: AccountMode) => void;
  balances: AccountBalances;
  realBalances: AccountBalances;
  demoBalances: AccountBalances;
  updateOptionsBalance: (deltaOrValue: number, isAbsolute?: boolean) => boolean;
  adminOverrideBalances: (realUpdates: Partial<AccountBalances>, demoUpdates?: Partial<AccountBalances>) => BalanceSyncTargets;
  transferFunds: (fromKey: AccountKey, toKey: AccountKey, amount: number) => boolean;
  queueTransferFunds: (fromKey: AccountKey, toKey: AccountKey, amount: number) => BalanceSyncTargets;
  confirmBalanceChanges: (targets: BalanceSyncTargets) => Promise<void>;
  refreshBalances: () => Promise<void>;
  flushPending: () => void;
  syncError: string | null;
  pendingCount: number;
  winAccuracy: number;
  setWinAccuracy: (accuracy: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);
type Queues = Record<AccountMode, StoredSimQueue>;
type ModesBalances = Record<AccountMode, AccountBalances>;

export const AccountProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [activeMode, setActiveMode] = useState<AccountMode>('real');
  const [winAccuracy, setWinAccuracy] = useState(60);
  const [realBalances, setRealBalances] = useState(startingBalances);
  const [demoBalances, setDemoBalances] = useState(startingBalances);
  const balancesRef = useRef<ModesBalances>({ real: startingBalances(), demo: startingBalances() });
  const queuesRef = useRef<Queues | null>(null);
  const clientIdRef = useRef('');
  const readyRef = useRef(false);
  const flushTasksRef = useRef<Record<AccountMode, Promise<void> | null>>({ real: null, demo: null });
  const refreshTaskRef = useRef<Promise<void> | null>(null);
  const snapshotPausedRef = useRef(false);
  const realtimeRef = useRef<ReturnType<typeof createPaperRealtimeController> | null>(null);
  const notifyActivity = useCallback(() => {
    const queues = queuesRef.current;
    if (!queues) return;
    realtimeRef.current?.activity(
      queues.real.events.length + queues.demo.events.length,
      Number(!!flushTasksRef.current.real) + Number(!!flushTasksRef.current.demo) + Number(!!refreshTaskRef.current),
    );
  }, []);
  const [ready, setReady] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [retry, setRetry] = useState(0);

  const publish = useCallback((mode: AccountMode, next: AccountBalances) => {
    balancesRef.current[mode] = next;
    if (mode === 'real') setRealBalances(next);
    else setDemoBalances(next);
  }, []);

  const updatePendingCount = useCallback(() => {
    const queues = queuesRef.current;
    setPendingCount(queues ? queues.real.events.length + queues.demo.events.length : 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    readyRef.current = false;
    queuesRef.current = null;
    flushTasksRef.current = { real: null, demo: null };
    refreshTaskRef.current = null;
    snapshotPausedRef.current = false;
    setReady(false);
    setInitialError(null);
    const initialize = async () => {
      try {
        const clientId = getSimClientId(userId);
        const localReal = loadSimQueue(userId, 'real', clientId);
        const localDemo = loadSimQueue(userId, 'demo', clientId);
        const { data, error } = await supabase.rpc('dclone_sim_snapshot', { p_client_id: clientId });
        if (error) throw error;
        if (cancelled) return;
        const snapshot = data as {
          balances: unknown; cursors: Record<AccountMode, number>;
        };
        const resolved: Queues = {
          real: reconcileSimQueue(localReal, Number(snapshot.cursors?.real)),
          demo: reconcileSimQueue(localDemo, Number(snapshot.cursors?.demo)),
        };
        const calculated: ModesBalances = {
          real: balancesFromRows(snapshot.balances, 'real'),
          demo: balancesFromRows(snapshot.balances, 'demo'),
        };
        for (const mode of simModes) {
          for (const event of resolved[mode].events) calculated[mode] = applySimEvent(calculated[mode], event);
        }
        // Keep unacknowledged changes on disk, excluding those the server confirms.
        saveSimQueue(userId, 'real', resolved.real);
        saveSimQueue(userId, 'demo', resolved.demo);
        clientIdRef.current = clientId;
        queuesRef.current = resolved;
        publish('real', calculated.real);
        publish('demo', calculated.demo);
        readyRef.current = true;
        setReady(true);
        setSyncError(null);
        updatePendingCount();
        // Supabase JS supplies the current authenticated user's Realtime token.
        // Listen to INSERT/UPDATE only, scoped by owner; RLS is the authorization boundary.
        const controller = createPaperRealtimeController({
          open: async ({ subscribed, changed, disconnected }) => {
            const { data, error } = await supabase.auth.getSession();
            if (cancelled || error || data.session?.user.id !== userId) throw new Error('Paper account session changed');
            const channel = supabase.channel('paper-balances:' + crypto.randomUUID());
            const filter = { schema: 'public', table: 'dclone_sim_account_balances', filter: 'user_id=eq.' + userId };
            channel.on('postgres_changes', { ...filter, event: 'INSERT' }, changed);
            channel.on('postgres_changes', { ...filter, event: 'UPDATE' }, changed);
            channel.subscribe(status => {
              if (status === 'SUBSCRIBED') subscribed();
              else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) disconnected();
            });
            return channel;
          },
          close: async channel => {
            const status = await supabase.removeChannel(channel);
            if (status !== 'ok') throw new Error('Paper balance subscription removal not confirmed');
          },
          read: async () => {
            const { data, error } = await supabase.from('dclone_sim_account_balances')
              .select('user_id, account_mode, account_type, balance_cents').eq('user_id', userId);
            if (error) throw error;
            if (!data || data.some(row => row.user_id !== userId)) throw new Error('Unexpected paper balance owner');
            const rows = data.map(row => ({ mode: row.account_mode, account: row.account_type, cents: row.balance_cents }));
            return { real: balancesFromRows(rows, 'real'), demo: balancesFromRows(rows, 'demo') };
          },
          publish: snapshot => {
            if (cancelled || realtimeRef.current !== controller || !readyRef.current ||
                queuesRef.current?.real.events.length || queuesRef.current?.demo.events.length ||
                flushTasksRef.current.real || flushTasksRef.current.demo || refreshTaskRef.current) return;
            publish('real', snapshot.real);
            publish('demo', snapshot.demo);
            setSyncError(null);
          },
          onError: error => {
            if (!cancelled) setSyncError('Paper balance Realtime: ' + (error instanceof Error ? error.message : String(error)));
          },
        });
        realtimeRef.current = controller;
        controller.start(resolved.real.events.length + resolved.demo.events.length);
      } catch (error) {
        if (!cancelled) setInitialError(error instanceof Error ? error.message : 'Unable to initialize balances');
      }
    };
    // One active tab per browser profile: localStorage is not a transactional multi-tab queue.
    // The Web Locks API prevents two tabs issuing the same client sequence.
    let releaseLock: (() => void) | null = null;
    if (navigator.locks?.request) {
      void navigator.locks.request('dclone-sim-wallet:' + userId, { mode: 'exclusive', ifAvailable: true }, async lock => {
        if (!lock) {
          if (!cancelled) setInitialError('This simulated account is open in another tab. Close that tab and try again.');
          return;
        }
        if (cancelled) return;
        await initialize();
        await new Promise<void>(resolve => {
          releaseLock = resolve;
          if (cancelled) resolve();
        });
      }).catch(error => {
        if (!cancelled) setInitialError(error instanceof Error ? error.message : 'Unable to lock the account');
      });
    } else {
      // Older browsers lack Web Locks. Use only one tab on those browsers.
      void initialize();
    }
    return () => {
      cancelled = true;
      readyRef.current = false;
      const controller = realtimeRef.current;
      realtimeRef.current = null;
      void controller?.stop();
      releaseLock?.();
    };
  }, [userId, retry, publish, updatePendingCount]);

  const queueEvents = useCallback((mode: AccountMode, events: NewSimBalanceEvent[]): number => {
    const queues = queuesRef.current;
    if (!readyRef.current || !queues) throw new Error('Balances are not ready');
    const current = queues[mode];
    if (current.events.length + events.length > 5000) {
      throw new Error('Too many unsent changes. Please reconnect before continuing.');
    }
    let projected = balancesRef.current[mode];
    const sequenced = events.map((event, index) => ({
      ...event, seq: current.lastIssued + index + 1,
    }));
    for (const event of sequenced) projected = applySimEvent(projected, event);
    if (!sequenced.length) return current.lastIssued;
    const nextQueue: StoredSimQueue = {
      ...current,
      lastIssued: sequenced[sequenced.length - 1].seq,
      events: [...current.events, ...sequenced],
    };
    // Persist all changes in this mode together BEFORE publishing React state.
    saveSimQueue(userId, mode, nextQueue);
    queues[mode] = nextQueue;
    // Invalidate incoming callbacks synchronously, before publishing local work.
    notifyActivity();
    publish(mode, projected);
    updatePendingCount();
    return nextQueue.lastIssued;
  }, [userId, publish, updatePendingCount, notifyActivity]);

  const record = useCallback((mode: AccountMode, event: NewSimBalanceEvent): boolean => {
    try {
      queueEvents(mode, [event]);
      return true;
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to record balance adjustment');
      return false;
    }
  }, [queueEvents]);

  const flushMode = useCallback((mode: AccountMode): Promise<void> => {
    if (flushTasksRef.current[mode]) return flushTasksRef.current[mode]!;
    if (!readyRef.current || !queuesRef.current || snapshotPausedRef.current) return Promise.resolve();
    const controller = realtimeRef.current;
    if (!controller) return Promise.reject(new Error('Paper balance synchronization is not initialized'));
    const batch = queuesRef.current[mode].events.slice(0, 500);
    if (!batch.length) return Promise.resolve();

    const task = (async () => {
      try {
        await controller.waitWritable();
        if (!readyRef.current || realtimeRef.current !== controller) throw new Error('Account session changed');
        const { data, error } = await supabase.rpc('dclone_sim_apply_batch', {
          p_client_id: clientIdRef.current, p_mode: mode, p_events: batch,
        });
        if (error) throw error;
        if (!readyRef.current || !queuesRef.current || realtimeRef.current !== controller) throw new Error('Account session changed');
        const response = data as { last_sequence: number; balances: unknown };
        const confirmed = Number(response.last_sequence);
        if (!Number.isSafeInteger(confirmed) || confirmed < batch[batch.length - 1].seq) {
          throw new Error('Database did not acknowledge the complete batch');
        }
        const updatedQueue = reconcileSimQueue(queuesRef.current[mode], confirmed);
        const confirmedBalances = balancesFromRows(response.balances, mode);
        const displayBalances = updatedQueue.events.reduce(applySimEvent, confirmedBalances);
        saveSimQueue(userId, mode, updatedQueue);
        queuesRef.current[mode] = updatedQueue;
        publish(mode, displayBalances);
        updatePendingCount();
        setSyncError(null);
      } catch (error) {
        if (readyRef.current && realtimeRef.current === controller) {
          setSyncError('Balance sync pending: ' + (error instanceof Error ? error.message : String(error)));
        }
        throw error;
      }
    })();
    flushTasksRef.current[mode] = task;
    notifyActivity();
    const clear = () => {
      if (flushTasksRef.current[mode] === task) {
        flushTasksRef.current[mode] = null;
        notifyActivity();
      }
    };
    void task.then(clear, clear);
    return task;
  }, [userId, publish, updatePendingCount, notifyActivity]);

  const flushPending = useCallback(() => {
    // Background syncing never produces unhandled promise rejections.
    void flushMode('real').catch(() => undefined);
    void flushMode('demo').catch(() => undefined);
  }, [flushMode]);

  const refreshBalances = useCallback(async (): Promise<void> => {
    if (!readyRef.current || !queuesRef.current) throw new Error('Balances are not ready yet');
    if (refreshTaskRef.current) return refreshTaskRef.current;
    const controller = realtimeRef.current;
    if (!controller) throw new Error('Paper balance synchronization is not initialized');

    const task = (async () => {
      // Let the caller register the refresh as in-flight and detach first.
      await Promise.resolve();
      // First make a best-effort attempt to save pending work; even if offline,
      // the snapshot can be safely combined with the unsent local queue.
      await Promise.allSettled(simModes.map(mode => flushMode(mode)));
      // Pause new batch sends while reading the snapshot, but not local trading.
      snapshotPausedRef.current = true;
      await Promise.allSettled(simModes.map(mode => flushTasksRef.current[mode]).filter(
        (promise): promise is Promise<void> => promise !== null,
      ));
      await controller.waitWritable();
      if (!readyRef.current || realtimeRef.current !== controller) throw new Error('Account session changed');
      const { data, error } = await supabase.rpc('dclone_sim_snapshot', {
        p_client_id: clientIdRef.current,
      });
      if (error) throw error;
      if (!readyRef.current || !queuesRef.current || realtimeRef.current !== controller) throw new Error('Account session changed');

      const snapshot = data as { balances: unknown; cursors: Record<AccountMode, number> };
      // Use the CURRENT queues: the bot may have appended changes during the fetch.
      const current = queuesRef.current;
      const updatedQueues: Queues = {
        real: reconcileSimQueue(current.real, Number(snapshot.cursors?.real)),
        demo: reconcileSimQueue(current.demo, Number(snapshot.cursors?.demo)),
      };
      const updatedBalances: ModesBalances = {
        real: updatedQueues.real.events.reduce(applySimEvent, balancesFromRows(snapshot.balances, 'real')),
        demo: updatedQueues.demo.events.reduce(applySimEvent, balancesFromRows(snapshot.balances, 'demo')),
      };
      saveSimQueue(userId, 'real', updatedQueues.real);
      saveSimQueue(userId, 'demo', updatedQueues.demo);
      queuesRef.current = updatedQueues;
      publish('real', updatedBalances.real);
      publish('demo', updatedBalances.demo);
      updatePendingCount();
      if (!updatedQueues.real.events.length && !updatedQueues.demo.events.length) setSyncError(null);
    })();

    refreshTaskRef.current = task;
    notifyActivity();
    try {
      await task;
    } finally {
      if (refreshTaskRef.current === task) {
        refreshTaskRef.current = null;
        snapshotPausedRef.current = false;
        notifyActivity();
      }
    }
  }, [flushMode, userId, publish, updatePendingCount, notifyActivity]);

  const confirmBalanceChanges = useCallback(async (targets: BalanceSyncTargets): Promise<void> => {
    const waitForMode = async (mode: AccountMode, target: number) => {
      if (!Number.isSafeInteger(target) || target < 0) throw new Error('Invalid confirmation target');
      for (let attempt = 0; attempt < 100; attempt++) {
        if (!readyRef.current || !queuesRef.current) throw new Error('Session changed during balance sync');
        if (!queuesRef.current[mode].events.some(event => event.seq <= target)) return;
        // Never spin on the queue while another snapshot is holding the sync gate.
        if (refreshTaskRef.current) await refreshTaskRef.current;
        await flushMode(mode);
      }
      throw new Error('Balance updates are still pending; please retry confirmation.');
    };
    await Promise.all(simModes.map(mode =>
      targets[mode] === undefined ? Promise.resolve() : waitForMode(mode, targets[mode]!),
    ));
    // A fresh database snapshot, not just the batch response, confirms the UI.
    await refreshBalances();
  }, [flushMode, refreshBalances]);

  useEffect(() => {
    if (!ready) return;
    const interval = window.setInterval(flushPending, 1000);
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') flushPending(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    flushPending(); // Recover the durable queue immediately after login.
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [ready, flushPending]);

  const updateOptionsBalance = (deltaOrValue: number, isAbsolute = false): boolean => {
    try {
      const value = cents(deltaOrValue);
      return record(activeMode, isAbsolute
        ? { kind: 'set', account: 'optionsUsd', cents: value }
        : { kind: 'adjust', account: 'optionsUsd', cents: value });
    } catch { return false; }
  };

  const transferFunds = (fromKey: AccountKey, toKey: AccountKey, amount: number): boolean => {
    if (fromKey === toKey || amount <= 0) return false;
    try {
      return record(activeMode, { kind: 'transfer', from: fromKey, to: toKey, amount_cents: cents(amount) });
    } catch { return false; }
  };

  const queueTransferFunds = (fromKey: AccountKey, toKey: AccountKey, amount: number): BalanceSyncTargets => {
    if (fromKey === toKey || !Number.isFinite(amount) || amount <= 0) throw new Error('Invalid transfer');
    const mode = activeMode;
    const seq = queueEvents(mode, [{
      kind: 'transfer', from: fromKey, to: toKey, amount_cents: cents(amount),
    }]);
    return { [mode]: seq };
  };

  const adminOverrideBalances = (
    realUpdates: Partial<AccountBalances>,
    demoUpdates: Partial<AccountBalances> = {},
  ): BalanceSyncTargets => {
    const targets: BalanceSyncTargets = {};
    const accounts: AccountKey[] = ['optionsUsd', 'cfdsUsd', 'walletUsd', 'walletUsdt', 'p2pUsd'];
    // Validate BOTH forms before queueing anything, so invalid inputs cannot partially apply.
    const updatesByMode: Record<AccountMode, NewSimBalanceEvent[]> = {
      real: [],
      demo: [],
    };
    for (const [mode, updates] of [['real', realUpdates], ['demo', demoUpdates]] as const) {
      for (const account of accounts) {
        const value = updates[account];
        if (value !== undefined) {
          const amount = cents(value);
          if (amount < 0) throw new Error('Simulated balance must be non-negative');
          updatesByMode[mode].push({ kind: 'set', account, cents: amount });
        }
      }
    }
    for (const mode of simModes) {
      if (updatesByMode[mode].length) {
        targets[mode] = queueEvents(mode, updatesByMode[mode]);
      }
    }
    return targets;
  };

  const balances = activeMode === 'real' ? realBalances : demoBalances;

  if (!ready) {
    if (!initialError) return <AppLoader label="Loading simulated account balances" />;
    return (
      <div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div>
          <p>Could not load your simulated balances. No pending changes were discarded.</p>
          <p>{initialError}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <AccountContext.Provider value={{
      activeMode, setActiveMode, balances, realBalances, demoBalances,
      updateOptionsBalance, adminOverrideBalances, transferFunds, queueTransferFunds,
      confirmBalanceChanges, refreshBalances, flushPending,
      syncError, pendingCount, winAccuracy, setWinAccuracy,
    }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within an AccountProvider');
  return ctx;
};
