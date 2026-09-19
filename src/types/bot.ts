export type MarketType = 'Derived';
export type SubmarketType = 'Continuous Indices';
export type AssetSymbol = 'Volatility 100 (1s) Index' | 'Volatility 25 (1s) Index';

export type TradeCategory =
  | 'Up/Down'
  | 'Touch/No Touch'
  | 'In/Out'
  | 'Asians'
  | 'Digits'
  | 'Reset Call/Reset Put'
  | 'High/Low Ticks'
  | 'Only Ups/Only Downs'
  | 'Multipliers'
  | 'Accumulators';

export type UpDownSubType = 'Rise/Fall' | 'Rise Equals/Fall Equals' | 'Higher/Lower';
export type DigitsSubType = 'Matches/Differs' | 'Even/Odd' | 'Over/Under';
export type GenericSubType = string;

export type BlockSocketId =
  | 'none'
  | 'trade_params_run_once'
  | 'trade_params_options'
  | 'purchase_condition_slot'
  | 'restart_trading_slot'
  | 'sell_condition_slot';

export interface DraggableBlockState {
  id: string;
  x: number;
  y: number;
  socket: BlockSocketId;
}

export interface BotStrategyConfig {
  market: MarketType;
  submarket: SubmarketType;
  asset: AssetSymbol;
  tradeCategory: TradeCategory;
  tradeType: string;
  contractType: 'Both' | 'Rise' | 'Fall';
  candleInterval: string;
  restartOnError: boolean;
  restartLastTradeOnError: boolean;
  durationTicks: number;
  stakeUsd: number;
  predictionDigit: number;
  purchaseAction: string;
}