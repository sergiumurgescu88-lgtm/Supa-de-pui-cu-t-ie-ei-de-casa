import React from 'react';
import { Strategy } from '../types';
import { TrendingUp, TrendingDown, Star, Activity, BarChart2 } from 'lucide-react';

interface StrategyCardProps {
  strategy: Strategy;
  onClick: (s: Strategy) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onClick }) => {
  const isShort = strategy.type === 'Short';
  const isCombined = strategy.type === 'Combined';
  
  let borderColor = 'border-emerald-500/30 hover:border-emerald-500';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400';
  let icon = <TrendingUp className="w-5 h-5 text-emerald-400" />;

  if (isShort) {
    borderColor = 'border-rose-500/30 hover:border-rose-500';
    badgeColor = 'bg-rose-500/10 text-rose-400';
    icon = <TrendingDown className="w-5 h-5 text-rose-400" />;
  } else if (isCombined) {
    borderColor = 'border-indigo-500/30 hover:border-indigo-500';
    badgeColor = 'bg-indigo-500/10 text-indigo-400';
    icon = <Activity className="w-5 h-5 text-indigo-400" />;
  }

  return (
    <div 
      onClick={() => onClick(strategy)}
      className={`bg-surface border ${borderColor} rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-black/40 group flex flex-col justify-between h-full`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 rounded-lg ${badgeColor} transition-colors group-hover:bg-opacity-20`}>
            {icon}
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < strategy.difficulty ? 'text-warning fill-warning' : 'text-slate-600'}`} 
              />
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-100 mb-1">{strategy.name}</h3>
        <p className="text-xs font-mono text-slate-400 mb-4">{strategy.type.toUpperCase()} STRATEGY</p>
        
        <p className="text-sm text-slate-300 mb-4 line-clamp-2">{strategy.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {strategy.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-700/50">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Win Rate</span>
          <span className="text-sm font-bold text-slate-200">{strategy.winRate}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Trades/Day</span>
          <span className="text-sm font-bold text-slate-200">{strategy.tradesPerDay}</span>
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;
