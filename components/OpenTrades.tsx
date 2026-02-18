import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, X, Activity, RefreshCw, AlertCircle, Wallet } from 'lucide-react';
import { BinanceService, MarketType } from '../services/binance';

interface Trade {
  id: string;
  pair: string;
  type: 'Long' | 'Short';
  entry: number;
  size: number; // Margin size in USDT (or amount for Spot)
  leverage: number;
  stopLoss: number;
  pnl?: number; // Pre-calculated PnL from API
  market?: string;
  amount?: number;
}

const INITIAL_TRADES: Trade[] = [
  { id: 't1', pair: 'BTCUSDT', type: 'Long', entry: 67120.50, size: 250, leverage: 10, stopLoss: 66500 },
  { id: 't2', pair: 'ETHUSDT', type: 'Short', entry: 3540.00, size: 150, leverage: 5, stopLoss: 3650 },
  { id: 't3', pair: 'SOLUSDT', type: 'Long', entry: 145.20, size: 100, leverage: 3, stopLoss: 138 },
];

interface OpenTradesProps {
  apiKey?: string;
  apiSecret?: string;
  marketType?: MarketType;
}

const OpenTrades: React.FC<OpenTradesProps> = ({ apiKey, apiSecret, marketType = 'Futures' }) => {
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isApiMode, setIsApiMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Effect to switch mode and fetch initial API data
  useEffect(() => {
    if (apiKey && apiSecret) {
      setIsApiMode(true);
      setTrades([]); // Clear mock data
      fetchBinancePositions();

      // Poll for position updates every 10 seconds
      intervalRef.current = window.setInterval(fetchBinancePositions, 10000);
    } else {
      setIsApiMode(false);
      setTrades(INITIAL_TRADES);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [apiKey, apiSecret, marketType]);

  const fetchBinancePositions = async () => {
    if (!apiKey || !apiSecret) return;
    const service = new BinanceService(apiKey, apiSecret, marketType as MarketType);
    try {
      const positions = await service.getOpenPositions();
      setTrades(positions);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Failed to fetch positions", err);
      if (err.message && err.message.includes("Failed to fetch")) {
        setErrorMsg("CORS Error: Requires a browser extension to fetch directly from Binance.");
      } else {
        setErrorMsg(err.message || "API Error");
      }
    }
  };

  // WebSocket for Live Prices
  const activePairs = trades.length > 0 ? trades : INITIAL_TRADES;
  // Ensure we don't try to stream invalid pairs like 'USDTUSDT'
  const streams = activePairs
    .filter(t => t.pair && t.pair !== 'USDT') 
    .map(t => `${t.pair.toLowerCase()}@miniTicker`)
    .join('/');

  useEffect(() => {
    if (streams.length === 0) return;

    if (wsRef.current) wsRef.current.close();
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    wsRef.current.onopen = () => {
      setWsStatus('connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s && data.c) {
        setPrices(prev => ({
          ...prev,
          [data.s]: parseFloat(data.c)
        }));
      }
    };

    wsRef.current.onerror = () => {
      setWsStatus('error');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [streams]);

  const closeTrade = (id: string) => {
    if (isApiMode) {
      alert("Trading actions are disabled in this view for security.");
    } else {
      setTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  const calculatePnL = (trade: Trade, currentPrice: number) => {
    // Spot Mode PnL: just Value - (Entry * Size) if we had entry. 
    // Since we don't have entry history easily in Spot API, we show Total Value
    if (trade.market === 'Spot') {
      const value = (trade.amount || 0) * currentPrice;
      return { pnlValue: value, pnlPercent: 0, isSpot: true };
    }

    // Futures Mode
    if (isApiMode && trade.pnl !== undefined) {
      const pnlValue = trade.pnl;
      const margin = trade.size / trade.leverage; 
      const pnlPercent = margin > 0 ? (pnlValue / margin) * 100 : 0;
      return { pnlValue, pnlPercent, isSpot: false };
    }

    // Mock Mode
    if (!currentPrice) return { pnlValue: 0, pnlPercent: 0, isSpot: false };

    let percentChange = 0;
    if (trade.type === 'Long') {
      percentChange = ((currentPrice - trade.entry) / trade.entry) * 100;
    } else {
      percentChange = ((trade.entry - currentPrice) / trade.entry) * 100;
    }

    const pnlPercent = percentChange * trade.leverage;
    const pnlValue = trade.size * (pnlPercent / 100);

    return { pnlValue, pnlPercent, isSpot: false };
  };

  return (
    <div className="bg-surface border border-slate-700 rounded-xl overflow-hidden mb-6 md:mb-8 shadow-md">
      <div className="p-3 md:p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
        <div className="flex items-center gap-2">
          {marketType === 'Spot' ? <Wallet className="w-4 h-4 md:w-5 md:h-5 text-purple-400" /> : <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />}
          <h3 className="font-bold text-sm md:text-base text-slate-100">
            {isApiMode ? `Binance ${marketType}` : 'Active Trades'}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] md:text-xs font-bold border border-blue-500/20">
            {trades.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono">
           <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
           <span className="text-slate-500 hidden sm:inline">{wsStatus === 'connected' ? 'LIVE DATA' : 'OFFLINE'}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-2 text-center text-xs text-rose-300 flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" /> {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto">
        {trades.length === 0 ? (
           <div className="p-6 md:p-8 text-center text-slate-500 text-xs md:text-sm">
             {isApiMode ? `No ${marketType} positions found.` : 'No active trades.'}
           </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[350px]">
            <thead>
              <tr className="bg-slate-900/50 text-[10px] md:text-xs uppercase text-slate-500 font-mono tracking-wider border-b border-slate-700">
                <th className="px-3 py-2 md:px-4 md:py-3 font-medium">Pair</th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-medium text-right hidden sm:table-cell">Type</th>
                {marketType !== 'Spot' && <th className="px-3 py-2 md:px-4 md:py-3 font-medium text-right hidden md:table-cell">Entry</th>}
                <th className="px-3 py-2 md:px-4 md:py-3 font-medium text-right">Price</th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-medium text-right hidden lg:table-cell">{marketType === 'Spot' ? 'Balance' : 'Margin'}</th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-medium text-right">P&L</th>
                <th className="px-3 py-2 md:px-4 md:py-3 font-medium text-center">X</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-xs md:text-sm">
              {trades.map(trade => {
                const currentPrice = prices[trade.pair] || trade.entry || 0;
                const { pnlValue, pnlPercent, isSpot } = calculatePnL(trade, currentPrice);
                const isProfit = pnlValue >= 0;

                return (
                  <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2 md:px-4 md:py-3 font-bold text-slate-200">
                      <div className="flex flex-col">
                        <span>{trade.pair}</span>
                        {/* Mobile Type Indicator */}
                        <span className={`sm:hidden text-[9px] font-normal ${trade.type === 'Long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {trade.type} {trade.leverage}x
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 md:px-4 md:py-3 text-right hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded ${
                        trade.type === 'Long' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {trade.type === 'Long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    
                    {!isSpot && (
                      <td className="px-3 py-2 md:px-4 md:py-3 text-right font-mono text-slate-400 hidden md:table-cell">
                        ${trade.entry.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                    )}

                    <td className="px-3 py-2 md:px-4 md:py-3 text-right font-mono text-slate-200">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    
                    <td className="px-3 py-2 md:px-4 md:py-3 text-right font-mono text-slate-400 hidden lg:table-cell">
                      {isSpot 
                        ? (trade.amount || 0).toFixed(4)
                        : <span>${Math.floor(trade.size)}</span>
                      }
                    </td>

                    <td className="px-3 py-2 md:px-4 md:py-3 text-right">
                      <div className={`font-bold font-mono ${isSpot ? 'text-slate-200' : (isProfit ? 'text-emerald-400' : 'text-rose-400')}`}>
                         {isSpot ? '' : (isProfit ? '+' : '')}{pnlValue.toFixed(1)}
                      </div>
                      {!isSpot && (
                        <div className={`text-[10px] ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                          {pnlPercent.toFixed(1)}%
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                      <button 
                        onClick={() => closeTrade(trade.id)}
                        className="p-1.5 md:p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-colors group"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OpenTrades;