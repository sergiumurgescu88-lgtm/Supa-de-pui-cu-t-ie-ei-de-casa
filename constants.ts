import { Strategy } from './types';

export const STRATEGIES: Strategy[] = [
  {
    id: 'long-1',
    name: 'RSI Mean Reversion',
    type: 'Long',
    difficulty: 1,
    description: 'Classic mean reversion strategy. Buys when market is oversold and panic selling occurs.',
    winRate: '55-65%',
    tradesPerDay: '2-5',
    tags: ['Mean Reversion', 'RSI', 'Beginner'],
    logic: 'BUY: RSI < 30 (oversold) AND Price touches Lower Bollinger Band AND Stoch < 20.\nSELL: RSI > 70 OR TP/SL hit.',
    code: `class RSI_MeanReversion(IStrategy):
    rsi_oversold = IntParameter(20, 40, default=30, space="buy")
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe["rsi"] < self.rsi_oversold.value) &
                (dataframe["close"] <= dataframe[f"bb_lower_{self.bb_period.value}"]) &
                (dataframe["stoch_k"] < 20) &
                (dataframe["volume"] > 0)
            ),
            "enter_long"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'rsi_period', label: 'RSI Period', type: 'number', defaultValue: 14, min: 2, max: 30, step: 1, description: 'Period for RSI calculation' },
      { key: 'rsi_oversold', label: 'RSI Oversold Threshold', type: 'number', defaultValue: 30, min: 10, max: 45, step: 1, description: 'Trigger buy below this value' },
      { key: 'bb_period', label: 'Bollinger Band Period', type: 'number', defaultValue: 20, min: 10, max: 50, step: 1 },
      { key: 'stoch_k_threshold', label: 'Stoch K Threshold', type: 'number', defaultValue: 20, min: 5, max: 40, step: 1 }
    ]
  },
  {
    id: 'long-2',
    name: 'Scalping EMA Volume',
    type: 'Long',
    difficulty: 2,
    description: 'High-frequency scalping strategy using EMA stacks and volume spikes.',
    winRate: '50-60%',
    tradesPerDay: '15-30',
    tags: ['Scalping', 'High Frequency', 'EMA'],
    logic: 'BUY: EMA8 > EMA13 > EMA21 (Bullish Stack) AND Volume > 1.5x Mean AND Momentum > 0.',
    code: `class ScalpingEMAVolume(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe[f"ema_fast"] > dataframe[f"ema_mid"]) &
                (dataframe[f"ema_mid"]  > dataframe[f"ema_slow"]) &
                (dataframe["volume_spike"] > self.volume_mult.value) &
                (dataframe["mom"] > 0)
            ),
            "enter_long"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'ema_fast', label: 'Fast EMA', type: 'number', defaultValue: 8, min: 2, max: 20 },
      { key: 'ema_mid', label: 'Mid EMA', type: 'number', defaultValue: 13, min: 5, max: 30 },
      { key: 'ema_slow', label: 'Slow EMA', type: 'number', defaultValue: 21, min: 10, max: 50 },
      { key: 'volume_mult', label: 'Volume Multiplier', type: 'number', defaultValue: 1.5, min: 1.1, max: 5.0, step: 0.1 }
    ]
  },
  {
    id: 'long-3',
    name: 'Breakout ATR',
    type: 'Long',
    difficulty: 3,
    description: 'Detects consolidation periods and enters when price breaks out with high volatility.',
    winRate: '45-55%',
    tradesPerDay: '1-3',
    tags: ['Breakout', 'ATR', 'Volatility'],
    logic: 'BUY: Previous Candle Consolidated AND Price > Donchian High AND ATR Expanding AND Volume High.',
    code: `class Breakout_ATR_Strategy(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe[consolidation_col].shift(1) == 1) &
                (dataframe["close"] > dataframe[dc_high_col].shift(1)) &
                (dataframe["volume_ratio"] > self.volume_threshold.value) &
                (dataframe["atr_ratio"] > self.atr_multiplier.value)
            ),
            "enter_long"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'atr_period', label: 'ATR Period', type: 'number', defaultValue: 14, min: 5, max: 30 },
      { key: 'atr_multiplier', label: 'ATR Expansion Multiplier', type: 'number', defaultValue: 1.2, min: 1.0, max: 3.0, step: 0.1 },
      { key: 'volume_threshold', label: 'Volume Ratio Threshold', type: 'number', defaultValue: 1.5, min: 1.0, max: 5.0, step: 0.1 }
    ]
  },
  {
    id: 'long-4',
    name: 'MTF Trend Following',
    type: 'Long',
    difficulty: 4,
    description: 'Follows the major 4h trend and enters on 1h pullbacks. Best Risk:Reward ratio.',
    winRate: '50-60%',
    tradesPerDay: '1-2',
    tags: ['Trend', 'Multi-Timeframe', 'Conservative'],
    logic: 'FILTER: 4h EMA50 > EMA200.\nENTRY: 1h MACD Crossover AND RSI 45-65 AND Price > Ichimoku Cloud.',
    code: `class MultiTimeframe_TrendFollowing(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe["uptrend_4h"] == 1) &
                (dataframe["macdhist"] > 0) &
                (dataframe["macdhist"].shift(1) <= 0) &
                (dataframe["rsi"] > 45) &
                (dataframe["above_cloud"] == 1)
            ),
            "enter_long"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'ema_trend_fast', label: '4h Trend EMA Fast', type: 'number', defaultValue: 50 },
      { key: 'ema_trend_slow', label: '4h Trend EMA Slow', type: 'number', defaultValue: 200 },
      { key: 'rsi_min', label: 'RSI Min Filter', type: 'number', defaultValue: 45 },
      { key: 'rsi_max', label: 'RSI Max Filter', type: 'number', defaultValue: 65 }
    ]
  },
  {
    id: 'short-1',
    name: 'RSI Short Reversion',
    type: 'Short',
    difficulty: 1,
    description: 'Shorts when the market is overbought and hitting resistance.',
    winRate: '55-60%',
    tradesPerDay: '2-5',
    tags: ['Short', 'Mean Reversion', 'Bearish'],
    logic: 'ENTRY: RSI > 70 AND Price >= BB Upper AND Stoch > 80.',
    code: `class RSI_Short_MeanReversion(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe["rsi"] > self.rsi_overbought.value) &
                (dataframe["close"] >= dataframe[f"bb_upper_{self.bb_period.value}"]) &
                (dataframe["stoch_k"] > 80)
            ),
            "enter_short"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'rsi_overbought', label: 'RSI Overbought', type: 'number', defaultValue: 70, min: 50, max: 90 },
      { key: 'bb_period', label: 'Bollinger Band Period', type: 'number', defaultValue: 20 },
      { key: 'stoch_threshold', label: 'Stoch K Threshold', type: 'number', defaultValue: 80 }
    ]
  },
  {
    id: 'short-4',
    name: 'MACD Bearish Cross',
    type: 'Short',
    difficulty: 2,
    description: 'Momentum reversal strategy. Enters short on MACD bearish crossover in overbought conditions.',
    winRate: '52-58%',
    tradesPerDay: '3-6',
    tags: ['Momentum', 'MACD', 'Intermediate'],
    logic: 'ENTRY: MACD Line crosses below Signal Line AND MACD > 0 AND RSI > 60.',
    code: `class MACD_Bearish_Crossover(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                qtpylib.crossed_below(dataframe['macd'], dataframe['macdsignal']) &
                (dataframe['macd'] > 0) &
                (dataframe['rsi'] > 60)
            ),
            "enter_short"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'rsi_threshold', label: 'RSI Filter', type: 'number', defaultValue: 60, min: 50, max: 80 }
    ]
  },
  {
    id: 'short-2',
    name: 'Death Cross Breakdown',
    type: 'Short',
    difficulty: 3,
    description: 'Aggressive short strategy for confirmed bear markets using Death Cross.',
    winRate: '50-55%',
    tradesPerDay: '1-2',
    tags: ['Short', 'Trend', 'Aggressive'],
    logic: 'ENTRY: EMA50 < EMA200 (Death Cross) AND Price < Support AND Volume > 1.5x.',
    code: `class DeathCross_Breakdown_Short(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe["bearish_trend"] == 1) &
                (dataframe["close"] < dataframe[support_col].shift(1)) &
                (dataframe["volume_ratio"] > self.vol_mult.value) &
                (dataframe["macdhist"] < 0)
            ),
            "enter_short"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'ema_fast', label: 'Death Cross Fast EMA', type: 'number', defaultValue: 50 },
      { key: 'ema_slow', label: 'Death Cross Slow EMA', type: 'number', defaultValue: 200 },
      { key: 'vol_mult', label: 'Volume Spike Ratio', type: 'number', defaultValue: 1.5, step: 0.1 }
    ]
  },
  {
    id: 'short-5',
    name: 'Bear Flag Continuation',
    type: 'Short',
    difficulty: 4,
    description: 'Identifies bear flag patterns and enters on the breakdown of the flag support.',
    winRate: '58-64%',
    tradesPerDay: '1-3',
    tags: ['Price Action', 'Continuation', 'Bearish'],
    logic: 'ENTRY: Trend is Bearish AND Flag Consolidation Detected AND Price breaks below Flag Low on High Volume.',
    code: `class BearFlag_Continuation_Short(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe["adx"] > 25) &
                (dataframe["close"] < dataframe["ema_20"]) &
                (dataframe["close"] < dataframe["flag_low"]) &
                (dataframe["volume"] > dataframe["volume_mean"])
            ),
            "enter_short"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'adx_min', label: 'Min ADX (Trend Strength)', type: 'number', defaultValue: 25, min: 10, max: 50 }
    ]
  },
  {
    id: 'short-3',
    name: 'Smart Combo Short',
    type: 'Combined',
    difficulty: 5,
    description: 'The ultimate versatile bot. Trades both Long and Short based on score.',
    winRate: '60-70%',
    tradesPerDay: '3-8',
    tags: ['Expert', 'Long/Short', 'Hedging'],
    logic: 'SHORT: Bearish Score >= 7 (EMA <, RSI > 70, MACD < 0, etc.)\nLONG: Bullish Score >= 7.',
    code: `class SmartComboShortScore(IStrategy):
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # LONG entry
        dataframe.loc[
            (dataframe["long_score"] >= self.min_short_score.value),
            "enter_long"
        ] = 1
        # SHORT entry
        dataframe.loc[
            (dataframe["short_score"] >= self.min_short_score.value),
            "enter_short"
        ] = 1
        return dataframe`,
    parameters: [
      { key: 'min_short_score', label: 'Min Score for Entry', type: 'number', defaultValue: 7, min: 1, max: 10 },
      { key: 'hedge_mode', label: 'Hedge Mode Active', type: 'boolean', defaultValue: true }
    ]
  }
];