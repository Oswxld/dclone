import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import styles from './BotWorkspace.module.css';
import { BotHeader } from './BotHeader';
import { BotBottomNav, type BotTab } from './BotBottomNav';
import { initDerivBlocks, DerivTheme } from './blocklyConfig';
import { useAccount } from '../../context/AccountContext';

type BotWorkspaceProps = {
  onBack: () => void;
};

interface TransactionItem {
  id: string;
  market: string;
  type: string;
  entrySpot: number;
  exitSpot: number;
  stake: number;
  profit: number;
  isWin: boolean;
  isPending?: boolean;
}

interface JournalLog {
  id: string;
  type: 'buy' | 'profit' | 'loss';
  contractId?: string;
  amount?: number;
  timestamp: string;
}

interface PromptState {
  isOpen: boolean;
  title: string;
  defaultValue: string;
  onConfirm: (val: string) => void;
}

// ------------------------------------------------------------------
// DYNAMIC SVG COMPONENTS
// ------------------------------------------------------------------

const MarketIcon = ({ market, className }: { market: string; className?: string }) => {
  const match = market.match(/Volatility (\d+) (?:(\(1s\)) )?Index/i);
  const num = match ? match[1] : '100';
  const has1s = match ? !!match[2] : market.includes('1s');
  const boxWidth = num.length > 2 ? "20" : "17";
  const badgeCx = num.length > 2 ? "25" : "22";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className} role="img">
      <path fill="#0AA0B0" d="M22.5 13H24v9h-1.5v10h-1V22H20v-9h1.5v-2h1zM30 11v7h-1.5v4h-1v-4H26v-7zM16.5 20v-4h-1v4H14v8h1.5v2h1v-2H18v-8zM10.5 15H12v6h-1.5v7h-1v-7H8v-6h1.5v-2h1zM4.5 19H6v4H4.5v2h-1v-2H2v-4h1.5v-2h1z"></path>
      <rect x="0" y="2" width={boxWidth} height="13" rx="2" fill="#414652" />
      <text x={Number(boxWidth)/2} y="12" fill="#ffffff" fontSize="10" fontWeight="700" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">{num}</text>
      {has1s && (
        <g>
          <circle cx={badgeCx} cy="6" r="6" fill="#FF444F" />
          <text x={badgeCx} y="8" fill="#ffffff" fontSize="6.5" fontWeight="700" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">1s</text>
        </g>
      )}
    </svg>
  );
};

const ActionIcon = ({ action, className }: { action: string; className?: string }) => {
  if (['Matches', 'Differs'].includes(action)) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="24" height="24" className={className} role="img">
        <path fill="#FF444F" d="m10.01 8.457 5.654 5.658a2.667 2.667 0 0 1 0 3.77l-5.656 5.658-.008-.01a2.65 2.65 0 0 1 0-3.752l2.445-2.448-7.111.016v-2.682h7.111L10 12.22a2.65 2.65 0 0 1 0-3.753zm11.98 0 .01.01a2.65 2.65 0 0 1 0 3.752l-2.445 2.448 7.112-.016v2.682h-7.112l2.447 2.447a2.65 2.65 0 0 1 0 3.753l-.01.01-4.658-4.659.997-.999a2.667 2.667 0 0 0 0-3.77l-.997-.999z"></path>
        <path fill="#85ACB0" d="M17.334 21.333v5.334h-2.667v-5.334zm0-16v5.334h-2.667V5.333z"></path>
      </svg>
    );
  }
  
  if (['Even', 'Odd'].includes(action)) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="24" height="24" className={className} role="img">
        <path fill="#85ACB0" d="M13.334 18.667v8h-8v-8zM26.667 5.333v8h-8v-8z"></path>
        <path fill="#FF444F" d="M26.667 18.667v8h-8v-8zM13.334 5.333v8h-8v-8z"></path>
      </svg>
    );
  }

  if (['Over', 'Under'].includes(action)) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="24" height="24" className={className} role="img">
        <path fill="#FF444F" d="m12.586 22.667-2.654 2.666H6.115l2.667-2.666zM24 6.667a2.667 2.667 0 0 1 2.667 2.666v8h-.013A2.653 2.653 0 0 1 24 14.68v-3.467l-8 8.027v-3.792l6.115-6.115h-3.461A2.653 2.653 0 0 1 16 6.68v-.013z"></path>
        <path fill="#85ACB0" d="M26.667 20H5.334v2.667h21.333z"></path>
      </svg>
    );
  }
  
  const isRise = action === 'Rise';
  return (
    <span style={{ color: isRise ? '#00a8a8' : '#ff444f', fontWeight: 700, fontSize: '18px' }} className={className}>
      {isRise ? '↗' : '↘'}
    </span>
  );
};

const pickRandom = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

const getGMTTimestamp = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toISOString().split('T')[1].split('.')[0];
  return `${date} | ${time} GMT`;
};

// ------------------------------------------------------------------
// MAIN WORKSPACE COMPONENT
// ------------------------------------------------------------------

