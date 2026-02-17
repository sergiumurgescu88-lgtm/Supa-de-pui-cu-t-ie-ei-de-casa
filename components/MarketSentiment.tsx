import React, { useEffect, useState } from 'react';
import { Gauge, ArrowUp, ArrowDown } from 'lucide-react';

const MarketSentiment: React.FC = () => {
  const [bullScore, setBullScore] = useState(6.5);
  const [bearScore, setBearScore] = useState(3.2);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBullScore(prev => Math.min(10, Math.max(0, prev + (Math.random() - 0.5))));
      setBearScore(prev => Math.min(10, Math.max(0, prev + (Math.random() - 0.5))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sentiment = bullScore > bearScore ? 'BULLISH' : 'BEARISH';
  const sentimentColor = bullScore > bearScore ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="bg-surface border border-slate-700 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Gauge className="w-24 h-24 text-white" />
      </div>

      <h3 className="text-slate-400 text-sm font-mono mb-6 uppercase tracking-wider">Market Sentiment (Smart Score)</h3>
      
      <div className="flex items-end gap-2 mb-2">
        <span className={`text-4xl font-bold ${sentimentColor}`}>{sentiment}</span>
        {bullScore > bearScore ? (
          <ArrowUp className="w-8 h-8 text-emerald-500 mb-1" />
        ) : (
          <ArrowDown className="w-8 h-8 text-rose-500 mb-1" />
        )}
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Bull Score</span>
            <span>{bullScore.toFixed(1)}/10</span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${bullScore * 10}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Bear Score</span>
            <span>{bearScore.toFixed(1)}/10</span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
             <div 
              className="h-full bg-rose-500 transition-all duration-1000 ease-out" 
              style={{ width: `${bearScore * 10}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">
          Recommendation: <span className="text-slate-300 font-bold">{bullScore > 7 ? 'LONG (Strategy 5)' : bearScore > 7 ? 'SHORT (Strategy 3)' : 'HOLD / WAIT'}</span>
        </p>
      </div>
    </div>
  );
};

export default MarketSentiment;
