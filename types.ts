export type StrategyType = 'Long' | 'Short' | 'Combined';

export interface StrategyParameter {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  defaultValue: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  description?: string;
}

export interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
  difficulty: number; // 1 to 5
  description: string;
  logic: string;
  code: string;
  tags: string[];
  winRate: string;
  tradesPerDay: string;
  parameters?: StrategyParameter[];
}

export interface MarketData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  signal?: 'buy' | 'sell' | 'none';
}