export const BotWorkspace = ({ onBack }: BotWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState<BotTab>('builder');
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const { balances, updateOptionsBalance, activeMode } = useAccount();

  // Simulation Runner State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const isSimulatingRef = useRef<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'summary' | 'transactions' | 'journal'>('summary');
  const [simPhase, setSimPhase] = useState<'IDLE' | 'BUYING' | 'BOUGHT' | 'WON' | 'LOST'>('IDLE');
  
  const [currentDuration, setCurrentDuration] = useState<number>(1);

  // Aggregated Metrics
  const [totalStake, setTotalStake] = useState<number>(0);
  const [totalPayout, setTotalPayout] = useState<number>(0);
  const [numberOfRuns, setNumberOfRuns] = useState<number>(0);
  const [contractsLost, setContractsLost] = useState<number>(0);
  const [contractsWon, setContractsWon] = useState<number>(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [journalLogs, setJournalLogs] = useState<JournalLog[]>([]);

  useEffect(() => {
    setTotalStake(0);
    setTotalPayout(0);
    setNumberOfRuns(0);
    setContractsLost(0);
    setContractsWon(0);
    setTotalProfitLoss(0);
    setTransactions([]);
    setJournalLogs([]);
    setSimPhase('IDLE');
    setIsSimulating(false);
    isSimulatingRef.current = false;
  }, [activeMode]);

  const [activeContract, setActiveContract] = useState<{
    market: string;
    action: string;
    stake: number;
    potentialPayout: number;
    currentValue: number;
    profit: number;
    tickIndex: number;
  }>({
    market: 'Volatility 100 (1s) Index',
    action: 'Rise',
    stake: 1.0,
    potentialPayout: 1.9,
    currentValue: 1.85,
    profit: 0.85,
    tickIndex: 0,
  });

  const [promptState, setPromptState] = useState<PromptState>({
    isOpen: false,
    title: 'Change value:',
    defaultValue: '1',
    onConfirm: () => {},
  });
  const [promptValue, setPromptValue] = useState('');

  useEffect(() => {
    Blockly.dialog.setPrompt((message, defaultValue, callback) => {
      setPromptValue(defaultValue);
      setPromptState({
        isOpen: true,
        title: message,
        defaultValue,
        onConfirm: (val) => callback(val),
      });
    });
  }, []);

  const handlePromptCancel = () => {
    promptState.onConfirm('');
    setPromptState((prev) => ({ ...prev, isOpen: false }));
  };

  const handlePromptConfirm = () => {
    promptState.onConfirm(promptValue);
    setPromptState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleResetMetrics = () => {
    setTotalStake(0);
    setTotalPayout(0);
    setNumberOfRuns(0);
    setContractsLost(0);
    setContractsWon(0);
    setTotalProfitLoss(0);
    setTransactions([]);
    setJournalLogs([]);
    if (activeMode === 'demo') {
      updateOptionsBalance(10000.0, true);
    }
  };

  const handleToggleRun = () => {
    if (isSimulating) {
      isSimulatingRef.current = false;
      setIsSimulating(false);
      setSimPhase('IDLE');
    } else {
      isSimulatingRef.current = true;
      setIsSimulating(true);
      setDrawerOpen(true);
      runTradeCycle();
    }
  };

  const runTradeCycle = async () => {
    if (!isSimulatingRef.current || !workspaceRef.current) return;

    const ws = workspaceRef.current;
    const typeBlock = ws.getAllBlocks(false).find((b) => b.type === 'trade_step_type');
    const optionsBlock = ws.getAllBlocks(false).find((b) => b.type === 'trade_options_block');
    const purchaseBlock = ws.getAllBlocks(false).find((b) => b.type === 'purchase_action_block');
    const marketBlock = ws.getAllBlocks(false).find((b) => b.type === 'deriv_market_clean');

    const category = typeBlock?.getFieldValue('TRADE_CATEGORY') || 'Up/Down';
    const tradeType = typeBlock?.getFieldValue('TRADE_TYPE') || 'RISEFALL';
    
    const assetCode = marketBlock?.getFieldValue('ASSET') || '1HZ100V';
    let activeMarket = 'Volatility 100 (1s) Index';
    if (assetCode === 'R_100') activeMarket = 'Volatility 100 Index';
    if (assetCode === 'R_75') activeMarket = 'Volatility 75 Index';
    if (assetCode === '1HZ75V') activeMarket = 'Volatility 75 (1s) Index';
    if (assetCode === '1HZ50V') activeMarket = 'Volatility 50 (1s) Index';
    if (assetCode === '1HZ25V') activeMarket = 'Volatility 25 (1s) Index';
    if (assetCode === '1HZ10V') activeMarket = 'Volatility 10 (1s) Index';

    const stake = parseFloat(optionsBlock?.getFieldValue('STAKE') || '1.00');
    const duration = parseInt(optionsBlock?.getFieldValue('DURATION') || '1', 10);
    const prediction = parseInt(optionsBlock?.getFieldValue('PREDICTION') || '1', 10);
    
    setCurrentDuration(duration); 

    const rawPurchase = purchaseBlock?.getFieldValue('PURCHASE_LIST') 
                     || purchaseBlock?.getFieldValue('PURCHASE_TYPE') 
                     || purchaseBlock?.getFieldValue('PURCHASE');

    let actionLabel = 'Rise';
    if (category === 'Digits') {
      if (tradeType === 'MATCHDIFF') {
        actionLabel = (rawPurchase === 'DIGITDIFF' || rawPurchase === 'Differs') ? 'Differs' : 'Matches';
      } else if (tradeType === 'EVENODD') {
        actionLabel = (rawPurchase === 'DIGITODD' || rawPurchase === 'Odd') ? 'Odd' : 'Even';
      } else if (tradeType === 'OVERUNDER') {
        actionLabel = (rawPurchase === 'DIGITUNDER' || rawPurchase === 'Under') ? 'Under' : 'Over';
      }
    } else {
      actionLabel = (rawPurchase === 'PUT' || rawPurchase === 'Fall') ? 'Fall' : 'Rise';
    }

    let payoutRate = 1.95;
    if (category === 'Digits') {
      if (tradeType === 'MATCHDIFF') {
        payoutRate = actionLabel === 'Matches' ? 9.09 : 1.09;
      } else if (tradeType === 'EVENODD') {
        payoutRate = 1.96;
      } else if (tradeType === 'OVERUNDER') {
        const safeOverDivider = Math.max(1, 9 - prediction);
        const safeUnderDivider = Math.max(1, prediction);
        payoutRate = actionLabel === 'Over' ? (10 / safeOverDivider) * 0.95 : (10 / safeUnderDivider) * 0.95;
      }
    }
    const potentialPayout = parseFloat((stake * payoutRate).toFixed(2));

    setSimPhase('BUYING');
    await new Promise((r) => setTimeout(r, 800));
    if (!isSimulatingRef.current) return;

    updateOptionsBalance(-stake);
    setTotalStake((prev) => parseFloat((prev + stake).toFixed(2)));
    setNumberOfRuns((prev) => prev + 1);

    setSimPhase('BOUGHT');
    const startSpot = 868.0 + Math.random() * 2;
    let currentSpot = startSpot;
    const currentTxId = Date.now().toString();
    const fakeContractId = Math.floor(27017000000 + Math.random() * 999999).toString();

    // Log the Buy Event in Journal
    setJournalLogs((prev) => [
      {
        id: Date.now().toString() + '-buy',
        type: 'buy',
        contractId: fakeContractId,
        timestamp: getGMTTimestamp(),
      },
      ...prev,
    ]);

    setTransactions((prev) => [
      {
        id: currentTxId,
        market: activeMarket,
        type: actionLabel,
        entrySpot: parseFloat(startSpot.toFixed(2)),
        exitSpot: 0,
        stake,
        profit: 0,
        isWin: false,
        isPending: true,
      },
      ...prev,
    ]);

    setActiveContract({
      market: activeMarket,
      action: actionLabel,
      stake,
      potentialPayout,
      currentValue: parseFloat((stake * 0.9).toFixed(2)),
      profit: parseFloat((-stake * 0.1).toFixed(2)),
      tickIndex: 0,
    });

    for (let t = 1; t <= duration; t++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (!isSimulatingRef.current) return;

      let nextSpot = currentSpot + (Math.random() - 0.49) * 0.4;

      if (t === duration) {
        const forceWin = Math.random() < 0.60;
        
        if (category === 'Digits') {
          let winningDigits: number[] = [];
          let losingDigits: number[] = [];
          const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          
          if (tradeType === 'MATCHDIFF') {
            if (actionLabel === 'Matches') {
              winningDigits = [prediction];
              losingDigits = allDigits.filter(d => d !== prediction);
            } else { 
              winningDigits = allDigits.filter(d => d !== prediction);
              losingDigits = [prediction];
            }
          } else if (tradeType === 'EVENODD') {
            const evens = [0, 2, 4, 6, 8];
            const odds = [1, 3, 5, 7, 9];
            if (actionLabel === 'Even') {
              winningDigits = evens;
              losingDigits = odds;
            } else { 
              winningDigits = odds;
              losingDigits = evens;
            }
          } else if (tradeType === 'OVERUNDER') {
            if (actionLabel === 'Over') {
              winningDigits = allDigits.filter(d => d > prediction);
              losingDigits = allDigits.filter(d => d <= prediction);
            } else { 
              winningDigits = allDigits.filter(d => d < prediction);
              losingDigits = allDigits.filter(d => d >= prediction);
            }
          }

          const finalDigit = forceWin ? pickRandom(winningDigits) : pickRandom(losingDigits);
          const spotStr = nextSpot.toFixed(2);
          const forcedSpotStr = spotStr.substring(0, spotStr.length - 1) + finalDigit;
          nextSpot = parseFloat(forcedSpotStr);

        } else {
          if (actionLabel === 'Rise') {
            if (forceWin && nextSpot <= startSpot) nextSpot = startSpot + Math.random() * 0.5 + 0.01;
            if (!forceWin && nextSpot > startSpot) nextSpot = startSpot - Math.random() * 0.5 - 0.01;
          } else { 
            if (forceWin && nextSpot >= startSpot) nextSpot = startSpot - Math.random() * 0.5 - 0.01;
            if (!forceWin && nextSpot < startSpot) nextSpot = startSpot + Math.random() * 0.5 + 0.01;
          }
        }
      }

      currentSpot = nextSpot;
      const tickProfit = parseFloat((potentialPayout - stake).toFixed(2));

      setActiveContract((prev) => ({
        ...prev,
        currentValue: potentialPayout,
        profit: tickProfit,
        tickIndex: t,
      }));
    }

    await new Promise((r) => setTimeout(r, 375)); 
    if (!isSimulatingRef.current) return;

    let isWin = false;
    const exitSpot = parseFloat(currentSpot.toFixed(2));
    const finalDigit = parseInt(exitSpot.toFixed(2).slice(-1), 10);

    if (category === 'Digits') {
      if (tradeType === 'MATCHDIFF') {
        isWin = actionLabel === 'Matches' ? finalDigit === prediction : finalDigit !== prediction;
      } else if (tradeType === 'EVENODD') {
        isWin = actionLabel === 'Even' ? finalDigit % 2 === 0 : finalDigit % 2 !== 0;
      } else if (tradeType === 'OVERUNDER') {
        isWin = actionLabel === 'Over' ? finalDigit > prediction : finalDigit < prediction;
      }
    } else {
      isWin = actionLabel === 'Rise' ? exitSpot > startSpot : exitSpot < startSpot;
    }

    const tradeProfit = isWin
      ? parseFloat((potentialPayout - stake).toFixed(2))
      : parseFloat((-stake).toFixed(2));

    if (isWin) {
      updateOptionsBalance(potentialPayout);
      setTotalPayout((prev) => parseFloat((prev + potentialPayout).toFixed(2)));
      setContractsWon((prev) => prev + 1);
      setTotalProfitLoss((prev) => parseFloat((prev + tradeProfit).toFixed(2)));
      setSimPhase('WON');
    } else {
      setContractsLost((prev) => prev + 1);
      setTotalProfitLoss((prev) => parseFloat((prev - stake).toFixed(2)));
      setSimPhase('LOST');
    }

    // Log the Outcome Event in Journal
    setJournalLogs((prev) => [
      {
        id: Date.now().toString() + '-result',
        type: isWin ? 'profit' : 'loss',
        amount: isWin ? parseFloat((potentialPayout - stake).toFixed(2)) : parseFloat((-stake).toFixed(2)),
        timestamp: getGMTTimestamp(),
      },
      ...prev,
    ]);

    const finalEntrySpot = category === 'Digits' ? exitSpot : parseFloat(startSpot.toFixed(2));

    setTransactions((prev) => prev.map((tx) => 
      tx.id === currentTxId ? {
        ...tx,
        entrySpot: finalEntrySpot,
        exitSpot,
        profit: tradeProfit,
        isWin,
        isPending: false,
      } : tx
    ));

    await new Promise((r) => setTimeout(r, 1500)); 
    if (isSimulatingRef.current) {
      runTradeCycle();
    }
  };

  useEffect(() => {
    if (activeTab !== 'builder' || !blocklyDivRef.current) return;

    initDerivBlocks();

    const ws = Blockly.inject(blocklyDivRef.current, {
      renderer: 'zelos',
      theme: DerivTheme,
      grid: {
        spacing: 20,
        length: 0,
        colour: 'transparent',
        snap: true,
      },
      zoom: {
        controls: false,
        wheel: true,
        startScale: 0.85,
        maxScale: 2.0,
        minScale: 0.45,
        scaleSpeed: 1.15,
      },
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true,
        },
        drag: true,
        wheel: true,
      },
      trashcan: false,
    });

    workspaceRef.current = ws;

    const rootParams = ws.newBlock('trade_parameters_root');
    rootParams.initSvg();
    rootParams.render();
    rootParams.moveTo(new Blockly.utils.Coordinate(80, 48));

    const stepMarket = ws.newBlock('deriv_market_clean');
    stepMarket.initSvg();
    stepMarket.setFieldValue('Derived', 'MARKET');
    stepMarket.setFieldValue('Continuous Indices', 'SUBMARKET');
    stepMarket.setFieldValue('1HZ100V', 'ASSET');
    stepMarket.render();
    rootParams.getInput('INITIAL_PARAMETERS')?.connection?.connect(stepMarket.previousConnection);

    const stepType = ws.newBlock('trade_step_type');
    stepType.initSvg();
    stepType.setFieldValue('Up/Down', 'TRADE_CATEGORY');
    stepType.setFieldValue('RISEFALL', 'TRADE_TYPE');
    stepType.render();
    stepMarket.nextConnection?.connect(stepType.previousConnection);

    const stepContract = ws.newBlock('trade_step_contract');
    stepContract.initSvg();
    stepContract.setFieldValue('Both', 'CONTRACT_TYPE');
    stepContract.render();
    stepType.nextConnection?.connect(stepContract.previousConnection);

    const stepCandle = ws.newBlock('trade_step_candle');
    stepCandle.initSvg();
    stepCandle.setFieldValue('60', 'CANDLE_INTERVAL');
    stepCandle.render();
    stepContract.nextConnection?.connect(stepCandle.previousConnection);

    const stepRestartError = ws.newBlock('trade_step_restart_error');
    stepRestartError.initSvg();
    stepRestartError.setFieldValue('FALSE', 'RESTART_ERROR');
    stepRestartError.render();
    stepCandle.nextConnection?.connect(stepRestartError.previousConnection);

    const stepRestartLast = ws.newBlock('trade_step_restart_last');
    stepRestartLast.initSvg();
    stepRestartLast.setFieldValue('TRUE', 'RESTART_LAST_TRADE');
    stepRestartLast.render();
    stepRestartError.nextConnection?.connect(stepRestartLast.previousConnection);

    const tradeOptions = ws.newBlock('trade_options_block');
    tradeOptions.initSvg();
    tradeOptions.render();
    rootParams.getInput('SUBMARKET_OPTIONS')?.connection?.connect(tradeOptions.previousConnection);

    const rootPurchase = ws.newBlock('purchase_conditions_root');
    rootPurchase.initSvg();
    rootPurchase.render();
    rootPurchase.moveTo(new Blockly.utils.Coordinate(80, 560));

    const purchaseAction = ws.newBlock('purchase_action_block');
    purchaseAction.initSvg();
    purchaseAction.render();
    rootPurchase.getInput('PURCHASE_ACTION')?.connection?.connect(purchaseAction.previousConnection);

    const rootSell = ws.newBlock('sell_conditions_root');
    rootSell.initSvg();
    rootSell.render();
    rootSell.moveTo(new Blockly.utils.Coordinate(650, 48));

    const sellIfBlock = ws.newBlock('sell_statement_block');
    sellIfBlock.initSvg();
    sellIfBlock.render();
    rootSell.getInput('SELL_ACTION')?.connection?.connect(sellIfBlock.previousConnection);

    const sellAvailable = ws.newBlock('sell_available_check');
    sellAvailable.initSvg();
    sellAvailable.render();
    sellIfBlock.getInput('IF0')?.connection?.connect(sellAvailable.outputConnection);

    const rootRestart = ws.newBlock('restart_conditions_root');
    rootRestart.initSvg();
    rootRestart.render();
    rootRestart.moveTo(new Blockly.utils.Coordinate(650, 280));

    const tradeAgain = ws.newBlock('trade_again_block');
    tradeAgain.initSvg();
    tradeAgain.render();
    rootRestart.getInput('RESTART_ACTION')?.connection?.connect(tradeAgain.previousConnection);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (workspaceRef.current) {
          workspaceRef.current.getAllBlocks(false).forEach((block) => block.render());
        }
      });
    }

    return () => {
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [activeTab]);

  const handleZoomIn = () => workspaceRef.current?.zoomCenter(1);
  const handleZoomOut = () => workspaceRef.current?.zoomCenter(-1);
  const handleResetView = () => workspaceRef.current?.zoomReset();
  const handleUndo = () => workspaceRef.current?.undo(false);
  const handleRedo = () => workspaceRef.current?.undo(true);

  const isRunning = simPhase !== 'IDLE';
  const isBuying = simPhase === 'BUYING';
  const isBought = simPhase === 'BOUGHT';
  const isFinished = simPhase === 'WON' || simPhase === 'LOST';

  const dot1Solid = isBought || isFinished;
  const dot2Solid = isFinished || (isBought && activeContract.tickIndex > 0);
  const dot3Solid = isFinished;

  const dot1Pulsing = isBuying;
  const dot2Pulsing = isBuying || (isBought && activeContract.tickIndex === 0);
  const dot3Pulsing = isBuying || isBought;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <BotHeader onBackToApp={onBack} customBalance={balances.optionsUsd} />

      <main style={{ flex: 1, position: 'relative' }}>
        {activeTab === 'builder' && (
          <div className={styles.workspaceWrapper}>
            <aside className={styles.floatingToolbar}>
              <button type="button" className={styles.toolBtn} title="Reset view" onClick={handleResetView}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" role="img" fill="currentColor">
                  <path d="M2.156 10.594a.53.53 0 0 1-.5.406c-.312 0-.562-.25-.5-.562C1.875 7.344 4.656 5 8 5c2.531 0 4.75 1.375 6 3.406V6.5c0-.25.219-.5.5-.5.25 0 .5.25.5.5v3c0 .281-.25.5-.5.5h-3a.494.494 0 0 1-.5-.5c0-.25.219-.5.5-.5h1.688a6.002 6.002 0 0 0-11.032 1.594m11.657 2.844a.564.564 0 0 1 .53-.438c.282 0 .532.281.47.594A7.004 7.004 0 0 1 8 19a6.96 6.96 0 0 1-6-3.375V17.5c0 .281-.219.5-.5.5a.494.494 0 0 1-.5-.5v-3c0-.25.219-.5.5-.5h3c.281 0 .5.25.5.5 0 .281-.219.5-.5.5H2.781C3.812 16.813 5.75 18 8 18a5.97 5.97 0 0 0 5.813-4.562"></path>
                </svg>
              </button>
              <button type="button" className={styles.toolBtn} title="Import">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24" role="img" fill="currentColor">
                  <path d="M14 9c0-.531-.469-1-1-1H9.313a3.03 3.03 0 0 1-2.126-.875l-.812-.812.688-.72-.688.72A1.02 1.02 0 0 0 5.656 6H2c-.562 0-1 .469-1 1v8.969l1.594-4A1.49 1.49 0 0 1 4 11h12.5c.469 0 .938.25 1.219.688.281.406.343.906.156 1.374l-2 5c-.219.594-.781.938-1.375.938H2c-1.125 0-2-.875-2-2V7c0-1.094.875-2 2-2h3.656c.532 0 1.032.219 1.407.594l.843.843c.375.375.875.563 1.407.563H13c1.094 0 2 .906 2 2v1h-1zm-2 9h2.5a.47.47 0 0 0 .438-.312l2-5a.5.5 0 0 0-.032-.47A.53.53 0 0 0 16.5 12H4a.47.47 0 0 0-.469.344l-2 5a.44.44 0 0 0 .032.437c.093.157.25.219.437.219z"></path>
                </svg>
              </button>
              <button type="button" className={styles.toolBtn} title="Save">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" role="img" fill="currentColor">
                  <path d="M1 7v10c0 .563.438 1 1 1h10c.531 0 1-.437 1-1V9.344c0-.281-.125-.531-.312-.719l-2.313-2.312c-.125-.125-.25-.188-.375-.25V9c0 .563-.469 1-1 1H3c-.562 0-1-.437-1-1V6c-.562 0-1 .469-1 1m2-1v3h6V6zM0 7c0-1.094.875-2 2-2h7.656c.531 0 1.031.219 1.406.594l2.344 2.343c.375.375.594.875.594 1.407V17c0 1.125-.906 2-2 2H2c-1.125 0-2-.875-2-2zm8.5 7c0-.531-.312-1-.75-1.281-.469-.281-1.062-.281-1.5 0-.469.281-.75.75-.75 1.281 0 .563.281 1.031.75 1.313.438.28 1.031.28 1.5 0 .438-.282.75-.75.75-1.313M7 11.5c.875 0 1.688.5 2.156 1.25.438.781.438 1.75 0 2.5-.469.781-1.281 1.25-2.156 1.25a2.53 2.53 0 0 1-2.187-1.25c-.438-.75-.438-1.719 0-2.5C5.28 12 6.093 11.5 7 11.5"></path>
                </svg>
              </button>
              <button type="button" className={styles.toolBtn} title="Toolbox">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" role="img" fill="currentColor">
                  <path d="M0 4.5c0-.25.219-.5.5-.5.25 0 .5.25.5.5v15c0 .281-.25.5-.5.5a.494.494 0 0 1-.5-.5zm5 5c0 .281.219.5.5.5h9c.25 0 .5-.219.5-.5v-2c0-.25-.25-.5-.5-.5h-9c-.281 0-.5.25-.5.5zm-1-2A1.5 1.5 0 0 1 5.5 6h9c.813 0 1.5.688 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5h-9A1.48 1.48 0 0 1 4 9.5zm1 9c0 .281.219.5.5.5h5c.25 0 .5-.219.5-.5v-2c0-.25-.25-.5-.5-.5h-5c-.281 0-.5.25-.5.5zm-1-2A1.5 1.5 0 0 1 5.5 13h5c.813 0 1.5.688 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5h-5A1.48 1.48 0 0 1 4 16.5z"></path>
                </svg>
              </button>
              <div className={styles.toolDivider} />
              <button type="button" className={styles.toolBtn} title="Undo" onClick={handleUndo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" role="img" fill="currentColor">
                  <path d="M1.5 10a.494.494 0 0 1-.5-.5v-4c0-.25.219-.5.5-.5.25 0 .5.25.5.5v2.906A6.98 6.98 0 0 1 8 5c3.844 0 7 3.156 7 7 0 3.875-3.156 7-7 7a7 7 0 0 1-5.937-3.25c-.22-.344.03-.75.437-.75.188 0 .344.125.438.281A6.05 6.05 0 0 0 8 18c3.313 0 6-2.687 6-6 0-3.312-2.687-6-6-6a6.02 6.02 0 0 0-5.219 3H5.5c.25 0 .5.25.5.5 0 .281-.25.5-.5.5z"></path>
                </svg>
              </button>
              <button type="button" className={styles.toolBtn} title="Redo" onClick={handleRedo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" role="img" fill="currentColor">
                  <path d="M14.5 10h-4a.494.494 0 0 1-.5-.5c0-.25.219-.5.5-.5h2.688A6 6 0 0 0 8 6c-3.312 0-6 2.688-6 6 0 3.313 2.688 6 6 6a6.04 6.04 0 0 0 5.031-2.719A.58.58 0 0 1 13.5 15c.375 0 .625.406.406.75C12.687 17.719 10.47 19 8 19c-3.875 0-7-3.125-7-7 0-3.844 3.125-7 7-7 2.531 0 4.75 1.375 6 3.406V5.5c0-.25.219-.5.5-.5.25 0 .5.25.5.5v4c0 .281-.25.5-.5.5"></path>
                </svg>
              </button>
              <div className={styles.toolDivider} />
              <button type="button" className={styles.toolBtn} title="Zoom in" onClick={handleZoomIn}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" role="img" fill="currentColor">
                  <path d="M6.5 5C4.531 5 2.719 6.063 1.719 7.75c-.969 1.719-.969 3.813 0 5.5A5.51 5.51 0 0 0 6.5 16a5.5 5.5 0 0 0 4.75-2.75c.969-1.687.969-3.781 0-5.5C10.25 6.063 8.438 5 6.5 5m0 12A6.495 6.495 0 0 1 0 10.5C0 6.938 2.906 4 6.5 4c3.563 0 6.5 2.938 6.5 6.5a6.58 6.58 0 0 1-1.562 4.25l4.406 4.406a.53.53 0 0 1 0 .719.53.53 0 0 1-.719 0l-4.406-4.437C9.594 16.438 8.094 17 6.5 17M6 13.5V11H3.5a.494.494 0 0 1-.5-.5c0-.25.219-.5.5-.5H6V7.5c0-.25.219-.5.5-.5.25 0 .5.25.5.5V10h2.5c.25 0 .5.25.5.5 0 .281-.25.5-.5.5H7v2.5c0 .281-.25.5-.5.5a.494.494 0 0 1-.5-.5"></path>
                </svg>
              </button>
              <button type="button" className={styles.toolBtn} title="Zoom out" onClick={handleZoomOut}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" role="img" fill="currentColor">
                  <path d="M6.5 5C4.531 5 2.719 6.063 1.719 7.75c-.969 1.719-.969 3.813 0 5.5A5.51 5.51 0 0 0 6.5 16a5.5 5.5 0 0 0 4.75-2.75c.969-1.687.969-3.781 0-5.5C10.25 6.063 8.438 5 6.5 5m0 12A6.495 6.495 0 0 1 0 10.5C0 6.938 2.906 4 6.5 4c3.563 0 6.5 2.938 6.5 6.5a6.58 6.58 0 0 1-1.562 4.25l4.406 4.406a.53.53 0 0 1 0 .719.53.53 0 0 1-.719 0l-4.406-4.437C9.594 16.438 8.094 17 6.5 17m-3-7h6c.25 0 .5.25.5.5 0 .281-.25.5-.5.5h-6a.494.494 0 0 1-.5-.5c0-.25.219-.5.5-.5"></path>
                </svg>
              </button>
            </aside>

            <button type="button" className={styles.quickStrategyBtn}>
              Quick strategy
            </button>

            <div ref={blocklyDivRef} className={styles.blocklyContainer} />

            {/* Slide-out Simulation Drawer */}
            {drawerOpen && (
              <div className={styles.drawerBackdrop}>
                <div className={styles.drawerHeader}>
                  
                  {/* Top Row with Chevron and Reset */}
                  <div className={styles.drawerTopRow}>
                    <div 
                      className={styles.drawerChevron} 
                      onClick={() => setDrawerOpen(false)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" style={{ transform: 'rotate(180deg)' }}>
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </div>
                    <button type="button" className={styles.resetBtn} onClick={handleResetMetrics}>
                      Reset
                    </button>
                  </div>

                  <ul className={styles.drawerTabs}>
                    <li
                      className={`${styles.drawerTabItem} ${drawerTab === 'summary' ? styles.drawerTabItemActive : ''}`}
                      onClick={() => setDrawerTab('summary')}
                    >
                      Summary
                    </li>
                    <li
                      className={`${styles.drawerTabItem} ${drawerTab === 'transactions' ? styles.drawerTabItemActive : ''}`}
                      onClick={() => setDrawerTab('transactions')}
                    >
                      Transactions
                    </li>
                    <li
                      className={`${styles.drawerTabItem} ${drawerTab === 'journal' ? styles.drawerTabItemActive : ''}`}
                      onClick={() => setDrawerTab('journal')}
                    >
                      Journal
                    </li>
                  </ul>
                </div>

                {drawerTab === 'summary' && (
                  <div className={styles.summaryTabWrapper}>
                    {(simPhase === 'IDLE' || simPhase === 'BUYING') && numberOfRuns === 0 && (
                      <div className={styles.idleStateWrapper}>
                        <p>When you’re ready to trade, hit <strong>Run</strong>. You’ll be able to track your bot’s performance here.</p>
                      </div>
                    )}

                    {(simPhase === 'BOUGHT' || ((simPhase === 'IDLE' || simPhase === 'BUYING') && numberOfRuns > 0)) && (
                      <div className={styles.liveDashboard}>
                        <div className={styles.dashHeaderRow}>
                          <div className={styles.dashMarket}>
                            <MarketIcon market={activeContract.market} className={styles.marketIconPng} />
                            <span>{activeContract.market}</span>
                          </div>
                          <div className={styles.dashAction}>
                            <ActionIcon action={activeContract.action} className={styles.actionSvgIcon} />
                            <span style={{ color: ['Rise', 'Fall', 'Under', 'Even'].includes(activeContract.action) ? (['Rise', 'Even', 'Over'].includes(activeContract.action) ? '#00a8a8' : '#ff444f') : '#333333' }}>
                              {activeContract.action}
                            </span>
                          </div>
                        </div>

                        <div className={styles.dashTickTracker}>
                          <div className={styles.dashTickLabel}>Tick {activeContract.tickIndex}</div>
                          <div className={styles.dashTickBarBg}>
                            <div 
                              className={styles.dashTickBarFill} 
                              style={{ width: `${(activeContract.tickIndex / Math.max(1, currentDuration)) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className={styles.currencyPill}>USD</div>
                        <div className={styles.dashMetrics2x2}>
                          <div className={styles.dashMetricItem}>
                            <span className={styles.dashMetricLabel}>Total profit/loss:</span>
                            <span className={`${styles.dashMetricVal} ${activeContract.profit >= 0 ? styles.valGreen : styles.valRed}`}>
                              {activeContract.profit >= 0 ? `+${activeContract.profit.toFixed(2)}` : activeContract.profit.toFixed(2)} {activeContract.profit >= 0 ? '▲' : '▼'}
                            </span>
                          </div>
                          <div className={styles.dashMetricItem}>
                            <span className={styles.dashMetricLabel}>Contract value:</span>
                            <span className={`${styles.dashMetricVal} ${styles.valGreen}`}>
                              {activeContract.currentValue.toFixed(2)} ▲
                            </span>
                          </div>
                          <div className={styles.dashMetricItem}>
                            <span className={styles.dashMetricLabel}>Stake:</span>
                            <span className={styles.dashMetricValPlain}>{activeContract.stake.toFixed(2)}</span>
                          </div>
                          <div className={styles.dashMetricItem}>
                            <span className={styles.dashMetricLabel}>Potential payout:</span>
                            <span className={styles.dashMetricValPlain}>{activeContract.potentialPayout.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className={styles.resaleText}>Resale not offered</div>
                      </div>
                    )}

                    {(simPhase === 'WON' || simPhase === 'LOST') && (
                      <div className={`${styles.closedDashboard} ${simPhase === 'WON' ? styles.closedWinBg : styles.closedLossBg}`}>
                        <div className={styles.dashHeaderRow} style={{ opacity: 0.3 }}>
                          <div className={styles.dashMarket}>
                            <MarketIcon market={activeContract.market} className={styles.marketIconPng} />
                            <span>{activeContract.market}</span>
                          </div>
                          <div className={styles.dashAction}>
                            <ActionIcon action={activeContract.action} className={styles.actionSvgIcon} />
                            <span style={{ color: ['Rise', 'Fall', 'Under', 'Even'].includes(activeContract.action) ? (['Rise', 'Even', 'Over'].includes(activeContract.action) ? '#00a8a8' : '#ff444f') : '#333333' }}>
                              {activeContract.action}
                            </span>
                          </div>
                        </div>

                        <div className={styles.closedCenterStage}>
                          <div className={`${styles.closedStatusPill} ${simPhase === 'WON' ? styles.valGreen : styles.valRed}`}>
                            <div className={`${styles.maskFlag} ${simPhase === 'WON' ? styles.bgGreen : styles.bgRed}`} />
                            <span>Closed</span>
                          </div>
                          <div className={`${styles.closedMassiveAmount} ${simPhase === 'WON' ? styles.valGreen : styles.valRed}`}>
                            {simPhase === 'WON' 
                              ? `+${(activeContract.potentialPayout - activeContract.stake).toFixed(2)}` 
                              : `-${activeContract.stake.toFixed(2)}`} USD
                          </div>
                        </div>
                      </div>
                    )}

                    {numberOfRuns > 0 && (
                      <div className={styles.summaryFooterContainer}>
                        <div className={styles.metricsHeaderRow}>
                          <span className={styles.whatsThisLink}>What's this?</span>
                        </div>
                        <div className={styles.metricsGrid}>
                          <div>
                            <div className={styles.metricTitle}>Total stake</div>
                            <div className={styles.metricAmount}>{totalStake.toFixed(2)} USD</div>
                          </div>
                          <div>
                            <div className={styles.metricTitle}>Total payout</div>
                            <div className={styles.metricAmount}>{totalPayout.toFixed(2)} USD</div>
                          </div>
                          <div>
                            <div className={styles.metricTitle}>No. of runs</div>
                            <div className={styles.metricAmount}>{numberOfRuns}</div>
                          </div>
                          <div>
                            <div className={styles.metricTitle}>Contracts lost</div>
                            <div className={styles.metricAmount}>{contractsLost}</div>
                          </div>
                          <div>
                            <div className={styles.metricTitle}>Contracts won</div>
                            <div className={styles.metricAmount}>{contractsWon}</div>
                          </div>
                          <div>
                            <div className={styles.metricTitle}>Total profit/loss</div>
                            <div
                              className={`${styles.metricAmount} ${
                                totalProfitLoss >= 0 ? styles.metricAmountPositive : styles.metricAmountNegative
                              }`}
                            >
                              {totalProfitLoss >= 0 ? `+${totalProfitLoss.toFixed(2)}` : totalProfitLoss.toFixed(2)} USD
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'transactions' && (
                  <div className={styles.transactionsWrapper}>
                    <div className={styles.transControls}>
                      <button type="button" className={styles.transOutlineBtn}>Download</button>
                      <button type="button" className={styles.transOutlineBtn}>View Detail</button>
                    </div>
                    <table className={styles.transTable}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Entry/Exit spot</th>
                          <th>Buy price and P/L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className={styles.transTableRow}>
                            <td>
                              <div className={`${styles.typeColumn} ${tx.isPending ? styles.slideInCell : ''}`}>
                                <MarketIcon market={tx.market} className={styles.marketIconSmall} />
                                <ActionIcon action={tx.type} className={styles.actionSvgIconSmall} />
                              </div>
                            </td>
                            <td>
                              <div className={`${styles.spotStack} ${tx.isPending ? styles.slideInCell : ''}`}>
                                <div className={styles.spotLine}>
                                  <div className={styles.spotCircleRed} />
                                  <span>{tx.entrySpot.toFixed(2)}</span>
                                 </div>
                                <div className={styles.spotLine}>
                                  <div className={styles.spotCircleGray} />
                                  {tx.isPending ? (
                                    <div className={styles.skeletonBar} />
                                  ) : (
                                    <span>{tx.exitSpot.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className={tx.isPending ? styles.slideInCell : ''}>
                                <div>{tx.stake.toFixed(2)} USD</div>
                                {tx.isPending ? (
                                  <div className={styles.skeletonBarRight} />
                                ) : (
                                  <div style={{ color: tx.isWin ? '#00a8a8' : '#ff444f', fontWeight: 700 }}>
                                    {tx.profit >= 0 ? `+${tx.profit.toFixed(2)}` : tx.profit.toFixed(2)} USD
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {drawerTab === 'journal' && (
                  <div className={styles.journalWrapper}>
                    <div className={styles.journalToolsContainer}>
                      <button type="button" className={styles.journalDownloadBtn}>Download</button>
                      <div className={styles.journalFilterContainer}>
                        <span className={styles.journalFilterLabel}>Filters</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 11 18" fill="currentColor">
                          <path d="M.25 5.75C.25 5.352.578 5 1 5h9c.398 0 .75.352.75.75 0 .422-.352.75-.75.75H1a.74.74 0 0 1-.75-.75m1.5 3.75c0-.398.328-.75.75-.75h6c.398 0 .75.352.75.75 0 .422-.352.75-.75.75h-6a.74.74 0 0 1-.75-.75M7 13.25c0 .422-.352.75-.75.75h-1.5a.74.74 0 0 1-.75-.75c0-.398.328-.75.75-.75h1.5c.398 0 .75.352.75.75"></path>
                        </svg>
                      </div>
                    </div>
                    <div className={styles.journalList}>
                      {journalLogs.map((log) => (
                        <div key={log.id} className={`${styles.journalItemRow} ${styles.slideInCell}`}>
                          <div className={styles.journalItemContent}>
                            {log.type === 'buy' && (
                              <div><span className={styles.journalInfo}>Bought</span>: Contract purchased (ID: {log.contractId})</div>
                            )}
                            {log.type === 'profit' && (
                              <div>Profit amount: <span className={styles.journalSuccess}>{log.amount?.toFixed(2)} USD</span></div>
                            )}
                            {log.type === 'loss' && (
                              <div>Loss amount: <span className={styles.journalDanger}>{log.amount?.toFixed(2)} USD</span></div>
                            )}
                          </div>
                          <div className={styles.journalTimestamp}>
                            {log.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Unified Bottom Anchor Panel (Chevron + Run Box) */}
            <div className={styles.bottomPanel}>
              
              {/* Chevron Row - Only visible when drawer is CLOSED */}
              {!drawerOpen && (
                <div 
                  className={styles.chevronRow} 
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open Drawer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2.5"
                  >
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </div>
              )}

              {/* Controls Box Section */}
              <div className={styles.controlsBoxWrapper}>
                <div className={styles.controlsBox}>
                  
                  {/* The persistent button side */}
                  {(simPhase === 'IDLE' || simPhase === 'BUYING' || isFinished) ? (
                    <button 
                      type="button" 
                      className={simPhase === 'IDLE' ? styles.runBtn : styles.runBtnDisabled} 
                      onClick={simPhase === 'IDLE' ? handleToggleRun : undefined}
                    >
                      <div className={styles.runBtnIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="30" viewBox="0 0 15 30" role="img" fill="currentColor">
                          <path d="m2.852 7.023 11.25 6.875c.546.352.898.977.898 1.602 0 .664-.352 1.29-.898 1.602l-11.25 6.875c-.586.351-1.329.39-1.914.039C.352 23.703 0 23.078 0 22.375V8.625c0-.664.352-1.29.938-1.602a1.87 1.87 0 0 1 1.914 0"></path>
                        </svg>
                      </div>
                      <span>Run</span>
                    </button>
                  ) : (
                    <button type="button" className={styles.stopBtn} onClick={handleToggleRun}>
                      <div className={styles.stopSquare} />
                      <span>Stop</span>
                    </button>
                  )}

                  {/* Shared Persistent Track Area (For IDLE, BUYING, BOUGHT) */}
                  {!isFinished && (
                    <div className={styles.trackArea}>
                      <span className={styles.trackText}>
                        {simPhase === 'IDLE' ? 'Bot is not running' : simPhase === 'BUYING' ? 'Buying contract' : 'Contract bought'}
                      </span>
                      <div className={styles.progressLineContainer}>
                        <div className={styles.progressLineBackground} />
                        
                        {/* Dynamic Progress Line stays at 0% until BOUGHT starts, then scales smoothly */}
                        <div 
                          className={styles.progressBar} 
                          style={{ 
                            width: (simPhase === 'IDLE' || simPhase === 'BUYING') 
                                      ? '0%' 
                                      : (simPhase === 'BOUGHT' 
                                          ? (activeContract.tickIndex === 0 ? '50%' : `${50 + (activeContract.tickIndex / currentDuration) * 50}%`) 
                                          : '100%'),
                            transition: simPhase === 'BOUGHT' 
                                          ? (activeContract.tickIndex === 0 ? 'width 0.4s ease-out' : 'width 1s linear') 
                                          : 'none'
                          }} 
                        />
                        
                        {/* Dot 1 */}
                        <div className={styles.circularWrapper}>
                          <span className={`${styles.staticCircle} ${dot1Solid ? styles.staticCircleActive : ''}`} />
                          {dot1Pulsing && <span className={styles.dynamicCircle} />}
                        </div>
                        
                        {/* Dot 2 */}
                        <div className={styles.circularWrapper}>
                          <span className={`${styles.staticCircle} ${dot2Solid ? styles.staticCircleActive : ''}`} />
                          {dot2Pulsing && <span className={styles.dynamicCircle} />}
                        </div>
                        
                        {/* Dot 3 */}
                        <div className={styles.circularWrapper}>
                          <span className={`${styles.staticCircle} ${dot3Solid ? styles.staticCircleActive : ''}`} />
                          {dot3Pulsing && <span className={styles.dynamicCircle} />}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outcome Areas Fade in smoothly over the track */}
                  {simPhase === 'WON' && (
                    <div className={styles.wonOutcomeArea}>
                      <span>Won</span>
                      <div className={styles.iconCircle}>✓</div>
                    </div>
                  )}

                  {simPhase === 'LOST' && (
                    <div className={styles.lostOutcomeArea}>
                      <span>Lost</span>
                      <div className={styles.iconCircle}>✕</div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Modal Prompt Dialog */}
            {promptState.isOpen && (
              <div className={styles.promptBackdrop}>
                <div className={styles.promptCard}>
                  <div className={styles.promptOrigin}>bot.deriv.com says</div>
                  <div className={styles.promptMessage}>{promptState.title}</div>
                  <input
                    type="text"
                    className={styles.promptInput}
                    value={promptValue}
                    autoFocus
                    onChange={(e) => setPromptValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePromptConfirm();
                      if (e.key === 'Escape') handlePromptCancel();
                    }}
                  />
                  <div className={styles.promptActions}>
                    <button type="button" className={styles.promptBtnCancel} onClick={handlePromptCancel}>
                      Cancel
                    </button>
                    <button type="button" className={styles.promptBtnOk} onClick={handlePromptConfirm}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chart' && (
          <div style={{ padding: 20, textAlign: 'center', color: '#6e7481' }}>Live Chart View</div>
        )}
        {activeTab === 'dashboard' && (
          <div style={{ padding: 20, textAlign: 'center', color: '#6e7481' }}>Dashboard View</div>
        )}
        {activeTab === 'menu' && (
          <div style={{ padding: 20, textAlign: 'center', color: '#6e7481' }}>Menu View</div>
        )}
      </main>

      <BotBottomNav currentTab={activeTab} onTabSelect={() => onBack()} />
    </div>
  );
};